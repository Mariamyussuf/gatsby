import { Box, Text, HStack } from "@chakra-ui/react"
import { useCountdown } from "@/hooks/useCountdown"
import { EVENT_DATE, COLORS } from "@/config/constants"

function TimeUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0")
  return (
    <Box
      style={{
        background: `linear-gradient(180deg, ${COLORS.PANEL_MID} 0%, ${COLORS.BG} 100%)`,
        border: `1px solid ${COLORS.GOLD_DIM}`,
        minWidth: "72px",
        padding: "12px 8px 8px",
        textAlign: "center",
        position: "relative",
        boxShadow: `0 0 20px ${COLORS.GOLD_GLOW}40, inset 0 1px 0 ${COLORS.GOLD_BRIGHT}30`,
      }}
    >
      {/* Art deco top accent */}
      <div style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "30px",
        height: "2px",
        background: `linear-gradient(90deg, transparent, ${COLORS.GOLD_BRIGHT}, transparent)`,
      }} />
      <Text
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2.5rem",
          fontWeight: "700",
          lineHeight: "1",
          color: COLORS.GOLD_BRIGHT,
          textShadow: `0 0 20px ${COLORS.GOLD_GLOW}, 0 0 40px ${COLORS.GOLD_GLOW}60`,
        }}
      >
        {display}
      </Text>
      <Text
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.6rem",
          fontWeight: "300",
          letterSpacing: "0.2em",
          color: COLORS.GOLD_DIM,
          textTransform: "uppercase",
          marginTop: "4px",
        }}
      >
        {label}
      </Text>
    </Box>
  )
}

function Separator() {
  return (
    <Text
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "2.5rem",
        color: COLORS.GOLD_DIM,
        lineHeight: "1",
        marginBottom: "16px",
        opacity: 0.7,
      }}
    >
      :
    </Text>
  )
}

export function CountdownTimer() {
  const { days, hours, minutes, seconds } = useCountdown(EVENT_DATE)

  return (
    <Box textAlign="center">
      <Text
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          color: COLORS.GOLD_DIM,
          textTransform: "uppercase",
          marginBottom: "12px",
        }}
      >
        Time Until the Gala
      </Text>
      <HStack gap="2" justifyContent="center" alignItems="flex-end">
        <TimeUnit value={days} label="Days" />
        <Separator />
        <TimeUnit value={hours} label="Hours" />
        <Separator />
        <TimeUnit value={minutes} label="Minutes" />
        <Separator />
        <TimeUnit value={seconds} label="Seconds" />
      </HStack>
    </Box>
  )
}
