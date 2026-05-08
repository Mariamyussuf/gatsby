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
  Textarea,
  Tabs,
} from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"
import { confirmBooking, type PendingBooking } from "@/lib/confirmBooking"
import { toaster } from "@/components/ui/toaster"
import { ResendEmails } from "./ResendEmails"

declare const __SUPABASE_URL__: string
declare const __SUPABASE_ANON_KEY__: string

interface PendingTransaction {
  id: string
  reference: string
  payment_status: string
  amount: number
  quantity: number
  group_code: string
  tier_id: string
  tier_name: string
  table_id: string
  table_number: number
  attendees_count: number
  created_at: string
}

export function ManualConfirmation() {
  const [activeTab, setActiveTab] = useState<"confirm" | "resend">("confirm")
  const [reference, setReference] = useState("")
  const [transaction, setTransaction] = useState<PendingTransaction | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([])

  // Load all pending transactions on mount
  useEffect(() => {
    loadPendingTransactions()
  }, [])

  const loadPendingTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, reference, payment_status, amount, quantity, group_code, tier_id, tier_name, table_id, table_number, created_at")
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false })

    if (data) {
      const withCounts = await Promise.all(
        data.map(async (t) => {
          const { count } = await supabase
            .from("attendees")
            .select("*", { count: "exact", head: true })
            .eq("transaction_id", t.id)

          return {
            ...t,
            attendees_count: count ?? 0,
          }
        })
      )
      setPendingTransactions(withCounts as PendingTransaction[])
    }
  }

  const searchTransaction = async () => {
    if (!reference.trim()) {
      toaster.create({ title: "Please enter a transaction reference", type: "error" })
      return
    }

    setIsLoading(true)
    try {
      const { data: txn, error } = await supabase
        .from("transactions")
        .select("id, reference, payment_status, amount, quantity, group_code, tier_id, tier_name, table_id, table_number, created_at")
        .eq("reference", reference.trim())
        .single()

      if (error || !txn) {
        toaster.create({ title: "Transaction not found", type: "error" })
        setTransaction(null)
      } else {
        const { count } = await supabase
          .from("attendees")
          .select("*", { count: "exact", head: true })
          .eq("transaction_id", txn.id)

        setTransaction({
          ...txn,
          attendees_count: count ?? 0,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const confirmTransaction = async (txn?: PendingTransaction) => {
    const targetTxn = txn || transaction
    if (!targetTxn) return

    setIsConfirming(true)
    try {
      // Get transaction details to build PendingBooking
      const { data: attendees } = await supabase
        .from("attendees")
        .select("first_name, email, is_primary")
        .eq("transaction_id", targetTxn.id)

      const { data: table } = await supabase
        .from("gala_tables")
        .select("seats_booked, seats_total")
        .eq("id", targetTxn.table_id)
        .single()

      if (!attendees || !table) {
        toaster.create({ title: "Could not load transaction data", type: "error" })
        return
      }

      // Build PendingBooking object
      const pending: PendingBooking = {
        txnId: targetTxn.id,
        reference: targetTxn.reference,
        groupCode: targetTxn.group_code,
        tierId: targetTxn.tier_id,
        tierName: targetTxn.tier_name,
        tableId: targetTxn.table_id,
        tableNumber: targetTxn.table_number,
        tableSeatsBooked: table.seats_booked,
        tableSeatsTotal: table.seats_total,
        quantity: targetTxn.quantity,
        attendees: attendees.map((a) => ({
          firstName: a.first_name,
          email: a.email,
          isPrimary: a.is_primary,
        })),
      }

      // Confirm the booking
      await confirmBooking(pending)

      toaster.create({
        title: `✓ Confirmed!`,
        description: `${targetTxn.quantity} tickets for ${targetTxn.group_code}. Confirmation email sent.`,
        type: "success",
      })

      setTransaction(null)
      setReference("")
      loadPendingTransactions()
    } catch (err: any) {
      console.error("Confirmation error:", err)
      toaster.create({
        title: "Confirmation failed",
        description: err.message === "TABLE_FULL" ? "Table is full" : err.message,
        type: "error",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
        <Tabs.List>
          <Tabs.Trigger value="confirm">Confirm Bookings</Tabs.Trigger>
          <Tabs.Trigger value="resend">Resend Emails</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="confirm">
          <VStack spacing={6} align="stretch">
            <Heading as="h2" size="lg" color={COLORS.GOLD_BASE}>
              Manual Booking Recovery
            </Heading>

            <Card bg={COLORS.PANEL_MID} borderColor={COLORS.ACCENT} borderWidth={1}>
              <CardHeader borderBottomWidth={1} borderColor={COLORS.ACCENT}>
                <Heading as="h3" size="md" color={COLORS.GOLD_BASE}>
                  Search Transaction
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4}>
                  <Text color={COLORS.TEXT} fontSize="sm">
                    Enter a transaction reference to search for and manually confirm bookings that failed due to errors.
                  </Text>
                  <HStack w="100%">
                    <Input
                      placeholder="e.g., BUSA-2026-001..."
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchTransaction()}
                      bg={COLORS.INPUT_BG}
                      color={COLORS.TEXT}
                      borderColor={COLORS.ACCENT}
                      _placeholder={{ color: COLORS.TEXT_MUTED }}
                    />
                    <Button onClick={searchTransaction} isLoading={isLoading} colorScheme="orange" minW="120px">
                      Search
                    </Button>
                  </HStack>

                  {transaction && (
                    <Box w="100%" p={4} bg={COLORS.BG} borderRadius="md" borderColor={COLORS.ACCENT} borderWidth={1}>
                      <SimpleGrid columns={2} spacing={2} mb={4}>
                        <Box>
                          <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase" letterSpacing="0.05em">
                            Reference
                          </Text>
                          <Text color={COLORS.GOLD_BASE} fontWeight="600">
                            {transaction.reference}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase" letterSpacing="0.05em">
                            Status
                          </Text>
                          <Badge colorScheme="orange">{transaction.payment_status}</Badge>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase" letterSpacing="0.05em">
                            Amount
                          </Text>
                          <Text color={COLORS.TEXT}>NGN {transaction.amount.toLocaleString()}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase" letterSpacing="0.05em">
                            Quantity
                          </Text>
                          <Text color={COLORS.TEXT}>{transaction.quantity} tickets</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase" letterSpacing="0.05em">
                            Tier
                          </Text>
                          <Text color={COLORS.TEXT}>{transaction.tier_name}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase" letterSpacing="0.05em">
                            Table
                          </Text>
                          <Text color={COLORS.TEXT}>Table {transaction.table_number}</Text>
                        </Box>
                      </SimpleGrid>
                    </Box>
                  )}

                  {isLoading && <Spinner color={COLORS.GOLD_BASE} />}
                  {!transaction && !isLoading && reference && (
                    <Text color="red.500" fontSize="sm">
                      Transaction not found
                    </Text>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {transaction && (
              <Card bg={COLORS.PANEL_MID} borderColor={COLORS.ACCENT} borderWidth={1}>
                <CardBody>
                  <Button
                    w="100%"
                    onClick={confirmTransaction}
                    isLoading={isConfirming}
                    colorScheme="green"
                    size="lg"
                  >
                    Confirm & Send Tickets
                  </Button>
                </CardBody>
              </Card>
            )}

            {pendingTransactions.length > 0 && (
              <Card bg={COLORS.PANEL_MID} borderColor={COLORS.ACCENT} borderWidth={1}>
                <CardHeader borderBottomWidth={1} borderColor={COLORS.ACCENT}>
                  <Heading as="h3" size="md" color={COLORS.GOLD_BASE}>
                    All Pending Transactions
                  </Heading>
                </CardHeader>
                <CardBody>
                  <SimpleGrid columns={1} spacing={3}>
                    {pendingTransactions.map((txn) => (
                      <Box
                        key={txn.id}
                        p={3}
                        bg={COLORS.BG}
                        borderRadius="md"
                        borderColor={COLORS.ACCENT}
                        borderWidth={1}
                        cursor="pointer"
                        onClick={() => setReference(txn.reference)}
                        _hover={{ bg: `${COLORS.ACCENT}20` }}
                      >
                        <HStack justify="space-between" mb={2}>
                          <Text color={COLORS.GOLD_BASE} fontWeight="600" fontSize="sm">
                            {txn.reference}
                          </Text>
                          <Badge colorScheme="orange">{txn.payment_status}</Badge>
                        </HStack>
                        <Text color={COLORS.TEXT} fontSize="xs">
                          {txn.tier_name} • {txn.quantity} ticket(s) • Table {txn.table_number}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>
            )}
          </VStack>
        </Tabs.Content>

        <Tabs.Content value="resend">
          <ResendEmails />
        </Tabs.Content>
      </Tabs>
    </VStack>
  )
}
