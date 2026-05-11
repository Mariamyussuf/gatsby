import { isPrestigePickupTier } from "@/config/constants"
import { supabase } from "@/lib/supabase"

declare const __SUPABASE_URL__: string
declare const __SUPABASE_ANON_KEY__: string

export interface PendingBooking {
  txnId: string
  reference: string
  groupCode: string
  tierId: string
  tierName: string
  tableId: string
  tableNumber: number
  tableSeatsBooked: number
  tableSeatsTotal: number
  quantity: number
  attendees: {
    firstName: string
    email: string
    isPrimary: boolean
  }[]
}

function generateToken(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 16)}`
}

export const PENDING_BOOKING_KEY =
  "gatsby_pending_booking"

export async function confirmBooking(
  pending: PendingBooking,
  squadRef?: string,
  squadPayload?: any
): Promise<{
  groupCode: string
  tierName: string
  tableNumber: number
  quantity: number
}> {
  try {
    console.log(
      "[BOOKING] Starting confirmation:",
      pending.reference
    )

    // Prevent duplicate confirmations
    const { data: existingTxn, error: existingTxnError } =
      await supabase
        .from("transactions")
        .select("payment_status")
        .eq("id", pending.txnId)
        .single()

    if (existingTxnError) {
      console.error(
        "[BOOKING] Failed to fetch transaction:",
        existingTxnError
      )

      throw existingTxnError
    }

    if (existingTxn?.payment_status === "confirmed") {
      console.log(
        "[BOOKING] Transaction already confirmed"
      )

      return {
        groupCode: pending.groupCode,
        tierName: pending.tierName,
        tableNumber: pending.tableNumber,
        quantity: pending.quantity,
      }
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 2000)
    )

    console.log(
      "[BOOKING] Checking table availability"
    )

    // Verify table still has space
    const {
      data: freshTable,
      error: tableFetchError,
    } = await supabase
      .from("gala_tables")
      .select(
        "seats_booked, seats_total, table_number"
      )
      .eq("id", pending.tableId)
      .single()

    if (tableFetchError || !freshTable) {
      console.error(
        "[BOOKING] Table fetch failed:",
        tableFetchError
      )

      throw tableFetchError
    }

    if (
      freshTable.seats_booked + pending.quantity >
      freshTable.seats_total
    ) {
      console.error("[BOOKING] Table full")

      throw new Error("TABLE_FULL")
    }

    // SOURCE OF TRUTH
    const safeTableNumber = freshTable.table_number

    console.log(
      "[BOOKING] Safe table number:",
      safeTableNumber
    )

    console.log("[BOOKING] Confirming transaction")

    // Confirm transaction
    const { error: txnError } = await supabase
      .from("transactions")
      .update({
        payment_status: "confirmed",
        squad_reference:
          squadRef ?? `direct_${Date.now()}`,
        squad_payload: squadPayload ?? {},
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", pending.txnId)

    if (txnError) {
      console.error(
        "[BOOKING] Transaction update failed:",
        txnError
      )

      throw txnError
    }

    console.log("[BOOKING] Transaction confirmed")

    // Increment seats
    console.log("[BOOKING] Updating table seats")

    try {
      const { error: rpcError } = await supabase.rpc(
        "increment_seats_booked",
        {
          p_table_id: pending.tableId,
          p_quantity: pending.quantity,
        }
      )

      if (rpcError) {
        throw rpcError
      }

      console.log(
        "[BOOKING] Seat RPC update successful"
      )
    } catch (rpcErr) {
      console.warn(
        "[BOOKING] RPC failed, using fallback update:",
        rpcErr
      )

      const { error: fallbackError } = await supabase
        .from("gala_tables")
        .update({
          seats_booked:
            pending.tableSeatsBooked +
            pending.quantity,
        })
        .eq("id", pending.tableId)

      if (fallbackError) {
        console.error(
          "[BOOKING] Fallback seat update failed:",
          fallbackError
        )

        throw fallbackError
      }

      console.log(
        "[BOOKING] Fallback seat update successful"
      )
    }

    // Create attendees
    console.log("[BOOKING] Creating attendees")

    for (const att of pending.attendees) {
      const ticketId = `BUSA-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase()}`

      const manageToken = generateToken()

      const attendeePayload = {
        transaction_id: pending.txnId,
        tier_id: pending.tierId,
        table_id: pending.tableId,
        table_number: safeTableNumber,
        first_name: att.firstName,
        last_name: att.firstName,
        email: att.email,
        ticket_id: ticketId,
        group_booking_code: pending.groupCode,
        is_primary: att.isPrimary,
        transfer_locked: false,
        manage_token: manageToken,
      }

      console.log(
        "[BOOKING] Inserting attendee:",
        attendeePayload
      )

      const { error: attendeeError } = await supabase
        .from("attendees")
        .insert(attendeePayload)

      if (attendeeError) {
        console.error(
          "[BOOKING] Attendee insert failed:",
          attendeeError
        )

        throw attendeeError
      }

      console.log(
        "[BOOKING] Attendee created:",
        att.email
      )

      // Create prestige-tier pickup if needed (Prestige Circle in prod; VVIP in legacy seed)
      if (isPrestigePickupTier(pending.tierName)) {
        const { data: rec, error: recError } =
          await supabase
            .from("attendees")
            .select("id")
            .eq("manage_token", manageToken)
            .single()

        if (recError) {
          console.error(
            "[BOOKING] Failed to fetch VVIP attendee:",
            recError
          )

          throw recError
        }

        if (rec) {
          const { error: pickupError } =
            await supabase
              .from("vvip_pickups")
              .insert({
                attendee_id: rec.id,
              })

          if (pickupError) {
            console.error(
              "[BOOKING] VVIP pickup insert failed:",
              pickupError
            )

            throw pickupError
          }

          console.log(
            "[BOOKING] VVIP pickup created"
          )
        }
      }
    }

    console.log("[BOOKING] All attendees created")

    // Send emails
    setTimeout(async () => {
      try {
        console.log(
          "[BOOKING] Triggering confirmation emails"
        )

        const res = await fetch(
          `${__SUPABASE_URL__}/functions/v1/send-confirmation-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${__SUPABASE_ANON_KEY__}`,
              apikey: __SUPABASE_ANON_KEY__,
            },
            body: JSON.stringify({
              groupCode: pending.groupCode,
              reference: pending.reference,
            }),
          }
        )

        const text = await res.text()

        console.log(
          "[BOOKING] Email function status:",
          res.status
        )

        console.log(
          "[BOOKING] Email function response:",
          text
        )
      } catch (emailErr: any) {
        console.warn(
          "[BOOKING] Email trigger failed:",
          emailErr?.message || emailErr
        )
      }
    }, 500)

    console.log(
      "[BOOKING] Booking confirmation completed successfully"
    )

    return {
      groupCode: pending.groupCode,
      tierName: pending.tierName,
      tableNumber: safeTableNumber,
      quantity: pending.quantity,
    }
  } catch (err: any) {
    console.error(
      "[BOOKING] Fatal confirmation error:",
      err
    )

    throw new Error(
      err?.message || "Failed to confirm booking"
    )
  }
}
