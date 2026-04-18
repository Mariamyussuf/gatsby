import { Box, Text, VStack, HStack } from "@chakra-ui/react"
import { COLORS, FITZGERALD_QUOTE } from "@/config/constants"

type Props = {
  groupCode: string
  tier: string
  tableNumber: number
  quantity: number
  primaryEmail: string
}

export function SuccessScreen({ groupCode, tier, tableNumber, quantity, primaryEmail }: Props) {
  return (
    <Box
      maxW="600px"
      mx="auto"
      mt="12"
      p={{ base: "8", md: "12" }}
      textAlign="center"
      style={{
        border: `2px solid ${COLORS.GOLD_DIM}`,
        background: `linear-gradient(180deg, ${COLORS.PANEL_MID}80 0%, ${COLORS.BG} 100%)`,
        boxShadow: `0 0 60px ${COLORS.GOLD_GLOW}30`,
        animation: "fade-up 0.6s ease-out both",
      }}
    >
      <VStack gap="6">
        {/* Diamond icon */}
        <Box>
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <polygon
              points="30,4 56,22 56,38 30,56 4,38 4,22"
              fill="none"
              stroke={COLORS.GOLD_BASE}
              strokeWidth="2"
            />
            <polygon
              points="30,12 48,24 48,36 30,48 12,36 12,24"
              fill={COLORS.GOLD_GLOW}
              opacity="0.4"
            />
            <polygon
              points="30,20 42,28 42,32 30,40 18,32 18,28"
              fill={COLORS.GOLD_BRIGHT}
              opacity="0.8"
            />
          </svg>
        </Box>

        {/* Heading */}
        <VStack gap="1">
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.4em",
              color: COLORS.GOLD_DIM,
              textTransform: "uppercase",
            }}
          >
            ✦ Reservation Confirmed ✦
          </Text>
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.8rem",
              fontWeight: "700",
              color: COLORS.GOLD_BRIGHT,
              lineHeight: "1",
              textShadow: `0 0 30px ${COLORS.GOLD_GLOW}`,
            }}
          >
            You're on the List
          </Text>
        </VStack>

        {/* Details card */}
        <Box
          w="full"
          p="6"
          style={{
            border: `1px solid ${COLORS.GOLD_DIM}40`,
            background: `${COLORS.GOLD_GLOW}10`,
          }}
        >
          <VStack gap="4">
            <HStack justify="space-between" w="full">
              <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>
                Tier
              </Text>
              <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: "600", color: COLORS.GOLD_BRIGHT }}>
                {tier}
              </Text>
            </HStack>
            <div style={{ height: "1px", width: "100%", background: `${COLORS.GOLD_DIM}30` }} />
            <HStack justify="space-between" w="full">
              <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>
                Table
              </Text>
              <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: "600", color: COLORS.GOLD_BRIGHT }}>
                {tableNumber}
              </Text>
            </HStack>
            <div style={{ height: "1px", width: "100%", background: `${COLORS.GOLD_DIM}30` }} />
            <HStack justify="space-between" w="full">
              <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>
                Tickets
              </Text>
              <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", fontWeight: "600", color: COLORS.GOLD_BRIGHT }}>
                {quantity}
              </Text>
            </HStack>
            <div style={{ height: "1px", width: "100%", background: `${COLORS.GOLD_DIM}30` }} />
            <HStack justify="space-between" w="full">
              <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>
                Group Code
              </Text>
              <Text
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "1rem",
                  fontWeight: "700",
                  letterSpacing: "0.15em",
                  color: COLORS.GOLD_BRIGHT,
                  textShadow: `0 0 15px ${COLORS.GOLD_GLOW}`,
                }}
              >
                {groupCode}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Email notice */}
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            color: COLORS.GOLD_DIM,
            lineHeight: "1.6",
          }}
        >
          A confirmation has been sent to{" "}
          <span style={{ color: COLORS.GOLD_BASE }}>{primaryEmail}</span>
        </Text>

        {/* QR notice */}
        <Box
          p="4"
          style={{
            border: `1px solid ${COLORS.CRIMSON}40`,
            background: `${COLORS.CRIMSON}10`,
          }}
        >
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.08em",
              color: COLORS.GOLD_BASE,
              lineHeight: "1.6",
            }}
          >
            Your exclusive QR entry code arrives 3 days before the Gala.
            <br />
            <span style={{ color: COLORS.CRIMSON, fontStyle: "italic" }}>
              Guard it — it is yours alone.
            </span>
          </Text>
        </Box>

        {/* Divider */}
        <div style={{ height: "1px", width: "100%", background: `linear-gradient(90deg, transparent, ${COLORS.GOLD_DIM}40, transparent)` }} />

        {/* Fitzgerald quote */}
        <Text
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "1rem",
            fontStyle: "italic",
            color: COLORS.CRIMSON,
            lineHeight: "1.6",
            letterSpacing: "0.02em",
          }}
        >
          "{FITZGERALD_QUOTE}"
        </Text>
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.55rem",
            letterSpacing: "0.2em",
            color: COLORS.GOLD_DIM,
            opacity: 0.7,
          }}
        >
          — F. Scott Fitzgerald
        </Text>
      </VStack>
    </Box>
  )
}
