import { useCallback, useEffect, useState } from "react"
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

export type ManualConfirmationProps = {
  presetReference?: string | null
  onPresetConsumed?: () => void
}

export function ManualConfirmation(props: ManualConfirmationProps = {}) {
  const { presetReference, onPresetConsumed } = props
  const [reference, setReference] = useState("")
  const [transaction, setTransaction] = useState<PendingTransaction | null>(null)
  const [existingAttendeeCount, setExistingAttendeeCount] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])

  const [activeTab, setActiveTab] = useState<"confirm" | "resend">("confirm")
  const [resendPrefill, setResendPrefill] = useState<string | null>(null)

  useEffect(() => {
    loadPendingTransactions()
  }, [])

  useEffect(() => {
    if (!transaction?.id) {
      setExistingAttendeeCount(0)
      return
    }
    let cancelled = false
    void (async () => {
      const { count, error } = await supabase
        .from("attendees")
        .select("id", { count: "exact", head: true })
        .eq("transaction_id", transaction.id)

      if (!cancelled && !error) {
        setExistingAttendeeCount(count ?? 0)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [transaction?.id])

  const enrichWithTableAndTier = async (
    rows: Omit<PendingTransaction, "tier_name" | "table_number">[],
  ): Promise<PendingTransaction[]> => {
    return Promise.all(
      rows.map(async (txn) => {
        let tier_name: string | undefined
        let table_number: number | undefined

        if (txn.tier_id) {
          const { data: tierData } = await supabase.from("ticket_tiers").select("name").eq("id", txn.tier_id).single()

          tier_name = tierData?.name ?? undefined
        }

        if (txn.table_id) {
          const { data: tableData } = await supabase.from("gala_tables").select("table_number").eq("id", txn.table_id).single()

          table_number = tableData?.table_number ?? undefined
        }

        return {
          ...txn,
          tier_name,
          table_number,
        }
      }),
    )
  }

  const loadPendingTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        `
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
      `,
      )
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false })
      .limit(50)

    if (!error && data) {
      const enriched = await enrichWithTableAndTier(data)
      setPendingTransactions(enriched)
    }
  }

  const searchTransactionByReference = useCallback(async (ref: string) => {
    const trimmed = ref.trim()
    if (!trimmed) return

    setIsLoading(true)
    setTransaction(null)

    try {
      const { data: txn, error } = await supabase
        .from("transactions")
        .select(
          `
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
        `,
        )
        .eq("reference", trimmed)
        .single()

      if (error || !txn) {
        toaster.create({
          title: "Transaction not found",
          type: "error",
        })
        setTransaction(null)
        return
      }

      const [enriched] = await enrichWithTableAndTier([txn])
      setTransaction(enriched)
    } catch (err) {
      console.error("searchTransaction error:", err)
      toaster.create({
        title: "Search failed",
        type: "error",
      })
      setTransaction(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!presetReference?.trim()) return
    const ref = presetReference.trim()
    setReference(ref)
    void searchTransactionByReference(ref)
    onPresetConsumed?.()
  }, [presetReference, searchTransactionByReference])

  const searchTransaction = () => {
    void searchTransactionByReference(reference)
  }

  const markTransactionConfirmedSync = async () => {
    if (!transaction) return
    if (transaction.payment_status !== "pending") {
      toaster.create({ title: "Only pending rows can be synced this way", type: "warning" })
      return
    }

    setIsConfirming(true)
    try {
      const { error } = await supabase
        .from("transactions")
        .update({
          payment_status: "confirmed",
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", transaction.id)
        .eq("payment_status", "pending")

      if (error) throw error

      toaster.create({
        title: "Transaction marked confirmed",
        description: "DB status updated. Use Resend emails if guests did not get mail.",
        type: "success",
      })

      setReference("")
      setTransaction(null)
      await loadPendingTransactions()
    } catch (err: unknown) {
      toaster.create({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        type: "error",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const confirmTransaction = async () => {
    if (!transaction) return

    setIsConfirming(true)

    try {
      const { data: txn, error: txnError } = await supabase.from("transactions").select("*").eq("id", transaction.id).single()

      if (txnError || !txn) {
        toaster.create({ title: "Transaction not found", type: "error" })
        return
      }

      if (txn.payment_status === "confirmed") {
        toaster.create({
          title: "Already confirmed",
          description: "Use Resend emails if they did not receive confirmation.",
          type: "warning",
        })
        return
      }

      const { data: table, error: tableError } = await supabase
        .from("gala_tables")
        .select(`seats_booked, seats_total, table_number`)
        .eq("id", txn.table_id)
        .single()

      if (tableError || !table) {
        toaster.create({ title: "Could not load table", type: "error" })
        return
      }

      const { data: existingAttendees } = await supabase.from("attendees").select("id").eq("transaction_id", txn.id)

      if (existingAttendees && existingAttendees.length > 0) {
        toaster.create({
          title: "Attendees already exist",
          description: "Use “Mark DB confirmed” if payment was received but status is still pending.",
          type: "warning",
        })
        return
      }

      const attendees = [
        {
          firstName: txn.primary_first_name || "Guest",
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

      await confirmBooking(pending, `manual_${Date.now()}`)

      toaster.create({
        title: "Booking confirmed",
        description: "Tickets created and confirmation emails triggered.",
        type: "success",
      })

      setReference("")
      setTransaction(null)
      await loadPendingTransactions()
    } catch (err: unknown) {
      console.error("confirmTransaction error:", err)
      toaster.create({
        title: "Confirmation failed",
        description: err instanceof Error ? err.message : "Unknown error",
        type: "error",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const openResendForCurrent = () => {
    if (!transaction?.group_booking_code) return
    setResendPrefill(transaction.group_booking_code)
    setActiveTab("resend")
  }

  return (
    <VStack gap={6} align="stretch">
      <Text fontSize="sm" color={COLORS.TEXT_MUTED} maxW="720px">
        When Squad or the callback misses a payment, search by reference, confirm to create tickets and email, or mark the
        row confirmed if tickets already exist. Use Resend when mail failed or was delayed.
      </Text>

      <HStack gap={2}>
        <Button
          size="sm"
          variant={activeTab === "confirm" ? "solid" : "outline"}
          colorPalette="orange"
          onClick={() => setActiveTab("confirm")}
        >
          Manual recovery
        </Button>

        <Button
          size="sm"
          variant={activeTab === "resend" ? "solid" : "outline"}
          colorPalette="orange"
          onClick={() => setActiveTab("resend")}
        >
          Resend emails
        </Button>
      </HStack>

      {activeTab === "confirm" ? (
        <VStack gap={6} align="stretch">
          <Heading as="h2" size="lg" color={COLORS.GOLD_BASE}>
            Manual booking recovery
          </Heading>

          <CardRoot
            style={{
              background: COLORS.PANEL_MID,
              border: `1px solid ${COLORS.GOLD_DIM}`,
            }}
          >
            <CardHeader>
              <Heading as="h3" size="md" color={COLORS.GOLD_BASE}>
                Search by payment reference
              </Heading>
            </CardHeader>

            <CardBody>
              <VStack gap={4}>
                <HStack w="100%">
                  <Input
                    placeholder="Payment reference (e.g. GATSBY-...)"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchTransaction()}
                  />

                  <Button onClick={searchTransaction} loading={isLoading} colorPalette="orange">
                    Search
                  </Button>
                </HStack>

                {transaction && (
                  <VStack gap={3} align="stretch" pt={2}>
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={3}>
                      <Box>
                        <Text fontSize="xs" color={COLORS.TEXT_MUTED}>
                          Status
                        </Text>
                        <Badge colorPalette={transaction.payment_status === "confirmed" ? "green" : "orange"}>
                          {transaction.payment_status}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={COLORS.TEXT_MUTED}>
                          Amount
                        </Text>
                        <Text color={COLORS.TEXT}>NGN {(transaction.total_kobo / 100).toLocaleString()}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={COLORS.TEXT_MUTED}>
                          Tier / table
                        </Text>
                        <Text color={COLORS.TEXT}>
                          {transaction.tier_name ?? "—"} · Table {transaction.table_number ?? "—"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={COLORS.TEXT_MUTED}>
                          Group code
                        </Text>
                        <Text color={COLORS.TEXT} fontFamily="mono" fontSize="sm">
                          {transaction.group_booking_code}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    {transaction.payment_status === "pending" && existingAttendeeCount === 0 && (
                      <Button w="100%" size="lg" colorPalette="green" loading={isConfirming} onClick={confirmTransaction}>
                        Confirm and send tickets
                      </Button>
                    )}

                    {transaction.payment_status === "pending" && existingAttendeeCount > 0 && (
                      <VStack gap={2} align="stretch">
                        <Text fontSize="sm" color={COLORS.TEXT_MUTED}>
                          {existingAttendeeCount} ticket row(s) already exist for this transaction, but payment is still{" "}
                          <strong>pending</strong>. If money was received, sync the database only (no duplicate tickets).
                        </Text>
                        <Button w="100%" colorPalette="orange" loading={isConfirming} onClick={markTransactionConfirmedSync}>
                          Mark transaction confirmed (sync DB)
                        </Button>
                      </VStack>
                    )}

                    {transaction.payment_status === "confirmed" && (
                      <Text fontSize="sm" color={COLORS.TEXT_MUTED}>
                        Already confirmed. Open Resend to mail confirmations again.
                      </Text>
                    )}

                    <HStack flexWrap="wrap" gap={2}>
                      <Button variant="outline" size="sm" onClick={openResendForCurrent}>
                        Open resend for this booking
                      </Button>
                    </HStack>
                  </VStack>
                )}
              </VStack>
            </CardBody>
          </CardRoot>

          {pendingTransactions.length > 0 && (
            <Box>
              <Heading as="h3" size="md" color={COLORS.GOLD_BASE} mb={3}>
                Recent pending transactions
              </Heading>
              <VStack gap={2} align="stretch">
                {pendingTransactions.map((t) => (
                  <HStack
                    key={t.id}
                    justify="space-between"
                    p={3}
                    borderRadius="md"
                    borderWidth={1}
                    borderColor={`${COLORS.GOLD_DIM}50`}
                    bg={`${COLORS.PANEL_DARK}80`}
                  >
                    <VStack align="start" gap={0}>
                      <Text fontFamily="mono" fontSize="sm" color={COLORS.GOLD_BRIGHT}>
                        {t.reference}
                      </Text>
                      <Text fontSize="xs" color={COLORS.TEXT_MUTED}>
                        {t.primary_first_name} {t.primary_last_name} · {t.primary_email}
                      </Text>
                    </VStack>
                    <Button size="sm" variant="outline" onClick={() => void searchTransactionByReference(t.reference)}>
                      Load
                    </Button>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
        </VStack>
      ) : (
        <ResendEmails
          prefill={resendPrefill}
          onPrefillConsumed={() => setResendPrefill(null)}
        />
      )}
    </VStack>
  )
}
