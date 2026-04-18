import { useState, useEffect } from "react"
import {
  Box,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Spinner,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react"
import { DrawerRoot, DrawerContent, DrawerHeader, DrawerBody } from "@/components/ui/drawer"
import { supabase } from "@/lib/supabase"
import type { TicketTier, GalaTable } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import { TablePicker } from "./TablePicker"
import { WaitlistForm } from "@/components/booking/WaitlistForm"

type TierWithData = TicketTier & {
  tables: GalaTable[]
  totalBooked: number
}

type Props = {
  onSelect: (tier: TicketTier, table: GalaTable) => void
}

export function TicketTiers({ onSelect }: Props) {
  const [tiers, setTiers] = useState<TierWithData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<GalaTable | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const isMobile = useBreakpointValue({ base: true, md: false })

  const [dbError, setDbError] = useState<string | null>(null)

  const fetchData = async () => {
    const { data: tierData, error: tierErr } = await supabase.from("ticket_tiers").select("*").order("price_kobo")
    const { data: tableData, error: tableErr } = await supabase.from("gala_tables").select("*")
    if (tierErr || tableErr) {
      setDbError((tierErr || tableErr)?.message || "Database error")
    } else if (tierData && tableData) {
      const combined: TierWithData[] = tierData.map((t) => {
        const tables = tableData.filter((tb) => tb.tier_id === t.id)
        const totalBooked = tables.reduce((s, tb) => s + tb.seats_booked, 0)
        return { ...t, tables, totalBooked }
      })
      setTiers(combined)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
    const channel = supabase.channel("tables-live")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "gala_tables" }, () => {
        fetchData()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) {
    return (
      <Box textAlign="center" py="20">
        <Spinner size="xl" style={{ color: COLORS.GOLD_BASE }} />
      </Box>
    )
  }

  if (dbError || tiers.length === 0) {
    return (
      <Box id="tickets" py="20" px={{ base: "4", md: "8" }} textAlign="center">
        <VStack gap="6" maxW="560px" mx="auto">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 44,18 44,30 24,44 4,30 4,18" fill="none" stroke={COLORS.GOLD_DIM} strokeWidth="2" opacity="0.6" />
          </svg>
          <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: "700", color: COLORS.GOLD_BRIGHT }}>
            Database Setup Required
          </Text>
          <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", letterSpacing: "0.08em", color: COLORS.GOLD_DIM, lineHeight: "1.8" }}>
            {dbError
              ? `Connection error: ${dbError}`
              : "No ticket tiers found. Run the seed SQL in your Supabase SQL Editor to populate the event data."}
          </Text>
          <Box
            w="full"
            p="5"
            textAlign="left"
            style={{ border: `1px solid ${COLORS.GOLD_DIM}30`, background: `${COLORS.PANEL_MID}40` }}
          >
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.2em", color: COLORS.GOLD_DIM, textTransform: "uppercase", marginBottom: "12px" }}>
              Steps to set up:
            </Text>
            {[
              "Go to your Supabase project dashboard",
              "Open the SQL Editor",
              "Run supabase/migrations/20260414194127_create_gatsby_gala_schema.sql",
              "Then run supabase/migrations/20260418000000_seed_and_rpc.sql",
              "Refresh this page",
            ].map((step, i) => (
              <HStack key={i} gap="3" mb="2" align="start">
                <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", color: COLORS.GOLD_BASE, minWidth: "16px" }}>{i + 1}.</Text>
                <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", color: COLORS.GOLD_DIM, letterSpacing: "0.05em", lineHeight: "1.6" }}>{step}</Text>
              </HStack>
            ))}
          </Box>
        </VStack>
      </Box>
    )
  }

  const handleTierSelect = (tier: TierWithData) => {
    if (tier.totalBooked >= tier.max_capacity) return
    setSelectedTierId(tier.id)
    setSelectedTable(null)
    if (isMobile) {
      setIsDrawerOpen(true)
    }
  }

  const handleTableSelect = (table: GalaTable) => {
    setSelectedTable(table)
    const tier = tiers.find((t) => t.id === selectedTierId)!
    onSelect(tier, table)
    if (isMobile) {
      setIsDrawerOpen(false)
    }
  }

  const selectedTier = tiers.find((t) => t.id === selectedTierId)

  return (
    <Box id="tickets" py="20" px={{ base: "4", md: "8" }}>
      {/* Section header */}
      <VStack gap="2" mb="14" textAlign="center">
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.4em",
            color: COLORS.GOLD_DIM,
            textTransform: "uppercase",
          }}
        >
          ✦ Reserve Your Place ✦
        </Text>
        <Text
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
            fontWeight: "700",
            color: COLORS.GOLD_BRIGHT,
            letterSpacing: "0.05em",
            lineHeight: "1",
          }}
        >
          Ticket Tiers
        </Text>
        <Box w="120px">
          <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${COLORS.GOLD_DIM}, transparent)` }} />
        </Box>
      </VStack>

      {/* Tier cards */}
      <SimpleGrid columns={{ base: 1, md: 3 }} gap="0" maxW="1100px" mx="auto">
        {tiers.map((tier, idx) => {
          const isSoldOut = tier.totalBooked >= tier.max_capacity
          const isSelected = selectedTierId === tier.id
          const remaining = tier.max_capacity - tier.totalBooked
          const isVVIP = tier.name === "VVIP"
          const isVIP = tier.name === "VIP"

          return (
            <Box
              key={tier.id}
              position="relative"
              style={{
                background: isSelected
                  ? `linear-gradient(180deg, ${COLORS.GOLD_GLOW}30 0%, ${COLORS.PANEL_MID} 100%)`
                  : isVVIP
                    ? `linear-gradient(180deg, ${COLORS.PANEL} 0%, ${COLORS.PANEL_MID} 100%)`
                    : `linear-gradient(180deg, ${COLORS.PANEL_MID} 0%, ${COLORS.BG} 100%)`,
                border: isSelected
                  ? `2px solid ${COLORS.GOLD_BASE}`
                  : `2px solid ${COLORS.GOLD_DIM}40`,
                marginLeft: idx > 0 ? "-2px" : "0",
                transition: "all 0.3s ease",
                transform: isVVIP ? "scaleY(1.02)" : "none",
                zIndex: isVVIP ? 2 : isSelected ? 3 : 1,
                boxShadow: isSelected
                  ? `0 0 40px ${COLORS.GOLD_GLOW}40`
                  : isVVIP
                    ? `0 0 30px ${COLORS.GOLD_GLOW}20`
                    : "none",
              }}
            >
              {/* Featured badge for VVIP */}
              {isVVIP && (
                <Box
                  position="absolute"
                  top="-14px"
                  left="50%"
                  style={{ transform: "translateX(-50%)" }}
                  zIndex={10}
                >
                  <Badge
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.GOLD_DIM}, ${COLORS.GOLD_BRIGHT})`,
                      color: COLORS.BG,
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.55rem",
                      fontWeight: "600",
                      letterSpacing: "0.2em",
                      padding: "4px 14px",
                    }}
                  >
                    MOST EXCLUSIVE
                  </Badge>
                </Box>
              )}

              <VStack p="8" gap="5" h="full" align="stretch">
                {/* Tier name */}
                <Text
                  textAlign="center"
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.7rem",
                    letterSpacing: "0.4em",
                    color: COLORS.GOLD_DIM,
                    textTransform: "uppercase",
                  }}
                >
                  {tier.name}
                </Text>

                {/* Price */}
                <Text
                  textAlign="center"
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "3rem",
                    fontWeight: "700",
                    color: isSelected ? COLORS.GOLD_BRIGHT : COLORS.GOLD_BASE,
                    lineHeight: "1",
                    textShadow: isSelected ? `0 0 20px ${COLORS.GOLD_GLOW}` : "none",
                  }}
                >
                  ₦{(tier.price_kobo / 100).toLocaleString()}
                </Text>

                {/* Seating info */}
                <Text
                  textAlign="center"
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    color: COLORS.GOLD_DIM,
                    opacity: 0.8,
                  }}
                >
                  {tier.seats_per_table} seats per table · {tier.total_tables} tables
                </Text>

                {/* Divider */}
                <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${COLORS.GOLD_DIM}60, transparent)` }} />

                {/* Perks */}
                <VStack gap="2" align="stretch" flex="1">
                  {tier.perks.map((perk, i) => (
                    <HStack key={i} gap="3">
                      <Text style={{ color: COLORS.GOLD_BRIGHT, fontSize: "0.6rem" }}>◆</Text>
                      <Text
                        style={{
                          fontFamily: "'Josefin Sans', sans-serif",
                          fontSize: "0.7rem",
                          fontWeight: "300",
                          letterSpacing: "0.05em",
                          color: COLORS.GOLD_BASE,
                        }}
                      >
                        {perk}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

                {/* Remaining seats */}
                <Box textAlign="center">
                  {isSoldOut ? (
                    <Badge
                      style={{
                        background: "rgba(255,255,255,0.1)",
                        color: "#888",
                        fontFamily: "'Josefin Sans', sans-serif",
                        fontSize: "0.55rem",
                        letterSpacing: "0.2em",
                      }}
                    >
                      SOLD OUT
                    </Badge>
                  ) : (
                    <Text
                      style={{
                        fontFamily: "'Josefin Sans', sans-serif",
                        fontSize: "0.6rem",
                        letterSpacing: "0.15em",
                        color: remaining <= 10 ? "#F97316" : COLORS.GOLD_DIM,
                        opacity: 0.9,
                      }}
                    >
                      {remaining} seat{remaining !== 1 ? "s" : ""} remaining
                    </Text>
                  )}
                </Box>

                {/* Select button */}
                {isSoldOut ? (
                  <WaitlistForm tier={tier} compact />
                ) : (
                  <Button
                    onClick={() => handleTierSelect(tier)}
                    style={{
                      background: isSelected
                        ? `linear-gradient(135deg, ${COLORS.GOLD_DIM}, ${COLORS.GOLD_BRIGHT})`
                        : "transparent",
                      border: `1px solid ${COLORS.GOLD_DIM}`,
                      color: isSelected ? COLORS.BG : COLORS.GOLD_BASE,
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: "600",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      height: "44px",
                    }}
                    _hover={{
                      background: `linear-gradient(135deg, ${COLORS.GOLD_DIM}, ${COLORS.GOLD_BRIGHT})`,
                      color: COLORS.BG,
                    }}
                  >
                    {isSelected ? "✦ Selected" : "Select"}
                  </Button>
                )}
              </VStack>
            </Box>
          )
        })}
      </SimpleGrid>

      {/* Table Picker - Desktop inline */}
      {selectedTier && !isMobile && (
        <Box mt="12">
          <TablePicker
            tier={selectedTier}
            tables={selectedTier.tables}
            selectedTable={selectedTable}
            onSelect={handleTableSelect}
          />
        </Box>
      )}

      {/* Table Picker - Mobile drawer */}
      {selectedTier && isMobile && (
        <DrawerRoot
          size="full"
          placement="bottom"
          open={isDrawerOpen}
          onOpenChange={(e) => setIsDrawerOpen(e.open)}
        >
          <DrawerContent
            style={{
              background: COLORS.BG,
              borderTop: `1px solid ${COLORS.GOLD_DIM}40`,
            }}
          >
            <DrawerHeader borderBottomWidth="1px" borderColor={`${COLORS.GOLD_DIM}40`}>
              <Text
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: COLORS.GOLD_BRIGHT,
                }}
              >
                Choose Your Table
              </Text>
            </DrawerHeader>
            <DrawerBody py="6">
              <TablePicker
                tier={selectedTier}
                tables={selectedTier.tables}
                selectedTable={selectedTable}
                onSelect={handleTableSelect}
              />
            </DrawerBody>
          </DrawerContent>
        </DrawerRoot>
      )}
    </Box>
  )
}
