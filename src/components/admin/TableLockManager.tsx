import { useState, useEffect } from "react"
import { Box, VStack, HStack, Heading, Text, Button, Badge, SimpleGrid, Input, Select, Spinner } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"

interface GalaTable {
  id: string
  tier_id: string
  table_number: number
  seats_total: number
  seats_booked: number
  is_locked: boolean
  tier_name?: string
}

export function TableLockManager() {
  const [tables, setTables] = useState<GalaTable[]>([])
  const [filteredTables, setFilteredTables] = useState<GalaTable[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTier, setSelectedTier] = useState("")
  const [tiers, setTiers] = useState<{ id: string; name: string }[]>([])
  const [searchTable, setSearchTable] = useState("")
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    loadTiers()
    loadTables()
  }, [])

  useEffect(() => {
    filterTables()
  }, [tables, selectedTier, searchTable])

  const loadTiers = async () => {
    const { data } = await supabase.from("ticket_tiers").select("id, name")
    if (data) setTiers(data)
  }

  const loadTables = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("gala_tables")
      .select(`
        id, tier_id, table_number, seats_total, seats_booked, is_locked,
        ticket_tiers (name)
      `)
      .order("table_number")

    if (!error && data) {
      const formatted: GalaTable[] = data.map((t: any) => {
        // FIX: Supabase joined relations return an array or object depending on
        // whether it's a to-many or to-one relation. Safely handle both.
        const tierRaw = t.ticket_tiers
        const tierName: string =
          Array.isArray(tierRaw)
            ? (tierRaw[0]?.name ?? "Unknown")
            : ((tierRaw as { name?: string } | null)?.name ?? "Unknown")

        return {
          id: t.id,
          tier_id: t.tier_id,
          table_number: t.table_number,
          seats_total: t.seats_total,
          seats_booked: t.seats_booked,
          is_locked: t.is_locked ?? false,
          tier_name: tierName,
        }
      })
      setTables(formatted)
    } else if (error) {
      toaster.create({ title: "Failed to load tables", type: "error" })
    }
    setIsLoading(false)
  }

  const filterTables = () => {
    let filtered = tables
    if (selectedTier) {
      filtered = filtered.filter((t) => t.tier_id === selectedTier)
    }
    if (searchTable) {
      filtered = filtered.filter((t) =>
        t.table_number.toString().includes(searchTable)
      )
    }
    setFilteredTables(filtered)
  }

  const toggleLock = async (table: GalaTable) => {
    setTogglingId(table.id)
    const newLocked = !table.is_locked
    const { error } = await supabase
      .from("gala_tables")
      .update({ is_locked: newLocked })
      .eq("id", table.id)

    if (!error) {
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? { ...t, is_locked: newLocked } : t))
      )
      toaster.create({
        title: newLocked ? "Table locked" : "Table unlocked",
        description: `Table ${table.table_number} is now ${newLocked ? "unavailable" : "available"}`,
        type: "success",
      })
    } else {
      toaster.create({ title: "Error updating table", type: "error" })
    }
    setTogglingId(null)
  }

  if (isLoading) {
    return (
      <VStack justify="center" align="center" h="200px">
        <Spinner color={COLORS.GOLD_BASE} />
        <Text color={COLORS.TEXT}>Loading tables...</Text>
      </VStack>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading as="h2" size="lg" color={COLORS.GOLD_BASE}>
        Table Lock Manager
      </Heading>
      <Text color={COLORS.TEXT} fontSize="sm">
        Lock tables to prevent them from being booked. Use this for physical tickets or reserved tables.
      </Text>

      <HStack spacing={4}>
        <Input
          placeholder="Search table number..."
          value={searchTable}
          onChange={(e) => setSearchTable(e.target.value)}
          bg={COLORS.PANEL_MID}
          color={COLORS.TEXT}
          borderColor={COLORS.GOLD_DIM}
          _placeholder={{ color: COLORS.GOLD_DIM }}
        />
        <Select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          bg={COLORS.PANEL_MID}
          color={COLORS.TEXT}
          borderColor={COLORS.GOLD_DIM}
        >
          <option value="">All Tiers</option>
          {tiers.map((tier) => (
            <option key={tier.id} value={tier.id}>
              {tier.name}
            </option>
          ))}
        </Select>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {filteredTables.map((table) => (
          <Box
            key={table.id}
            p={4}
            bg={COLORS.PANEL_MID}
            borderColor={COLORS.ACCENT}
            borderWidth={1}
            borderRadius="md"
          >
            <HStack justify="space-between" mb={3}>
              <Heading as="h3" size="sm" color={COLORS.GOLD_BASE}>
                Table {table.table_number}
              </Heading>
              <Badge colorScheme={table.is_locked ? "red" : "green"}>
                {table.is_locked ? "LOCKED" : "AVAILABLE"}
              </Badge>
            </HStack>
            {/* FIX: Always render strings, never raw objects */}
            <Text color={COLORS.TEXT} fontSize="sm" mb={2}>
              {String(table.tier_name ?? "Unknown")}
            </Text>
            <Text color={COLORS.TEXT_MUTED} fontSize="xs" mb={4}>
              Seats: {table.seats_booked}/{table.seats_total}
            </Text>
            <Button
              w="100%"
              onClick={() => toggleLock(table)}
              isLoading={togglingId === table.id}
              colorScheme={table.is_locked ? "green" : "red"}
              size="sm"
            >
              {table.is_locked ? "Unlock Table" : "Lock Table"}
            </Button>
          </Box>
        ))}
      </SimpleGrid>

      {filteredTables.length === 0 && (
        <Text color={COLORS.TEXT_MUTED} textAlign="center" py={8}>
          No tables found
        </Text>
      )}
    </VStack>
  )
}
