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
  const [transaction, setTransaction] = useState<PendingTransaction | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  const [pendingTransactions, setPendingTransactions] = useState<
    PendingTransaction[]
  >([])

  const [activeTab, setActiveTab] = useState<"confirm" | "resend">(
    "confirm"
  )

  useEffect(() => {
    loadPendingTransactions()
  }, [])

  const enrichWithTableAndTier = async (
    rows: Omit<PendingTransaction, "tier_name" | "table_number">[]
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

          table_number = tableData?.table_number ?? undefined
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
      const enriched = await enrichWithTableAndTier(data)
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
        const [enriched] = await enrichWithTableAndTier([txn])

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

      // Fetch fresh transaction
      const { data: txn, error: txnError } = await supabase
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

      console.log("[ADMIN] Transaction loaded:", txn.reference)

      // Fetch table
      const { data: table, error: tableError } = await supabase
        .from("gala_tables")
        .select("seats_booked, seats_total, table_number")
        .eq("id", txn.table_id)
        .single()

      if (tableError || !table) {
        toaster.create({
          title: "Could not load table",
          type: "error",
        })

        return
      }

      console.log("[ADMIN] Table loaded")

      // Build attendees from transaction
      const attendees = [
        {
          firstName: txn.primary_first_name || "Guest",
          email: txn.primary_email,
          isPrimary: true,
        },
      ]

      // Create placeholder attendees if quantity > 1
      for (let i = 1; i < txn.quantity; i++) {
        attendees.push({
          firstName: `Guest ${i + 1}`,
          email: txn.primary_email,
          isPrimary: false,
        })
      }

      console.log("[ADMIN] Built attendees:", attendees)

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

      console.log("[ADMIN] Calling confirmBooking")

      await confirmBooking(
        pending,
        `manual_${Date.now()}`,
        {
          manually_confirmed: true,
          admin_panel: true,
        }
      )

      console.log("[ADMIN] Recovery complete")

      toaster.create({
        title: "Booking confirmed",
        description:
          "Tickets created and confirmation emails sent",
        type: "success",
      })

      setReference("")
      setTransaction(null)

      await loadPendingTransactions()
    } catch (err: any) {
      console.error("confirmTransaction error:", err)

      toaster.create({
        title: "Confirmation failed",
        description: err?.message || "Unknown error",
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
          variant={activeTab === "confirm" ? "solid" : "outline"}
          colorPalette="orange"
          onClick={() => setActiveTab("confirm")}
        >
          Manual Recovery
        </Button>

        <Button
          size="sm"
          variant={activeTab === "resend" ? "solid" : "outline"}
          colorPalette="orange"
          onClick={() => setActiveTab("resend")}
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
            <CardHeader
              style={{
                borderBottom: `1px solid ${COLORS.GOLD_DIM}`,
              }}
            >
              <Heading
                as="h3"
                size="md"
                color={COLORS.GOLD_BASE}
              >
                Search Transaction
              </Heading>
            </CardHeader>

            <CardBody>
              <VStack gap={4} align="stretch">
                <Text color={COLORS.TEXT} fontSize="sm">
                  Enter a transaction reference to manually
                  recover failed bookings.
                </Text>

                <HStack w="100%">
                  <Input
                    placeholder="e.g. GATSBY-177849..."
                    value={reference}
                    onChange={(e) =>
                      setReference(e.target.value)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      searchTransaction()
                    }
                    style={{
                      background: COLORS.PANEL_MID,
                      color: COLORS.TEXT,
                      borderColor: COLORS.GOLD_DIM,
                    }}
                  />

                  <Button
                    onClick={searchTransaction}
                    loading={isLoading}
                    colorPalette="orange"
                    minW="120px"
                  >
                    Search
                  </Button>
                </HStack>

                {isLoading && (
                  <Spinner color={COLORS.GOLD_BASE} />
                )}

                {!isLoading &&
                  !transaction &&
                  reference.trim() && (
                    <Text color="red.500" fontSize="sm">
                      Transaction not found
                    </Text>
                  )}

                {transaction && (
                  <Box
                    w="100%"
                    p={4}
                    style={{
                      background: COLORS.BG,
                      borderRadius: "4px",
                      border: `1px solid ${COLORS.GOLD_DIM}`,
                    }}
                  >
                    <SimpleGrid columns={2} gap={3} mb={4}>
                      <Box>
                        <Text
                          fontSize="xs"
                          color={COLORS.GOLD_DIM}
                          textTransform="uppercase"
                        >
                          Reference
                        </Text>

                        <Text
                          color={COLORS.GOLD_BASE}
                          fontWeight="600"
                        >
                          {str(transaction.reference)}
                        </Text>
                      </Box>

                      <Box>
                        <Text
                          fontSize="xs"
                          color={COLORS.GOLD_DIM}
                          textTransform="uppercase"
                        >
                          Status
                        </Text>

                        <Badge colorPalette="orange">
                          {str(transaction.payment_status)}
                        </Badge>
                      </Box>

                      <Box>
                        <Text
                          fontSize="xs"
                          color={COLORS.GOLD_DIM}
                          textTransform="uppercase"
                        >
                          Amount
                        </Text>

                        <Text color={COLORS.TEXT}>
                          NGN{" "}
                          {(
                            transaction.total_kobo / 100
                          ).toLocaleString()}
                        </Text>
                      </Box>

                      <Box>
                        <Text
                          fontSize="xs"
                          color={COLORS.GOLD_DIM}
                          textTransform="uppercase"
                        >
                          Quantity
                        </Text>

                        <Text color={COLORS.TEXT}>
                          {Number(transaction.quantity)} tickets
                        </Text>
                      </Box>

                      <Box>
                        <Text
                          fontSize="xs"
                          color={COLORS.GOLD_DIM}
                          textTransform="uppercase"
                        >
                          Tier
                        </Text>

                        <Text color={COLORS.TEXT}>
                          {transaction.tier_name || "—"}
                        </Text>
                      </Box>

                      <Box>
                        <Text
                          fontSize="xs"
                          color={COLORS.GOLD_DIM}
                          textTransform="uppercase"
                        >
                          Table
                        </Text>

                        <Text color={COLORS.TEXT}>
                          {transaction.table_number != null
                            ? `Table ${transaction.table_number}`
                            : "—"}
                        </Text>
                      </Box>

                      <Box>
                        <Text
                          fontSize="xs"
                          color={COLORS.GOLD_DIM}
                          textTransform="uppercase"
                        >
                          Primary Guest
                        </Text>

                        <Text color={COLORS.TEXT}>
                          {transaction.primary_first_name}{" "}
                          {transaction.primary_last_name}
                        </Text>
                      </Box>

                      <Box>
                        <Text
                          fontSize="xs"
                          color={COLORS.GOLD_DIM}
                          textTransform="uppercase"
                        >
                          Email
                        </Text>

                        <Text color={COLORS.TEXT}>
                          {transaction.primary_email}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    <Button
                      w="100%"
                      onClick={confirmTransaction}
                      loading={isConfirming}
                      colorPalette="green"
                      size="lg"
                    >
                      Confirm and Send Tickets
                    </Button>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </CardRoot>

          {pendingTransactions.length > 0 && (
            <CardRoot
              style={{
                background: COLORS.PANEL_MID,
                border: `1px solid ${COLORS.GOLD_DIM}`,
              }}
            >
              <CardHeader
                style={{
                  borderBottom: `1px solid ${COLORS.GOLD_DIM}`,
                }}
              >
                <Heading
                  as="h3"
                  size="md"
                  color={COLORS.GOLD_BASE}
                >
                  All Pending Transactions
                </Heading>
              </CardHeader>

              <CardBody>
                <SimpleGrid columns={1} gap={3}>
                  {pendingTransactions.map((txn) => (
                    <Box
                      key={txn.id}
                      p={3}
                      style={{
                        background: COLORS.BG,
                        borderRadius: "4px",
                        border: `1px solid ${COLORS.GOLD_DIM}`,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setReference(txn.reference)
                        setTransaction(null)
                      }}
                    >
                      <HStack
                        justify="space-between"
                        mb={2}
                      >
                        <Text
                          color={COLORS.GOLD_BASE}
                          fontWeight="600"
                          fontSize="sm"
                        >
                          {str(txn.reference)}
                        </Text>

                        <Badge colorPalette="orange">
                          {str(txn.payment_status)}
                        </Badge>
                      </HStack>

                      <Text
                        color={COLORS.TEXT}
                        fontSize="xs"
                      >
                        {txn.tier_name || "—"} •{" "}
                        {Number(txn.quantity)} ticket(s) •{" "}
                        {txn.table_number != null
                          ? `Table ${txn.table_number}`
                          : "No table"}
                      </Text>

                      <Text
                        color={COLORS.GOLD_DIM}
                        fontSize="xs"
                        mt={1}
                      >
                        {txn.primary_email}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </CardRoot>
          )}
        </VStack>
      ) : (
        <ResendEmails />
      )}
    </VStack>
  )
}
