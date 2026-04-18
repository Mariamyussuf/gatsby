import { Box, Button, Text, VStack } from "@chakra-ui/react"
import { Chandelier } from "./Chandelier"
import { CornerFrames } from "./CornerFrames"
import { CountdownTimer } from "./CountdownTimer"
import { RedCarpetStairs } from "./RedCarpetStairs"
import { GoldArch } from "./GoldArch"
import { COLORS, EVENT_VENUE, EVENT_SUBTITLE } from "@/config/constants"

export function HeroSection() {
  const handleScroll = () => {
    document.getElementById("tickets")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <Box
      as="section"
      id="hero"
      position="relative"
      minH="100vh"
      overflow="hidden"
      style={{
        background: `
          radial-gradient(ellipse 60% 70% at 50% 45%, ${COLORS.GOLD_GLOW}25 0%, transparent 65%),
          linear-gradient(180deg, ${COLORS.PANEL} 0%, ${COLORS.BG} 20%, ${COLORS.BG} 80%, ${COLORS.PANEL} 100%)
        `,
      }}
    >
      {/* Side burgundy panels */}
      <Box
        position="absolute"
        top="0"
        left="0"
        w={{ base: "6%", md: "8%" }}
        h="100%"
        style={{ background: `linear-gradient(90deg, ${COLORS.PANEL}, transparent)` }}
        zIndex={2}
      />
      <Box
        position="absolute"
        top="0"
        right="0"
        w={{ base: "6%", md: "8%" }}
        h="100%"
        style={{ background: `linear-gradient(270deg, ${COLORS.PANEL}, transparent)` }}
        zIndex={2}
      />

      {/* Gold arch background */}
      <GoldArch />

      {/* Corner frames */}
      <CornerFrames />

      {/* Content */}
      <VStack
        gap="0"
        position="relative"
        zIndex={3}
        pt={{ base: "4", md: "6" }}
        pb="0"
        px="4"
      >
        {/* Chandelier */}
        <Box className="fade-up-1" w="full" display="flex" justifyContent="center">
          <Chandelier />
        </Box>

        {/* Eyebrow */}
        <Box className="fade-up-2" textAlign="center" mt="-10">
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.7rem",
              letterSpacing: "0.35em",
              color: COLORS.GOLD_DIM,
              textTransform: "uppercase",
            }}
          >
            ✦ {EVENT_SUBTITLE} ✦
          </Text>
        </Box>

        {/* "THE" */}
        <Box className="fade-up-2" textAlign="center" mt="2">
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "clamp(0.8rem, 2vw, 1.1rem)",
              fontWeight: "300",
              letterSpacing: "0.6em",
              color: COLORS.GOLD_BASE,
              textTransform: "uppercase",
            }}
          >
            THE
          </Text>
        </Box>

        {/* "GREAT" */}
        <Box className="fade-up-3" textAlign="center" lineHeight="0.85" mt="-2">
          <span
            className="gold-shimmer"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(4rem, 14vw, 10rem)",
              fontWeight: "700",
              letterSpacing: "0.05em",
              display: "block",
              textShadow: `0 0 60px ${COLORS.GOLD_GLOW}`,
            }}
          >
            GREAT
          </span>
        </Box>

        {/* "GATSBY" */}
        <Box className="fade-up-3" textAlign="center" lineHeight="0.85" mt="-2">
          <span
            className="gold-shimmer"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(4rem, 14vw, 10rem)",
              fontWeight: "700",
              letterSpacing: "0.05em",
              display: "block",
              textShadow: `0 0 60px ${COLORS.GOLD_GLOW}`,
            }}
          >
            GATSBY
          </span>
        </Box>

        {/* "Gala" italic script */}
        <Box className="fade-up-4" textAlign="center" mt="-2">
          <Text
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2.5rem, 8vw, 5rem)",
              fontWeight: "400",
              fontStyle: "italic",
              color: COLORS.CRIMSON,
              letterSpacing: "0.02em",
              textShadow: `0 0 30px ${COLORS.CRIMSON}60`,
            }}
          >
            Gala
          </Text>
        </Box>

        {/* Divider line */}
        <Box className="fade-up-4" w="200px" my="3">
          <div style={{
            height: "1px",
            background: `linear-gradient(90deg, transparent, ${COLORS.GOLD_DIM}, transparent)`,
          }} />
        </Box>

        {/* Venue */}
        <Box className="fade-up-4" textAlign="center">
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)",
              fontWeight: "300",
              letterSpacing: "0.45em",
              color: COLORS.GOLD_DIM,
              textTransform: "uppercase",
            }}
          >
            {EVENT_VENUE}
          </Text>
        </Box>

        {/* Date */}
        <Box className="fade-up-4" textAlign="center" mt="1">
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.65rem",
              fontWeight: "300",
              letterSpacing: "0.3em",
              color: COLORS.GOLD_DIM,
              textTransform: "uppercase",
              opacity: 0.8,
            }}
          >
            Friday, 23rd May 2025 · 7:00PM
          </Text>
        </Box>

        {/* CTA Button */}
        <Box className="fade-up-5" mt="6">
          <Button
            onClick={handleScroll}
            size="lg"
            style={{
              background: `linear-gradient(135deg, ${COLORS.GOLD_DIM}, ${COLORS.GOLD_BASE}, ${COLORS.GOLD_BRIGHT})`,
              color: COLORS.BG,
              fontFamily: "'Josefin Sans', sans-serif",
              fontWeight: "600",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontSize: "0.75rem",
              padding: "0 2.5rem",
              height: "52px",
              border: "none",
              cursor: "pointer",
              boxShadow: `0 0 30px ${COLORS.GOLD_GLOW}60, 0 4px 20px rgba(0,0,0,0.4)`,
              transition: "all 0.3s ease",
            }}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: `0 0 40px ${COLORS.GOLD_GLOW}80, 0 8px 30px rgba(0,0,0,0.5)`,
            }}
          >
            ✦ Secure Your Seat ✦
          </Button>
        </Box>

        {/* Countdown */}
        <Box className="fade-up-6" mt="8" pb="6">
          <CountdownTimer />
        </Box>

        {/* Red Carpet Stairs */}
        <Box w="full" mt="4">
          <RedCarpetStairs />
        </Box>
      </VStack>
    </Box>
  )
}
