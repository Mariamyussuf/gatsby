import { useState, useEffect } from "react"
import { Box, Text, VStack, HStack, SimpleGrid } from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import type { GalaTable, TicketTier } from "@/lib/supabase"
import { COLORS } from "@/config/constants"

type TierWithTables = TicketTier & { tables: GalaTable[] }

export function TableMap() {
  const [tiers, setTiers] = useState<TierWithTables[]>([])

  const fetchData = async () => {
    const { data: tierData } = await supabase.from("ticket_tiers").select("*").order("price_kobo")
    const { data: tableData } = await supabase.from("gala_tables").select("*")
    if (tierData && tableData) {
      setTiers(
        tierData.map((t) => ({
          ...t,
          tables: tableData.filter((tb) => tb.tier_id === t.id),
        }))
      )
    }
  }

  useEffect(() => {
    fetchData()
    const ch = supabase.channel("admin-tables").on(
      "postgres_changes", { event: "*", schema: "public", table: "gala_tables" }, fetchData
    ).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const getColor = (table: GalaTable) => {
    const ratio = table.seats_booked / table.seats_total
    if (ratio === 0) return "#22c55e"
    if (ratio < 0.8) return "#22c55e"
    if (ratio < 1) return "#F97316"
    return "#ef4444"
  }

  const getLabel = (table: GalaTable) => {
    if (table.seats_booked >= table.seats_total) return "FULL"
    if (table.seats_booked / table.seats_total >= 0.8) return "~FULL"
    return "OK"
  }

  return (
    <VStack gap="10" align="stretch">
      <Box display="flex" gap="6" flexWrap="wrap">
        {[
          { color: "#22c55e", label: "Available" },
          { color: "#F97316", label: "Almost Full" },
          { color: "#ef4444", label: "Full" },
        ].map(({ color, label }) => (
          <Box key={label} display="flex" alignItems="center" gap="2">
            <Box w="12px" h="12px" borderRadius="full" style={{ backgroundColor: color }} />
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", color: COLORS.GOLD_DIM }}>
              {label}
            </Text>
          </Box>
        ))}
      </Box>

      {tiers.map((tier) => {
        const totalBooked = tier.tables.reduce((s, t) => s + t.seats_booked, 0)
        return (
          <Box key={tier.id}>
            <HStack gap="3" mb="4" align="center">
              <Text
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.4rem",
                  fontWeight: "700",
                  color: COLORS.GOLD_BRIGHT,
                }}
              >
                {tier.name}
              </Text>
              <Text
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  color: COLORS.GOLD_DIM,
                }}
              >
                {totalBooked} / {tier.max_capacity} seats booked
              </Text>
            </HStack>
            <SimpleGrid columns={{ base: 5, md: 10 }} gap="2">
              {tier.tables.sort((a, b) => a.table_number - b.table_number).map((table) => (
                <Box
                  key={table.id}
                  p="2"
                  textAlign="center"
                  style={{
                    border: `2px solid ${getColor(table)}`,
                    background: `${getColor(table)}15`,
                  }}
                >
                  <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", color: COLORS.GOLD_BASE, fontWeight: "600" }}>
                    T{table.table_number}
                  </Text>
                  <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.5rem", color: getColor(table) }}>
                    {table.seats_booked}/{table.seats_total}
                  </Text>
                  <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.45rem", color: getColor(table), opacity: 0.8 }}>
                    {getLabel(table)}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )
      })}
    </VStack>
  )
}

