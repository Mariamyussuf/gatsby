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

type AttendeeRow = {
  id: string
  first_name: string
  last_name: string
  email: string
  ticket_id: string
  group_booking_code: string
  table_number: number
  is_primary: boolean
  qr_used_at: string | null
  created_at: string
  tier_name?: string
  payment_status?: string
}

export function AttendeeList() {
  const [attendees, setAttendees] = useState<AttendeeRow[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const { data } = await supabase
      .from("attendees")
      .select(`
        *,
        ticket_tiers (name),
        transactions (payment_status)
      `)
      .order("created_at", { ascending: false })

    if (data) {
      setAttendees(
        data.map((row: any) => ({
          ...row,
          tier_name: row.ticket_tiers?.name,
          payment_status: row.transactions?.payment_status,
        }))
      )
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const ch = supabase.channel("admin-attendees")
      .on("postgres_changes", { event: "*", schema: "public", table: "attendees" }, fetchData)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const filtered = attendees.filter((a) => {
    const q = search.toLowerCase()
    return (
      a.first_name.toLowerCase().includes(q) ||
      a.last_name.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.ticket_id.toLowerCase().includes(q) ||
      (a.tier_name || "").toLowerCase().includes(q)
    )
  })

  const exportCsv = () => {
    const csv = Papa.unparse(
      filtered.map((a) => ({
        "First Name": a.first_name,
        "Last Name": a.last_name,
        Email: a.email,
        Tier: a.tier_name,
        "Table #": a.table_number,
        "Ticket ID": a.ticket_id,
        "Group Code": a.group_booking_code,
        "Primary?": a.is_primary ? "Yes" : "No",
        "Payment Status": a.payment_status,
        "QR Used": a.qr_used_at ? "Yes" : "No",
        "Booking Date": a.created_at,
      }))
    )
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `busa-gala-attendees-${Date.now()}.csv`
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

  return (
    <VStack gap="4" align="stretch">
      <HStack gap="4">
        <Input
          placeholder="Search by name, email, ticket ID..."
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
        {filtered.length} attendee{filtered.length !== 1 ? "s" : ""} found
      </Text>

      <Box overflowX="auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Email", "Tier", "Table", "Ticket ID", "Group Code", "Status", "QR"].map((h) => (
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
                  No attendees found
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr
                  key={a.id}
                  style={{ transition: "background 0.2s" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${COLORS.GOLD_GLOW}08` }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                >
                  <td style={tdStyle}>{a.first_name} {a.last_name}{a.is_primary ? " ✦" : ""}</td>
                  <td style={tdStyle}>{a.email}</td>
                  <td style={tdStyle}>
                    <Badge
                      style={{
                        background: a.tier_name === "VVIP"
                          ? `linear-gradient(135deg, ${COLORS.GOLD_DIM}, ${COLORS.GOLD_BRIGHT})`
                          : a.tier_name === "VIP"
                            ? `${COLORS.GOLD_GLOW}40`
                            : `${COLORS.PANEL}`,
                        color: a.tier_name === "VVIP" ? COLORS.BG : COLORS.GOLD_BASE,
                        fontFamily: "'Josefin Sans', sans-serif",
                        fontSize: "0.5rem",
                        letterSpacing: "0.1em",
                        border: `1px solid ${COLORS.GOLD_DIM}40`,
                      }}
                    >
                      {a.tier_name}
                    </Badge>
                  </td>
                  <td style={tdStyle}>{a.table_number}</td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.6rem" }}>{a.ticket_id}</td>
                  <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.6rem" }}>{a.group_booking_code}</td>
                  <td style={tdStyle}>
                    <Badge
                      style={{
                        background: a.payment_status === "confirmed" ? "#22c55e20" : "#F9731620",
                        color: a.payment_status === "confirmed" ? "#22c55e" : "#F97316",
                        fontSize: "0.5rem",
                        fontFamily: "'Josefin Sans', sans-serif",
                        border: `1px solid ${a.payment_status === "confirmed" ? "#22c55e40" : "#F9731640"}`,
                      }}
                    >
                      {a.payment_status}
                    </Badge>
                  </td>
                  <td style={tdStyle}>
                    <Box
                      w="8px"
                      h="8px"
                      borderRadius="full"
                      style={{ backgroundColor: a.qr_used_at ? "#22c55e" : `${COLORS.GOLD_DIM}40` }}
                    />
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
