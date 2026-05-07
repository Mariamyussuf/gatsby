import { useEffect, useState } from "react"
import { Box, VStack, HStack, Text, Input, Button } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"
import { confirmBooking, type PendingBooking } from "@/lib/confirmBooking"
import { toaster } from "@/components/ui/toaster"

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

  useEffect(() => {
    loadPendingTransactions()
  }, [])

  const loadPendingTransactions = async () => {
    const { data } = await supabase
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
          return { ...t, attendees_count: count ?? 0 }
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
        setTransaction({ ...txn, attendees_count: count ?? 0 })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const confirmTransaction = async (txn: PendingTransaction) => {
    if (!txn) return
    setIsConfirming(true)
    try {
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
      toaster.create({
        title: "Confirmation failed",
        description: err.message === "TABLE_FULL" ? "Table is full" : err.message,
        type: "error",
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const labelStyle = {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "0.5rem",
    letterSpacing: "0.2em",
    color: COLORS.GOLD_DIM,
    textTransform: "uppercase" as const,
    marginBottom: "2px",
  }

  const valueStyle = {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "0.7rem",
    color: COLORS.GOLD_BASE,
  }

  return (
    <VStack gap="6" w="100%">
      {/* Manual Search Card */}
      <Box
        w="100%"
        style={{
          border: `1px solid ${COLORS.GOLD_DIM}40`,
          background: `${COLORS.PANEL_MID}40`,
          borderRadius: "4px",
        }}
      >
        {/* Card Header */}
        <Box
          px="5" py="4"
          style={{
            borderBottom: `1px solid ${COLORS.GOLD_DIM}30`,
            background: `${COLORS.GOLD_DIM}08`,
          }}
        >
          <Text style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.1rem",
            fontWeight: "600",
            color: COLORS.GOLD_BASE,
            letterSpacing: "0.05em",
          }}>
            Manual Transaction Confirmation
          </Text>
        </Box>

        {/* Card Body */}
        <Box px="5" py="4">
          <VStack gap="4">
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", color: COLORS.GOLD_DIM, letterSpacing: "0.05em" }}>
              Enter a transaction reference to search for and manually confirm bookings that failed due to errors.
            </Text>

            <HStack w="100%" gap="3">
              <Input
                placeholder="e.g., GATSBY-2026-001..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchTransaction()}
                style={{
                  background: `${COLORS.PANEL_MID}60`,
                  border: `1px solid ${COLORS.GOLD_DIM}40`,
                  color: COLORS.GOLD_BASE,
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "0.75rem",
                }}
              />
              <Button
                onClick={searchTransaction}
                loading={isLoading}
                style={{
                  background: COLORS.GOLD_BASE,
                  color: COLORS.BG,
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  minWidth: "100px",
                  cursor: "pointer",
                }}
              >
                Search
              </Button>
            </HStack>

            {transaction && (
              <Box
                w="100%"
                p="4"
                style={{
                  background: COLORS.BG,
                  border: `1px solid ${COLORS.GOLD_DIM}30`,
                  borderRadius: "4px",
                }}
              >
                {/* 2-col grid */}
                <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <Box>
                    <Text style={labelStyle}>Reference</Text>
                    <Text style={{ ...valueStyle, color: COLORS.GOLD_BRIGHT }}>{transaction.reference}</Text>
                  </Box>
                  <Box>
                    <Text style={labelStyle}>Status</Text>
                    <Box as="span" style={{
                      display: "inline-block",
                      background: "#F9731620",
                      color: "#F97316",
                      fontSize: "0.5rem",
                      fontFamily: "'Josefin Sans', sans-serif",
                      border: "1px solid #F9731640",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      padding: "2px 6px",
                      borderRadius: "2px",
                    }}>
                      {transaction.payment_status}
                    </Box>
                  </Box>
                  <Box>
                    <Text style={labelStyle}>Amount</Text>
                    <Text style={valueStyle}>₦{transaction.amount.toLocaleString()}</Text>
                  </Box>
                  <Box>
                    <Text style={labelStyle}>Quantity</Text>
                    <Text style={valueStyle}>{transaction.quantity} tickets</Text>
                  </Box>
                  <Box>
                    <Text style={labelStyle}>Tier</Text>
                    <Text style={valueStyle}>{transaction.tier_name}</Text>
                  </Box>
                  <Box>
                    <Text style={labelStyle}>Table</Text>
                    <Text style={valueStyle}>Table {transaction.table_number}</Text>
                  </Box>
                </Box>

                <Box
                  mb="3" p="2"
                  style={{ background: `${COLORS.GOLD_DIM}10`, borderRadius: "2px" }}
                >
                  <Text style={{ ...valueStyle, fontSize: "0.65rem" }}>
                    <strong>Group Code:</strong> {transaction.group_code}
                  </Text>
                  <Text style={{ ...valueStyle, fontSize: "0.6rem", color: COLORS.GOLD_DIM }}>
                    {transaction.attendees_count} attendee{transaction.attendees_count !== 1 ? "s" : ""} created
                  </Text>
                </Box>

                <Button
                  onClick={() => confirmTransaction(transaction)}
                  loading={isConfirming}
                  style={{
                    width: "100%",
                    background: "#22c55e20",
                    color: "#22c55e",
                    border: "1px solid #22c55e40",
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                  }}
                >
                  Confirm & Send Tickets
                </Button>
              </Box>
            )}
          </VStack>
        </Box>
      </Box>

      {/* Pending Transactions List */}
      {pendingTransactions.length > 0 && (
        <Box
          w="100%"
          style={{
            border: `1px solid ${COLORS.GOLD_DIM}40`,
            background: `${COLORS.PANEL_MID}40`,
            borderRadius: "4px",
          }}
        >
          <Box
            px="5" py="4"
            style={{ borderBottom: `1px solid ${COLORS.GOLD_DIM}30`, background: `${COLORS.GOLD_DIM}08` }}
          >
            <Text style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.1rem",
              fontWeight: "600",
              color: COLORS.GOLD_BASE,
            }}>
              All Pending Transactions ({pendingTransactions.length})
            </Text>
          </Box>

          <Box px="5" py="4">
            <VStack gap="3" align="stretch">
              {pendingTransactions.map((txn) => (
                <Box
                  key={txn.id}
                  p="3"
                  style={{
                    background: COLORS.BG,
                    borderRadius: "4px",
                    borderLeft: `4px solid ${COLORS.GOLD_BASE}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Text style={{ ...valueStyle, color: COLORS.GOLD_BRIGHT, fontWeight: "600" }}>
                      {txn.reference}
                    </Text>
                    <Text style={{ ...valueStyle, fontSize: "0.6rem", color: COLORS.GOLD_DIM }}>
                      {txn.tier_name} · {txn.quantity} ticket(s) · Table {txn.table_number}
                    </Text>
                  </Box>
                  <button
                    onClick={() => confirmTransaction(txn)}
                    disabled={isConfirming}
                    style={{
                      background: isConfirming ? `${COLORS.GOLD_DIM}20` : "#22c55e20",
                      color: "#22c55e",
                      border: "1px solid #22c55e40",
                      borderRadius: "2px",
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.55rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      padding: "4px 10px",
                      cursor: isConfirming ? "not-allowed" : "pointer",
                      opacity: isConfirming ? 0.6 : 1,
                    }}
                  >
                    {isConfirming ? "Confirming…" : "Confirm"}
                  </button>
                </Box>
              ))}
            </VStack>
          </Box>
        </Box>
      )}
    </VStack>
  )
}
