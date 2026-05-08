import { useEffect, useState } from "react"
import { Box, VStack, HStack, Heading, Text, Input, Button, Card, CardBody, CardHeader, Spinner, Badge, SimpleGrid } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"
import { confirmBooking, type PendingBooking } from "@/lib/confirmBooking"
import { toaster } from "@/components/ui/toaster"
import { ResendEmails } from "./ResendEmails"

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
  const [activeTab, setActiveTab] = useState<"confirm" | "resend">("confirm")

  useEffect(() => {
    loadPendingTransactions()
  }, [])

  const loadPendingTransactions = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select("id, reference, payment_status, amount, quantity, group_code, tier_id, tier_name, table_id, table_number, created_at")
      .eq("payment_status", "pending")
      .order("created_at", { ascending: false })
      .limit(10)

    if (!error && data) {
      setPendingTransactions(data as PendingTransaction[])
    }
  }

  const searchTransaction = async () => {
    if (!reference.trim()) return

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
        setTransaction(txn as PendingTransaction)
      }
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
        .select("seats_booked, seats_total")
        .eq("id", transaction.table_id)
        .single()

      if (!attendees || !table) {
        toaster.create({ title: "Could not load transaction data", type: "error" })
        return
      }

      const pending: PendingBooking = {
        txnId: transaction.id,
        reference: transaction.reference,
        groupCode: transaction.group_code,
        tierId: transaction.tier_id,
        tierName: transaction.tier_name,
        tableId: transaction.table_id,
        tableNumber: transaction.table_number,
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
        description: `${transaction.quantity} tickets for ${transaction.group_code}. Email sent.`,
        type: "success",
      })

      setReference("")
      setTransaction(null)
      await loadPendingTransactions()
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      {activeTab === "confirm" ? (
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
              <VStack spacing={4} align="stretch">
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

                {isLoading && <Spinner color={COLORS.GOLD_BASE} />}

                {!isLoading && !transaction && reference && (
                  <Text color="red.500" fontSize="sm">
                    Transaction not found
                  </Text>
                )}

                {transaction && (
                  <Box w="100%" p={4} bg={COLORS.BG} borderRadius="md" borderColor={COLORS.ACCENT} borderWidth={1}>
                    <SimpleGrid columns={2} spacing={3} mb={4}>
                      <Box>
                        <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase">
                          Reference
                        </Text>
                        <Text color={COLORS.GOLD_BASE} fontWeight="600">
                          {transaction.reference}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase">
                          Status
                        </Text>
                        <Badge colorScheme="orange">{transaction.payment_status}</Badge>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase">
                          Amount
                        </Text>
                        <Text color={COLORS.TEXT}>NGN {transaction.amount.toLocaleString()}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase">
                          Quantity
                        </Text>
                        <Text color={COLORS.TEXT}>{transaction.quantity} tickets</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase">
                          Tier
                        </Text>
                        <Text color={COLORS.TEXT}>{transaction.tier_name}</Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase">
                          Table
                        </Text>
                        <Text color={COLORS.TEXT}>Table {transaction.table_number}</Text>
                      </Box>
                    </SimpleGrid>

                    <Button w="100%" onClick={confirmTransaction} isLoading={isConfirming} colorScheme="green" size="lg">
                      Confirm and Send Tickets
                    </Button>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

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
      ) : (
        <ResendEmails />
      )}
    </VStack>
  )
}
