import { useEffect, useState } from "react"
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
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
  created_at: string
  // Fetched separately after load
  tier_name?: string
  table_number?: number
}

// Safe string coercion — prevents objects from being rendered as JSX children
// which causes React error #130
const str = (val: unknown): string => {
  if (val === null || val === undefined) return ""
  if (typeof val === "string") return val
  if (typeof val === "number") return String(val)
  if (typeof val === "object") return JSON.stringify(val)
  return String(val)
}

// Safe color string — if a COLORS value is accidentally an object, fall back to "inherit"
const color = (val: unknown): string => {
  if (typeof val === "string") return val
  console.warn("COLORS value is not a string:", val)
  return "inherit"
}

export function ManualConfirmation() {
  const [reference, setReference] = useState("")
  const [transaction, setTransaction] = useState<PendingTransaction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])
  const [activeTab, setActiveTab] = useState<"confirm" | "resend">("confirm")

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
            .from("tiers")
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

        return { ...txn, tier_name, table_number }
      })
    )
  }

  const loadPendingTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id, reference, payment_status, total_kobo, quantity, group_booking_code, tier_id, table_id, created_at"
      )
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
        .select(
          "id, reference, payment_status, total_kobo, quantity, group_booking_code, tier_id, table_id, created_at"
        )
        .eq("reference", reference.trim())
        .single()

      if (error || !txn) {
        toaster.create({ title: "Transaction not found", type: "error" })
        setTransaction(null)
      } else {
        const [enriched] = await enrichWithTableAndTier([txn])
        setTransaction(enriched)
      }
    } catch (err) {
      console.error("searchTransaction error:", err)
      toaster.create({ title: "Search failed", type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  const confirmTransaction = async () => {
    if (!transaction) return

    setIsConfirming(true)
    try {
      const { data: attendees } = await supabase
        .from("attendees")
        .select("first_name, email, is_primary")
        .eq("transaction_id", transaction.id)

      const { data: table } = await supabase
        .from("gala_tables")
        .select("seats_booked, seats_total, table_number")
        .eq("id", transaction.table_id)
        .single()

      if (!attendees || !table) {
        toaster.create({ title: "Could not load transaction data", type: "error" })
        return
      }

      const pending: PendingBooking = {
        txnId: transaction.id,
        reference: transaction.reference,
        groupCode: transaction.group_booking_code,
        tierId: transaction.tier_id,
        tierName: transaction.tier_name ?? "",
        tableId: transaction.table_id,
        tableNumber: table.table_number,
        tableSeatsBooked: table.seats_booked,
        tableSeatsTotal: table.seats_total,
        quantity: transaction.quantity,
        attendees: attendees.map((a) => ({
          firstName: a.first_name,
          email: a.email,
          isPrimary: a.is_primary,
        })),
      }

      await confirmBooking(pending)

      toaster.create({
        title: "Confirmed!",
        description: `${transaction.quantity} tickets for ${transaction.group_booking_code}. Email sent.`,
        type: "success",
      })

      setReference("")
      setTransaction(null)
      await loadPendingTransactions()
    } catch (err) {
      console.error("confirmTransaction error:", err)
      toaster.create({ title: "Confirmation failed", type: "error" })
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Tab switcher */}
      <HStack spacing={2}>
        <Button
          size="sm"
          variant={activeTab === "confirm" ? "solid" : "outline"}
          colorScheme="orange"
          onClick={() => setActiveTab("confirm")}
        >
          Manual Recovery
        </Button>
        <Button
          size="sm"
          variant={activeTab === "resend" ? "solid" : "outline"}
          colorScheme="orange"
          onClick={() => setActiveTab("resend")}
        >
          Resend Emails
        </Button>
      </HStack>

      {activeTab === "confirm" ? (
        <VStack spacing={6} align="stretch">
          <Heading as="h2" size="lg" color={color(COLORS.GOLD_BASE)}>
            Manual Booking Recovery
          </Heading>

          <Card bg={color(COLORS.PANEL_MID)} borderColor={color(COLORS.ACCENT)} borderWidth={1}>
            <CardHeader borderBottomWidth={1} borderColor={color(COLORS.ACCENT)}>
              <Heading as="h3" size="md" color={color(COLORS.GOLD_BASE)}>
                Search Transaction
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text color={color(COLORS.TEXT)} fontSize="sm">
                  Enter a transaction reference to search for and manually confirm bookings that failed due to errors.
                </Text>
                <HStack w="100%">
                  <Input
                    placeholder="e.g., BUSA-2026-001..."
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchTransaction()}
                    bg={color(COLORS.INPUT_BG)}
                    color={color(COLORS.TEXT)}
                    borderColor={color(COLORS.ACCENT)}
                    _placeholder={{ color: color(COLORS.TEXT_MUTED) }}
                  />
                  <Button
                    onClick={searchTransaction}
                    isLoading={isLoading}
                    colorScheme="orange"
                    minW="120px"
                  >
                    Search
                  </Button>
                </HStack>

                {isLoading && <Spinner color={color(COLORS.GOLD_BASE)} />}

                {!isLoading && !transaction && reference.trim() && (
                  <Text color="red.500" fontSize="sm">
                    Transaction not found
                  </Text>
                )}

                {transaction && (
                  <Box
                    w="100%"
                    p={4}
                    bg={color(COLORS.BG)}
                    borderRadius="md"
                    borderColor={color(COLORS.ACCENT)}
                    borderWidth={1}
                  >
                    <SimpleGrid columns={2} spacing={3} mb={4}>
                      <Box>
                        <Text fontSize="xs" color={color(COLORS.TEXT_MUTED)} textTransform="uppercase">
                          Reference
                        </Text>
                        <Text color={color(COLORS.GOLD_BASE)} fontWeight="600">
                          {str(transaction.reference)}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={color(COLORS.TEXT_MUTED)} textTransform="uppercase">
                          Status
                        </Text>
                        <Badge colorScheme="orange">{str(transaction.payment_status)}</Badge>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={color(COLORS.TEXT_MUTED)} textTransform="uppercase">
                          Amount
                        </Text>
                        <Text color={color(COLORS.TEXT)}>
                          NGN {(transaction.total_kobo / 100).toLocaleString()}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={color(COLORS.TEXT_MUTED)} textTransform="uppercase">
                          Quantity
                        </Text>
                        <Text color={color(COLORS.TEXT)}>{Number(transaction.quantity)} tickets</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={color(COLORS.TEXT_MUTED)} textTransform="uppercase">
                          Tier
                        </Text>
                        <Text color={color(COLORS.TEXT)}>
                          {transaction.tier_name ? str(transaction.tier_name) : "—"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={color(COLORS.TEXT_MUTED)} textTransform="uppercase">
                          Table
                        </Text>
                        <Text color={color(COLORS.TEXT)}>
                          {transaction.table_number != null ? `Table ${transaction.table_number}` : "—"}
                        </Text>
                      </Box>
                    </SimpleGrid>

                    <Button
                      w="100%"
                      onClick={confirmTransaction}
                      isLoading={isConfirming}
                      colorScheme="green"
                      size="lg"
                    >
                      Confirm and Send Tickets
                    </Button>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {pendingTransactions.length > 0 && (
            <Card bg={color(COLORS.PANEL_MID)} borderColor={color(COLORS.ACCENT)} borderWidth={1}>
              <CardHeader borderBottomWidth={1} borderColor={color(COLORS.ACCENT)}>
                <Heading as="h3" size="md" color={color(COLORS.GOLD_BASE)}>
                  All Pending Transactions
                </Heading>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={1} spacing={3}>
                  {pendingTransactions.map((txn) => (
                    <Box
                      key={txn.id}
                      p={3}
                      bg={color(COLORS.BG)}
                      borderRadius="md"
                      borderColor={color(COLORS.ACCENT)}
                      borderWidth={1}
                      cursor="pointer"
                      onClick={() => {
                        setReference(txn.reference)
                        setTransaction(null)
                      }}
                      _hover={{ bg: `${color(COLORS.ACCENT)}20` }}
                    >
                      <HStack justify="space-between" mb={2}>
                        <Text color={color(COLORS.GOLD_BASE)} fontWeight="600" fontSize="sm">
                          {str(txn.reference)}
                        </Text>
                        <Badge colorScheme="orange">{str(txn.payment_status)}</Badge>
                      </HStack>
                      <Text color={color(COLORS.TEXT)} fontSize="xs">
                        {txn.tier_name ? str(txn.tier_name) : "—"} •{" "}
                        {Number(txn.quantity)} ticket(s) •{" "}
                        {txn.table_number != null ? `Table ${txn.table_number}` : "No table"}
                      </Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </CardBody>
            </Card>
          )}
        </VStack>
      ) : (
        <ResendEmails />
      )}
    </VStack>
  )
}
