import { useState, useEffect } from "react"
import {
  Box,
  Text,
  Input,
  Button,
  Badge,
  HStack,
  VStack,
  Table,
} from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import Papa from "papaparse"

type TransactionRow = {
  id: string
  reference: string
  squad_reference: string | null
  primary_email: string
  primary_first_name: string
  primary_last_name: string
  quantity: number
  total_kobo: number
  payment_status: string
  created_at: string
  confirmed_at: string | null
  tier_name?: string
  group_booking_code: string
}

export function TransactionsList() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed">("all")
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const { data } = await supabase
      .from("transactions")
      .select(`
        *,
        ticket_tiers (name)
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setTransactions(
        data.map((row: any) => ({
          ...row,
          tier_name: row.ticket_tiers?.name,
        }))
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const ch = supabase.channel("admin-transactions")
      .on("postgres_changes", { event: "*", schema: "public", table: "transactions" }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const filtered = transactions
    .filter((t) => {
      if (filterStatus !== "all" && t.payment_status !== filterStatus) return false
      const q = search.toLowerCase()
      return (
        t.primary_email.toLowerCase().includes(q) ||
        t.primary_first_name.toLowerCase().includes(q) ||
        t.primary_last_name.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.group_booking_code.toLowerCase().includes(q)
      )
    })

  const exportCsv = () => {
    const csv = Papa.unparse(
      filtered.map((t) => ({
        "Group Code": t.group_booking_code,
        "Reference": t.reference,
        "Squad Reference": t.squad_reference || "—",
        "Primary Name": `${t.primary_first_name} ${t.primary_last_name}`,
        "Email": t.primary_email,
        "Tier": t.tier_name,
        "Quantity": t.quantity,
        "Total": `₦${(t.total_kobo / 100).toLocaleString()}`,
        "Status": t.payment_status,
        "Booked At": new Date(t.created_at).toLocaleString(),
        "Confirmed At": t.confirmed_at ? new Date(t.confirmed_at).toLocaleString() : "—",
      }))
    )
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `busa-gala-transactions-${Date.now()}.csv`
    a.click()
  }

  const thStyle = {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "0.55rem",
    letterSpacing: "0.2em",
    color: COLORS.GOLD_DIM,
    textTransform: "uppercase" as const,
    padding: "8px 12px",
    borderBottom: `1px solid ${COLORS.GOLD_DIM}30`,
    whiteSpace: "nowrap" as const,
  }

  const tdStyle = {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "0.65rem",
    color: COLORS.GOLD_BASE,
    padding: "8px 12px",
    borderBottom: `1px solid ${COLORS.GOLD_DIM}15`,
    whiteSpace: "nowrap" as const,
  }

  const pendingCount = transactions.filter((t) => t.payment_status === "pending").length
  const confirmedCount = transactions.filter((t) => t.payment_status === "confirmed").length

  return (
    <VStack gap="4" align="stretch">
      {/* Stats */}
      <HStack gap="4">
        <Box p="3" style={{ border: `1px solid ${COLORS.GOLD_DIM}40`, background: `${COLORS.PANEL_MID}40` }}>
          <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.5rem", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>All Transactions</Text>
          <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: "700", color: COLORS.GOLD_BRIGHT }}>{transactions.length}</Text>
        </Box>
        <Box p="3" style={{ border: `1px solid ${COLORS.GOLD_DIM}40`, background: `${COLORS.PANEL_MID}40` }}>
          <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.5rem", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>Confirmed</Text>
          <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: "700", color: "#22c55e" }}>{confirmedCount}</Text>
        </Box>
        <Box p="3" style={{ border: `1px solid ${COLORS.GOLD_DIM}40`, background: `${COLORS.PANEL_MID}40` }}>
          <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.5rem", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>Pending / Abandoned</Text>
          <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.5rem", fontWeight: "700", color: "#F97316" }}>{pendingCount}</Text>
        </Box>
      </HStack>

      {/* Filters */}
      <HStack gap="4">
        <Input
          placeholder="Search by email, name, reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          flex="1"
          style={{
            background: `${COLORS.PANEL_MID}60`,
            border: `1px solid ${COLORS.GOLD_DIM}40`,
            color: COLORS.GOLD_BASE,
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.75rem",
          }}
        />
        <HStack gap="2">
          {(["all", "confirmed", "pending"] as const).map((status) => (
            <Button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                background: filterStatus === status ? COLORS.GOLD_BASE : "transparent",
                color: filterStatus === status ? COLORS.BG : COLORS.GOLD_BASE,
                border: `1px solid ${COLORS.GOLD_DIM}60`,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                cursor: "pointer",
                padding: "6px 12px",
              }}
            >
              {status}
            </Button>
          ))}
        </HStack>
        <Button
          onClick={exportCsv}
          style={{
            background: "transparent",
            border: `1px solid ${COLORS.GOLD_DIM}60`,
            color: COLORS.GOLD_BASE,
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            cursor: "pointer",
            height: "40px",
            padding: "0 16px",
            whiteSpace: "nowrap",
          }}
        >
          Export CSV
        </Button>
      </HStack>

      <Text
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.6rem",
          color: COLORS.GOLD_DIM,
          letterSpacing: "0.1em",
        }}
      >
        {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found
      </Text>

      <Box overflowX="auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Group Code", "Reference", "Name", "Email", "Qty", "Amount", "Status", "Confirmed"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: "20px" }}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...tdStyle, textAlign: "center", padding: "20px", opacity: 0.5 }}>
                  No transactions found
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr
                  key={t.id}
                  style={{ transition: "background 0.2s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${COLORS.GOLD_GLOW}08` }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.6rem" }}>{t.group_booking_code}</td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.6rem" }}>{t.reference.substring(0, 12)}…</td>
                  <td style={tdStyle}>{t.primary_first_name} {t.primary_last_name}</td>
                  <td style={tdStyle}>{t.primary_email}</td>
                  <td style={tdStyle}>{t.quantity}</td>
                  <td style={tdStyle}>₦{(t.total_kobo / 100).toLocaleString()}</td>
                  <td style={tdStyle}>
                    <Badge
                      style={{
                        background: t.payment_status === "confirmed" ? "#22c55e20" : "#F9731620",
                        color: t.payment_status === "confirmed" ? "#22c55e" : "#F97316",
                        fontSize: "0.5rem",
                        fontFamily: "'Josefin Sans', sans-serif",
                        border: `1px solid ${t.payment_status === "confirmed" ? "#22c55e40" : "#F9731640"}`,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {t.payment_status}
                    </Badge>
                  </td>
                  <td style={tdStyle}>
                    {t.confirmed_at
                      ? new Date(t.confirmed_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Box>
    </VStack>
  )
}
