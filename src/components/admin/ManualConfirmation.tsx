import { useEffect, useState } from "react"
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  CardRoot,
  CardHeader,
  CardBody,
  Spinner,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react"

import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"
import { confirmBooking, type PendingBooking } from "@/lib/confirmBooking"
import { toaster } from "@/components/ui/toaster"
import { ResendEmails } from "./ResendEmails"

interface PendingTransaction {
  id: string
  reference: string
  payment_status: string
  total_kobo: number
  quantity: number
  group_booking_code: string
  tier_id: string
  table_id: string
  primary_first_name?: string
  primary_last_name?: string
  primary_email?: string
  created_at: string
  tier_name?: string
  table_number?: number
}

const str = (val: unknown): string => {
  if (val === null || val === undefined) return ""
  if (typeof val === "string") return val
  if (typeof val === "number") return String(val)
  if (typeof val === "object") return JSON.stringify(val)
  return String(val)
}

export function ManualConfirmation() {
  const [reference, setReference] = useState("")
  const [transaction, setTransaction] =
    useState<PendingTransaction | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >([])

  const [activeTab, setActiveTab] = useState<
    "confirm" | "resend"
  >("confirm")

  useEffect(() => {
    loadPendingTransactions()
  }, [])

  const enrichWithTableAndTier = async (
    rows: Omit<
      PendingTransaction,
      "tier_name" | "table_number"
    >[]
  ): Promise<PendingTransaction[]> => {
    return Promise.all(
      rows.map(async (txn) => {
        let tier_name: string | undefined
        let table_number: number | undefined

        if (txn.tier_id) {
          const { data: tierData } = await supabase
            .from("ticket_tiers")
            .select("name")
            .eq("id", txn.tier_id)
            .single()

          tier_name = tierData?.name ?? undefined
        }

        if (txn.table_id) {
          const { data: tableData } = await supabase
            .from("gala_tables")
            .select("table_number")
            .eq("id", txn.table_id)
            .single()

          table_number =
            tableData?.table_number ?? undefined
        }

        return {
          ...txn,
          tier_name,
          table_number,
        }
      })
    )
  }

  const loadPendingTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        reference,
        payment_status,
        total_kobo,
        quantity,
        group_booking_code,
        tier_id,
        table_id,
        primary_first_name,
        primary_last_name,
        primary_email,
        created_at
      `)
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false })
      .limit(10)

    if (!error && data) {
      const enriched =
        await enrichWithTableAndTier(data)

      setPendingTransactions(enriched)
    }
  }

  const searchTransaction = async () => {
    if (!reference.trim()) return

    setIsLoading(true)
    setTransaction(null)

    try {
      const { data: txn, error } = await supabase
        .from("transactions")
        .select(`
          id,
          reference,
          payment_status,
          total_kobo,
          quantity,
          group_booking_code,
          tier_id,
          table_id,
          primary_first_name,
          primary_last_name,
          primary_email,
          created_at
        `)
        .eq("reference", reference.trim())
        .single()

      if (error || !txn) {
        toaster.create({
          title: "Transaction not found",
          type: "error",
        })

        setTransaction(null)
      } else {
        const [enriched] =
          await enrichWithTableAndTier([txn])

        setTransaction(enriched)
      }
    } catch (err) {
      console.error("searchTransaction error:", err)

      toaster.create({
        title: "Search failed",
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmTransaction = async () => {
    if (!transaction) return

    setIsConfirming(true)

    try {
      console.log("[ADMIN] Starting manual recovery")

      const { data: txn, error: txnError } =
        await supabase
          .from("transactions")
          .select("*")
          .eq("id", transaction.id)
          .single()

      if (txnError || !txn) {
        toaster.create({
          title: "Transaction not found",
          type: "error",
        })

        return
      }

      // Prevent duplicate confirmation
      if (txn.payment_status === "confirmed") {
        toaster.create({
          title: "Already confirmed",
          description:
            "This booking has already been confirmed.",
          type: "warning",
        })

        return
      }

      const { data: table, error: tableError } =
        await supabase
          .from("gala_tables")
          .select(`
            seats_booked,
            seats_total,
            table_number
          `)
          .eq("id", txn.table_id)
          .single()

      if (tableError || !table) {
        toaster.create({
          title: "Could not load table",
          type: "error",
        })

        return
      }

      // Prevent duplicate attendees
      const { data: existingAttendees } =
        await supabase
          .from("attendees")
          .select("id")
          .eq("transaction_id", txn.id)

      if (
        existingAttendees &&
        existingAttendees.length > 0
      ) {
        toaster.create({
          title: "Attendees already exist",
          description:
            "Tickets have already been generated for this booking.",
          type: "warning",
        })

        return
      }

      const attendees = [
        {
          firstName:
            txn.primary_first_name || "Guest",
          email: txn.primary_email,
          isPrimary: true,
        },
      ]

      for (let i = 1; i < txn.quantity; i++) {
        attendees.push({
          firstName: `Guest ${i + 1}`,
          email: txn.primary_email,
          isPrimary: false,
        })
      }

      const pending: PendingBooking = {
        txnId: txn.id,
        reference: txn.reference,
        groupCode: txn.group_booking_code,
        tierId: txn.tier_id,
        tierName: transaction.tier_name ?? "",
        tableId: txn.table_id,
        tableNumber: table.table_number,
        tableSeatsBooked: table.seats_booked,
        tableSeatsTotal: table.seats_total,
        quantity: txn.quantity,
        attendees,
      }

      await confirmBooking(
        pending,
        `manual_${Date.now()}`
      )

      toaster.create({
        title: "Booking confirmed",
        description:
          "Tickets created and confirmation emails sent.",
        type: "success",
      })

      setReference("")
      setTransaction(null)

      await loadPendingTransactions()
    } catch (err: any) {
      console.error("confirmTransaction error:", err)

      toaster.create({
        title: "Confirmation failed",
        description:
          err?.message || "Unknown error",
        type: "error",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <VStack gap={6} align="stretch">
      <HStack gap={2}>
        <Button
          size="sm"
          variant={
            activeTab === "confirm"
              ? "solid"
              : "outline"
          }
          colorPalette="orange"
          onClick={() =>
            setActiveTab("confirm")
          }
        >
          Manual Recovery
        </Button>

        <Button
          size="sm"
          variant={
            activeTab === "resend"
              ? "solid"
              : "outline"
          }
          colorPalette="orange"
          onClick={() =>
            setActiveTab("resend")
          }
        >
          Resend Emails
        </Button>
      </HStack>

      {activeTab === "confirm" ? (
        <VStack gap={6} align="stretch">
          <Heading
            as="h2"
            size="lg"
            color={COLORS.GOLD_BASE}
          >
            Manual Booking Recovery
          </Heading>

          <CardRoot
            style={{
              background: COLORS.PANEL_MID,
              border: `1px solid ${COLORS.GOLD_DIM}`,
            }}
          >
            <CardHeader>
              <Heading
                as="h3"
                size="md"
                color={COLORS.GOLD_BASE}
              >
                Search Transaction
              </Heading>
            </CardHeader>

            <CardBody>
              <VStack gap={4}>
                <HStack w="100%">
                  <Input
                    placeholder="GATSBY-..."
                    value={reference}
                    onChange={(e) =>
                      setReference(e.target.value)
                    }
                  />

                  <Button
                    onClick={searchTransaction}
                    loading={isLoading}
                    colorPalette="orange"
                  >
                    Search
                  </Button>
                </HStack>

                {transaction && (
                  <Button
                    w="100%"
                    size="lg"
                    colorPalette="green"
                    loading={isConfirming}
                    onClick={confirmTransaction}
                  >
                    Confirm and Send Tickets
                  </Button>
                )}
              </VStack>
            </CardBody>
          </CardRoot>

          <ResendEmails />
        </VStack>
      ) : (
        <ResendEmails />
      )}
    </VStack>
  )
}
