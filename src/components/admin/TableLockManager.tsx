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
        id, tier_id, table_number, seats_total, seats_booked,
        ticket_tiers (name)
      `)
      .order("table_number")

    if (!error && data) {
      const formatted = data.map((t: any) => ({
        id: t.id,
        tier_id: t.tier_id,
        table_number: t.table_number,
        seats_total: t.seats_total,
        seats_booked: t.seats_booked,
        is_locked: false,
        tier_name: t.ticket_tiers?.name || "Unknown",
      }))
      setTables(formatted)
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
    const { error } = await supabase
      .from("gala_tables")
      .update({ is_locked: !table.is_locked })
      .eq("id", table.id)

    if (!error) {
      toaster.create({
        title: table.is_locked ? "Table unlocked" : "Table locked",
        description: `Table ${table.table_number} is now ${table.is_locked ? "available" : "unavailable"}`,
        type: "success",
      })
      loadTables()
    } else {
      toaster.create({ title: "Error updating table", type: "error" })
    }
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
          bg={COLORS.INPUT_BG}
          color={COLORS.TEXT}
          borderColor={COLORS.ACCENT}
          _placeholder={{ color: COLORS.TEXT_MUTED }}
        />
        <Select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          bg={COLORS.INPUT_BG}
          color={COLORS.TEXT}
          borderColor={COLORS.ACCENT}
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
            <Text color={COLORS.TEXT} fontSize="sm" mb={2}>
              {table.tier_name}
            </Text>
            <Text color={COLORS.TEXT_MUTED} fontSize="xs" mb={4}>
              Seats: {table.seats_booked}/{table.seats_total}
            </Text>
            <Button
              w="100%"
              onClick={() => toggleLock(table)}
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
