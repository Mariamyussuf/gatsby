import { useState, useEffect } from "react"
import { Box, Text, VStack, HStack, Badge, Button } from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import type { WaitlistEntry } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import { toaster } from "@/components/ui/toaster"

export function WaitlistAdmin() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    const { data } = await supabase
      .from("waitlist")
      .select("*")
      .order("created_at", { ascending: true })
    if (data) setEntries(data)
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const promote = async (entry: WaitlistEntry) => {
    await supabase.from("waitlist").update({ notified: true }).eq("id", entry.id)
    fetchData()
    toaster.success({ title: "Notified", description: `${entry.email} has been marked as notified.` })
  }

  const thStyle = {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "0.5rem",
    letterSpacing: "0.2em",
    color: COLORS.GOLD_DIM,
    textTransform: "uppercase" as const,
    padding: "8px 12px",
    borderBottom: `1px solid ${COLORS.GOLD_DIM}30`,
    textAlign: "left" as const,
  }

  const tdStyle = {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "0.65rem",
    color: COLORS.GOLD_BASE,
    padding: "8px 12px",
    borderBottom: `1px solid ${COLORS.GOLD_DIM}15`,
  }

  const grouped = entries.reduce<Record<string, WaitlistEntry[]>>((acc, e) => {
    if (!acc[e.tier_name]) acc[e.tier_name] = []
    acc[e.tier_name].push(e)
    return acc
  }, {})

  return (
    <VStack gap="8" align="stretch">
      {loading ? (
        <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_DIM }}>Loading...</Text>
      ) : entries.length === 0 ? (
        <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_DIM, opacity: 0.5 }}>No waitlist entries</Text>
      ) : (
        Object.entries(grouped).map(([tierName, tierEntries]) => (
          <Box key={tierName}>
            <HStack gap="3" mb="4">
              <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: "700", color: COLORS.GOLD_BRIGHT }}>
                {tierName}
              </Text>
              <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", color: COLORS.GOLD_DIM }}>
                {tierEntries.length} waiting
              </Text>
            </HStack>
            <Box overflowX="auto">
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Position</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Joined</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tierEntries.map((entry, idx) => (
                    <tr key={entry.id}>
                      <td style={tdStyle}>{idx + 1}</td>
                      <td style={tdStyle}>{entry.first_name}</td>
                      <td style={tdStyle}>{entry.email}</td>
                      <td style={{ ...tdStyle, fontSize: "0.55rem" }}>
                        {new Date(entry.created_at).toLocaleDateString()}
                      </td>
                      <td style={tdStyle}>
                        <Badge
                          style={{
                            background: entry.notified ? "#22c55e20" : `${COLORS.GOLD_GLOW}20`,
                            color: entry.notified ? "#22c55e" : COLORS.GOLD_DIM,
                            fontFamily: "'Josefin Sans', sans-serif",
                            fontSize: "0.5rem",
                            letterSpacing: "0.1em",
                          }}
                        >
                          {entry.notified ? "Notified" : "Waiting"}
                        </Badge>
                      </td>
                      <td style={tdStyle}>
                        {!entry.notified && (
                          <button
                            onClick={() => promote(entry)}
                            style={{
                              background: "transparent",
                              border: `1px solid ${COLORS.GOLD_DIM}60`,
                              color: COLORS.GOLD_BASE,
                              fontFamily: "'Josefin Sans', sans-serif",
                              fontSize: "0.55rem",
                              letterSpacing: "0.1em",
                              padding: "3px 10px",
                              cursor: "pointer",
                            }}
                          >
                            Promote
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>
        ))
      )}
    </VStack>
  )
}
