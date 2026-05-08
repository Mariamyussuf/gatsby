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
} from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"
import { confirmBooking, type PendingBooking } from "@/lib/confirmBooking"
import { toaster } from "@/components/ui/toaster"

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

  const confirmTransaction = async (txn: PendingTransaction) => {
    if (!txn) return

    setIsConfirming(true)
    try {
      // Get transaction details to build PendingBooking
      const { data: attendees } = await supabase
        .from("attendees")
        .select("first_name, email, is_primary")
        .eq("transaction_id", txn.id)

      const { data: table } = await supabase
        .from("gala_tables")
        .select("seats_booked, seats_total")
        .eq("id", txn.table_id)
        .single()

      if (!attendees || !table) {
        toaster.create({ title: "Could not load transaction data", type: "error" })
        return
      }

      // Build PendingBooking object
      const pending: PendingBooking = {
        txnId: txn.id,
        reference: txn.reference,
        groupCode: txn.group_code,
        tierId: txn.tier_id,
        tierName: txn.tier_name,
        tableId: txn.table_id,
        tableNumber: txn.table_number,
        tableSeatsBooked: table.seats_booked,
        tableSeatsTotal: table.seats_total,
        quantity: txn.quantity,
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
        description: `${txn.quantity} tickets for ${txn.group_code}. Confirmation email sent.`,
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
    <VStack spacing={6} w="100%">
      {/* Manual Search */}
      <Card w="100%" bg={`${COLORS.PANEL_MID}40`} borderColor={COLORS.ACCENT} borderWidth={1}>
        <CardHeader bg={`${COLORS.GOLD_GLOW}10`} borderBottomWidth={1} borderBottomColor={COLORS.ACCENT}>
          <Heading size="md" color={COLORS.GOLD_BASE}>
            Manual Transaction Confirmation
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
                    <Text color={COLORS.TEXT}>₦{transaction.amount.toLocaleString()}</Text>
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
                <Box mb={4} p={2} bg={`${COLORS.GOLD_GLOW}10`} borderRadius="sm">
                  <Text fontSize="sm" color={COLORS.TEXT}>
                    <strong>Group Code:</strong> {transaction.group_code}
                  </Text>
                  <Text fontSize="xs" color={COLORS.TEXT_MUTED}>
                    {transaction.attendees_count} attendee{transaction.attendees_count !== 1 ? "s" : ""} created
                  </Text>
                </Box>
                <Button
                  onClick={() => confirmTransaction(transaction)}
                  isLoading={isConfirming}
                  w="100%"
                  colorScheme="green"
                >
                  Confirm & Send Tickets
                </Button>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Pending Transactions List */}
      {pendingTransactions.length > 0 && (
        <Card w="100%" bg={`${COLORS.PANEL_MID}40`} borderColor={COLORS.ACCENT} borderWidth={1}>
          <CardHeader bg={`${COLORS.GOLD_GLOW}10`} borderBottomWidth={1} borderBottomColor={COLORS.ACCENT}>
            <Heading size="md" color={COLORS.GOLD_BASE}>
              All Pending Transactions ({pendingTransactions.length})
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {pendingTransactions.map((txn) => (
                <Box
                  key={txn.id}
                  p={3}
                  bg={COLORS.BG}
                  borderRadius="md"
                  borderLeft={`4px solid ${COLORS.GOLD_BASE}`}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Text color={COLORS.GOLD_BASE} fontWeight="600" fontSize="sm">
                      {txn.reference}
                    </Text>
                    <Text color={COLORS.TEXT} fontSize="xs">
                      {txn.tier_name} · {txn.quantity} ticket(s) · Table {txn.table_number}
                    </Text>
                  </Box>
                  <Button
                    size="sm"
                    colorScheme="green"
                    isLoading={isConfirming}
                    onClick={() => confirmTransaction(txn)}
                  >
                    Confirm
                  </Button>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  )
}
