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
  attendees: { firstName: string; email: string; isPrimary: boolean }[]
}

function generateToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 16)}`
}

export const PENDING_BOOKING_KEY = "gatsby_pending_booking"

export async function confirmBooking(
  pending: PendingBooking,
  squadRef?: string
): Promise<{ groupCode: string; tierName: string; tableNumber: number; quantity: number }> {
  // Verify table still has space
  const { data: freshTable } = await supabase
    .from("gala_tables")
    .select("seats_booked, seats_total")
    .eq("id", pending.tableId)
    .single()

  if (freshTable && freshTable.seats_booked + pending.quantity > freshTable.seats_total) {
    throw new Error("TABLE_FULL")
  }

  // Mark transaction confirmed
  await supabase
    .from("transactions")
    .update({
      payment_status: "confirmed",
      squad_reference: squadRef ?? `direct_${Date.now()}`,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", pending.txnId)

  // Decrement seats via RPC (falls back to direct update)
  try {
    await supabase.rpc("increment_seats_booked", {
      p_table_id: pending.tableId,
      p_quantity: pending.quantity,
    })
  } catch {
    await supabase
      .from("gala_tables")
      .update({ seats_booked: pending.tableSeatsBooked + pending.quantity })
      .eq("id", pending.tableId)
  }

  // Create one attendee row per seat
  for (const att of pending.attendees) {
    const ticketId = `BUSA-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    const manageToken = generateToken()

    await supabase.from("attendees").insert({
      transaction_id: pending.txnId,
      tier_id: pending.tierId,
      table_id: pending.tableId,
      table_number: pending.tableNumber,
      first_name: att.firstName,
      last_name: att.isPrimary ? att.firstName : att.firstName,
      email: att.email,
      ticket_id: ticketId,
      group_booking_code: pending.groupCode,
      is_primary: att.isPrimary,
      transfer_locked: false,
      manage_token: manageToken,
    })

    // Create VVIP pickup record if applicable
    if (pending.tierName === "VVIP") {
      const { data: rec } = await supabase
        .from("attendees")
        .select("id")
        .eq("manage_token", manageToken)
        .single()
      if (rec) {
        await supabase.from("vvip_pickups").insert({ attendee_id: rec.id })
      }
    }
  }

  // Trigger confirmation emails (non-blocking)
  fetch(`${__SUPABASE_URL__}/functions/v1/send-confirmation-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${__SUPABASE_ANON_KEY__}`,
    },
    body: JSON.stringify({ groupCode: pending.groupCode, reference: pending.reference }),
  }).catch(() => {})

  return {
    groupCode: pending.groupCode,
    tierName: pending.tierName,
    tableNumber: pending.tableNumber,
    quantity: pending.quantity,
  }
}
