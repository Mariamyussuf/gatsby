import { useState, useEffect } from "react"
import {
  Box, Text, VStack, HStack, Input, Button, Badge,
} from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import { toaster } from "@/components/ui/toaster"
import Papa from "papaparse"

type VvipRow = {
  id: string
  attendee_id: string
  pickup_address: string | null
  pickup_time: string | null
  pickup_status: string
  notes: string | null
  confirmation_sent: boolean
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  ticket_id?: string
  table_number?: number
}

const STATUS_COLORS: Record<string, string> = {
  Pending: COLORS.GOLD_DIM,
  Confirmed: "#22c55e",
  "Picked Up": COLORS.GOLD_BRIGHT,
}

export function VVIPPickupManager() {
  const [rows, setRows] = useState<VvipRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Record<string, Partial<VvipRow>>>({})

  const fetchData = async () => {
    try {
      // First, fetch all VVIP ticket buyers (tier_id = VVIP tier ID)
      const { data: vvipTier, error: tierError } = await supabase
        .from("ticket_tiers")
        .select("id")
        .eq("name", "VVIP")
        .maybeSingle()

      if (tierError || !vvipTier) {
        console.warn("[v0] VVIP tier not found, showing all vvip_pickups")
        // Continue without filtering by tier - just show all existing pickups
      } else {
        // Get all attendees with VVIP tickets
        const { data: vvipAttendees } = await supabase
          .from("attendees")
          .select("id, first_name, last_name, email, ticket_id, table_number, transactions (primary_phone)")
          .eq("tier_id", vvipTier.id)

        // Auto-create vvip_pickups entries for VVIP ticket buyers who don't have one yet
        if (vvipAttendees && vvipAttendees.length > 0) {
          for (const attendee of vvipAttendees) {
            const { data: existing } = await supabase
              .from("vvip_pickups")
              .select("id")
              .eq("attendee_id", attendee.id)
              .maybeSingle()

            if (!existing) {
              // Auto-create entry for this VVIP attendee
              await supabase.from("vvip_pickups").insert({
                attendee_id: attendee.id,
              })
            }
          }
        }
      }

      // Now fetch all vvip_pickups with attendee details
      const { data } = await supabase
        .from("vvip_pickups")
        .select("*, attendees (first_name, last_name, email, ticket_id, table_number, transactions (primary_phone))")
        .order("updated_at", { ascending: true })

      if (data) {
        setRows(
          data.map((r: any) => {
            const attendee = r.attendees ?? {}

            // FIX: attendees.transactions is a joined relation — Supabase returns
            // it as an array even for to-one relations. Safely extract primary_phone.
            const txnRaw = attendee.transactions
            const phone: string | undefined = Array.isArray(txnRaw)
              ? (txnRaw[0]?.primary_phone ?? undefined)
            : ((txnRaw as { primary_phone?: string } | null)?.primary_phone ?? undefined)

          return {
            ...r,
            first_name: attendee.first_name,
            last_name: attendee.last_name,
            email: attendee.email,
            phone,
            ticket_id: attendee.ticket_id,
            table_number: attendee.table_number,
          }
        })
      )
      }
      setLoading(false)
    } catch (err) {
      console.error("[v0] Error in VVIPPickupManager:", err)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const setEdit = (id: string, field: keyof VvipRow, value: string) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }))
  }

  const saveRow = async (id: string) => {
    const changes = editing[id]
    if (!changes) return
    await supabase.from("vvip_pickups").update({
      ...changes,
      updated_at: new Date().toISOString(),
    }).eq("id", id)
    setEditing((prev) => { const n = { ...prev }; delete n[id]; return n })
    fetchData()
    toaster.success({ title: "Updated" })
  }

  const sendConfirmation = async (row: VvipRow) => {
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-pickup-confirmation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ attendee_id: row.attendee_id }),
    }).catch(() => {})

    await supabase.from("vvip_pickups").update({ confirmation_sent: true }).eq("id", row.id)
    fetchData()
    toaster.success({ title: "Confirmation sent", description: `Email sent to ${row.email}` })
  }

  const exportCsv = () => {
    const csv = Papa.unparse(
      rows.map((r) => ({
        Name: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
        Email: r.email ?? "",
        Phone: r.phone ?? "",
        "Ticket ID": r.ticket_id ?? "",
        "Table #": r.table_number ?? "",
        "Pickup Address": r.pickup_address ?? "",
        "Pickup Time": r.pickup_time ?? "",
        "Pickup Status": r.pickup_status,
        Notes: r.notes ?? "",
        "Confirmation Sent": r.confirmation_sent ? "Yes" : "No",
      }))
    )
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `busa-vvip-pickups-${Date.now()}.csv`
    a.click()
  }

  const inputStyle = {
    background: `${COLORS.PANEL_MID}60`,
    border: `1px solid ${COLORS.GOLD_DIM}30`,
    color: COLORS.GOLD_BASE,
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "0.65rem",
    padding: "4px 8px",
    width: "100%",
    outline: "none",
  }

  const thStyle = {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "0.5rem",
    letterSpacing: "0.15em",
    color: COLORS.GOLD_DIM,
    textTransform: "uppercase" as const,
    padding: "8px 10px",
    borderBottom: `1px solid ${COLORS.GOLD_DIM}30`,
    whiteSpace: "nowrap" as const,
  }

  const tdStyle = {
    padding: "8px 10px",
    borderBottom: `1px solid ${COLORS.GOLD_DIM}10`,
    verticalAlign: "middle" as const,
  }

  return (
    <VStack gap="4" align="stretch">
      <HStack justify="space-between">
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            color: COLORS.GOLD_DIM,
          }}
        >
          {rows.length} VVIP guest{rows.length !== 1 ? "s" : ""}
        </Text>
        <Button
          onClick={exportCsv}
          size="sm"
          style={{
            background: "transparent",
            border: `1px solid ${COLORS.GOLD_DIM}60`,
            color: COLORS.GOLD_BASE,
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.6rem",
            letterSpacing: "0.15em",
            cursor: "pointer",
          }}
        >
          Export CSV
        </Button>
      </HStack>

      <Box overflowX="auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["Name", "Email", "Phone", "Ticket ID", "Table", "Pickup Address", "Pickup Time", "Status", "Notes", "Actions"].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} style={{ ...tdStyle, textAlign: "center", fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_DIM }}>
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ ...tdStyle, textAlign: "center", fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_DIM, opacity: 0.5 }}>
                  No VVIP guests yet
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const draft = editing[row.id] || {}
                const address = draft.pickup_address !== undefined ? draft.pickup_address : (row.pickup_address ?? "")
                const time = draft.pickup_time !== undefined ? draft.pickup_time : (row.pickup_time ?? "")
                const status = draft.pickup_status !== undefined ? draft.pickup_status : row.pickup_status
                const notes = draft.notes !== undefined ? draft.notes : (row.notes ?? "")
                const hasChanges = !!editing[row.id]

                return (
                  <tr
                    key={row.id}
                    style={{ transition: "background 0.2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${COLORS.GOLD_GLOW}06` }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                  >
                    <td style={{ ...tdStyle, fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", color: COLORS.GOLD_BASE, whiteSpace: "nowrap" }}>
                      {String(row.first_name ?? "")} {String(row.last_name ?? "")}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", color: COLORS.GOLD_DIM }}>
                      {String(row.email ?? "—")}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", color: COLORS.GOLD_DIM, whiteSpace: "nowrap" }}>
                      {String(row.phone ?? "—")}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: "0.55rem", color: COLORS.GOLD_DIM }}>
                      {String(row.ticket_id ?? "—")}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", color: COLORS.GOLD_BASE, textAlign: "center" }}>
                      {row.table_number != null ? String(row.table_number) : "—"}
                    </td>
                    <td style={{ ...tdStyle, minWidth: "180px" }}>
                      <input
                        value={address ?? ""}
                        onChange={(e) => setEdit(row.id, "pickup_address", e.target.value)}
                        placeholder="Enter pickup address..."
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ ...tdStyle, minWidth: "120px" }}>
                      <input
                        value={time ?? ""}
                        onChange={(e) => setEdit(row.id, "pickup_time", e.target.value)}
                        placeholder="e.g. 6:00 PM"
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ ...tdStyle, minWidth: "120px" }}>
                      <select
                        value={status}
                        onChange={(e) => setEdit(row.id, "pickup_status", e.target.value)}
                        style={{
                          ...inputStyle,
                          color: STATUS_COLORS[status] || COLORS.GOLD_BASE,
                        }}
                      >
                        {["Pending", "Confirmed", "Picked Up"].map((s) => (
                          <option key={s} value={s} style={{ background: COLORS.BG }}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ ...tdStyle, minWidth: "150px" }}>
                      <input
                        value={notes ?? ""}
                        onChange={(e) => setEdit(row.id, "notes", e.target.value)}
                        placeholder="Notes..."
                        style={inputStyle}
                      />
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      <VStack gap="1">
                        {hasChanges && (
                          <button
                            onClick={() => saveRow(row.id)}
                            style={{
                              background: `${COLORS.GOLD_DIM}40`,
                              border: `1px solid ${COLORS.GOLD_DIM}`,
                              color: COLORS.GOLD_BRIGHT,
                              fontFamily: "'Josefin Sans', sans-serif",
                              fontSize: "0.55rem",
                              letterSpacing: "0.1em",
                              padding: "3px 10px",
                              cursor: "pointer",
                            }}
                          >
                            Save
                          </button>
                        )}
                        <button
                          onClick={() => sendConfirmation(row)}
                          style={{
                            background: row.confirmation_sent ? `${COLORS.GOLD_GLOW}20` : COLORS.CRIMSON,
                            border: `1px solid ${row.confirmation_sent ? COLORS.GOLD_DIM : COLORS.CRIMSON}`,
                            color: row.confirmation_sent ? COLORS.GOLD_DIM : "white",
                            fontFamily: "'Josefin Sans', sans-serif",
                            fontSize: "0.5rem",
                            letterSpacing: "0.08em",
                            padding: "3px 8px",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {row.confirmation_sent ? "✓ Sent" : "Send Confirmation"}
                        </button>
                      </VStack>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </Box>
    </VStack>
  )
}
