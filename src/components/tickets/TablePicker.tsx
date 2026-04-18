import { Box, Text, VStack, SimpleGrid, Badge } from "@chakra-ui/react"
import type { TicketTier, GalaTable } from "@/lib/supabase"
import { COLORS } from "@/config/constants"

type Props = {
  tier: TicketTier
  tables: GalaTable[]
  selectedTable: GalaTable | null
  onSelect: (table: GalaTable) => void
  highlightMessage?: string
}

export function TablePicker({ tier, tables, selectedTable, onSelect, highlightMessage }: Props) {
  const scrollToForm = () => {
    setTimeout(() => {
      document.getElementById("booking-form")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSelect = (table: GalaTable) => {
    onSelect(table)
    scrollToForm()
  }

  return (
    <Box
      maxW="1100px"
      mx="auto"
      p={{ base: "4", md: "8" }}
      style={{
        border: `1px solid ${COLORS.GOLD_DIM}40`,
        background: `linear-gradient(180deg, ${COLORS.PANEL_MID}80 0%, ${COLORS.BG} 100%)`,
        animation: "fade-up 0.5s ease-out both",
      }}
    >
      <VStack gap="6" align="stretch">
        {/* Header */}
        <VStack gap="1" textAlign="center">
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.35em",
              color: COLORS.GOLD_DIM,
              textTransform: "uppercase",
            }}
          >
            ✦ {tier.name} Section ✦
          </Text>
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.8rem",
              fontWeight: "700",
              color: COLORS.GOLD_BRIGHT,
            }}
          >
            Choose Your Table
          </Text>
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.65rem",
              color: COLORS.GOLD_DIM,
              letterSpacing: "0.1em",
              opacity: 0.8,
            }}
          >
            {tier.seats_per_table} seats per table
          </Text>
        </VStack>

        {/* Alert message */}
        {highlightMessage && (
          <Box
            p="3"
            textAlign="center"
            style={{
              border: `1px solid ${COLORS.CRIMSON}`,
              background: `${COLORS.CRIMSON}15`,
            }}
          >
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.7rem",
                color: COLORS.CRIMSON,
                fontStyle: "italic",
              }}
            >
              {highlightMessage}
            </Text>
          </Box>
        )}

        {/* Legend */}
        <Box
          display="flex"
          gap="6"
          flexWrap="wrap"
          justifyContent="center"
        >
          {[
            { color: COLORS.GOLD_DIM, label: "Available" },
            { color: "#F97316", label: "Almost Full" },
            { color: "#444", label: "Fully Booked" },
          ].map(({ color, label }) => (
            <Box key={label} display="flex" alignItems="center" gap="2">
              <Box w="10px" h="10px" borderRadius="full" style={{ backgroundColor: color }} />
              <Text
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "0.6rem",
                  letterSpacing: "0.1em",
                  color: COLORS.GOLD_DIM,
                  opacity: 0.8,
                }}
              >
                {label}
              </Text>
            </Box>
          ))}
        </Box>

        {/* Table grid */}
        <SimpleGrid columns={{ base: 4, sm: 5, md: 10 }} gap="2">
          {tables
            .sort((a, b) => a.table_number - b.table_number)
            .map((table) => {
              const seatsLeft = table.seats_total - table.seats_booked
              const isFull = seatsLeft <= 0
              const isAlmostFull = seatsLeft <= 2 && seatsLeft > 0
              const isSelected = selectedTable?.id === table.id

              let borderColor = COLORS.GOLD_DIM
              let textColor = COLORS.GOLD_BASE
              let bgColor = "transparent"

              if (isFull) {
                borderColor = "#333"
                textColor = "#555"
                bgColor = "#111"
              } else if (isAlmostFull) {
                borderColor = "#F97316"
                textColor = "#F97316"
              }

              if (isSelected) {
                borderColor = COLORS.GOLD_BRIGHT
                bgColor = `${COLORS.GOLD_GLOW}40`
                textColor = COLORS.GOLD_BRIGHT
              }

              return (
                <Box
                  key={table.id}
                  as="button"
                  onClick={() => !isFull && handleSelect(table)}
                  disabled={isFull}
                  position="relative"
                  p="2"
                  textAlign="center"
                  style={{
                    border: `1px solid ${borderColor}`,
                    background: bgColor,
                    cursor: isFull ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                    opacity: isFull ? 0.4 : 1,
                  }}
                  _hover={!isFull ? {
                    background: `${COLORS.GOLD_GLOW}30`,
                    borderColor: COLORS.GOLD_BASE,
                    transform: "scale(1.05)",
                  } : {}}
                >
                  {isAlmostFull && !isFull && (
                    <Box
                      position="absolute"
                      top="-6px"
                      left="50%"
                      style={{ transform: "translateX(-50%)" }}
                    >
                      <Badge
                        style={{
                          background: "#F97316",
                          color: "white",
                          fontSize: "0.4rem",
                          fontFamily: "'Josefin Sans', sans-serif",
                          letterSpacing: "0.05em",
                          padding: "1px 4px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Almost Full
                      </Badge>
                    </Box>
                  )}
                  <Text
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.65rem",
                      fontWeight: "600",
                      letterSpacing: "0.1em",
                      color: textColor,
                    }}
                  >
                    {isFull ? "Full" : `T${table.table_number}`}
                  </Text>
                  {!isFull && (
                    <Text
                      style={{
                        fontFamily: "'Josefin Sans', sans-serif",
                        fontSize: "0.45rem",
                        color: textColor,
                        opacity: 0.8,
                        letterSpacing: "0.05em",
                        marginTop: "2px",
                      }}
                    >
                      {seatsLeft}/{table.seats_total}
                    </Text>
                  )}
                </Box>
              )
            })}
        </SimpleGrid>

        {selectedTable && (
          <Box
            textAlign="center"
            p="3"
            style={{
              border: `1px solid ${COLORS.GOLD_BASE}`,
              background: `${COLORS.GOLD_GLOW}15`,
            }}
          >
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                color: COLORS.GOLD_BRIGHT,
              }}
            >
              Table {selectedTable.table_number} selected ·{" "}
              {selectedTable.seats_total - selectedTable.seats_booked} seats available
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  )
}
