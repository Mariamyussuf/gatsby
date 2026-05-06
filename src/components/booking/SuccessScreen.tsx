import { useEffect, useState } from "react"
import { Box, Text, VStack, HStack } from "@chakra-ui/react"
import { COLORS, FITZGERALD_QUOTE } from "@/config/constants"

type Props = {
  groupCode: string
  tier: string
  tableNumber: number
  quantity: number
  primaryEmail: string
}

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 1.8}s`,
  duration: `${1.2 + Math.random() * 1.4}s`,
  size: `${6 + Math.random() * 10}px`,
  color: i % 3 === 0 ? COLORS.GOLD_BRIGHT : i % 3 === 1 ? COLORS.GOLD_BASE : COLORS.CRIMSON,
  rotate: `${Math.random() * 360}deg`,
  drift: `${(Math.random() - 0.5) * 120}px`,
}))

export function SuccessScreen({ groupCode, tier, tableNumber, quantity, primaryEmail }: Props) {
  const [phase, setPhase] = useState<"carpet" | "spotlight" | "reveal" | "done">("carpet")

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("spotlight"), 1800)
    const t2 = setTimeout(() => setPhase("reveal"), 3000)
    const t3 = setTimeout(() => setPhase("done"), 4200)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <Box position="relative" minH="100vh" overflow="hidden">

      {/* ── SPOTLIGHT EFFECT ── */}
      {(phase === "carpet" || phase === "spotlight") && (
        <Box
          position="fixed"
          inset="0"
          zIndex="40"
          pointerEvents="none"
          style={{
            background: `radial-gradient(circle at 50% 40%, ${COLORS.GOLD_GLOW}15 0%, transparent 60%)`,
            animation: phase === "spotlight" ? "spotlightPulse 1.2s ease-out both" : "none",
          }}
        />
      )}

      {/* ── RED CARPET REVEAL OVERLAY ── */}
      {phase !== "done" && (
        <Box
          position="fixed"
          inset="0"
          zIndex="50"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          style={{
            background: COLORS.BG,
            opacity: phase === "reveal" ? 0 : 1,
            transition: "opacity 1s ease",
            pointerEvents: phase === "reveal" ? "none" : "all",
          }}
        >
          {/* Gold confetti particles - enhanced burst */}
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius: p.id % 4 === 0 ? "50%" : "2px",
                transform: `rotate(${p.rotate})`,
                animation: phase === "spotlight" ? `confettiBurst ${2.5 + Math.random() * 0.5}s ${p.delay} ease-out both` : `confettiFall ${p.duration} ${p.delay} ease-in both`,
                boxShadow: `0 0 ${6 + Math.random() * 6}px ${p.color}`,
                ["--drift" as any]: p.drift,
              }}
            />
          ))}

          {/* Carpet roll container */}
          <Box
            position="relative"
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="0"
            style={{ animation: "carpetEntrance 0.6s ease-out both" }}
          >
            {/* Rolled-up carpet cylinder at top */}
            <Box
              style={{
                width: "220px",
                height: "32px",
                borderRadius: "16px",
                background: `linear-gradient(180deg, ${COLORS.GOLD_BRIGHT} 0%, ${COLORS.GOLD_DIM} 40%, ${COLORS.CRIMSON} 60%, ${COLORS.CRIMSON_DEEP} 100%)`,
                boxShadow: `0 4px 24px ${COLORS.GOLD_GLOW}60, 0 2px 0 ${COLORS.GOLD_BASE}`,
              }}
            />

            {/* Carpet body unrolling downward */}
            <Box
              style={{
                width: "220px",
                background: `linear-gradient(180deg, ${COLORS.CRIMSON} 0%, ${COLORS.CRIMSON_DEEP} 100%)`,
                borderLeft: `4px solid ${COLORS.GOLD_DIM}`,
                borderRight: `4px solid ${COLORS.GOLD_DIM}`,
                transformOrigin: "top center",
                animation: "carpetUnroll 1.6s 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Carpet pattern lines */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "1px",
                    margin: "18px 8px",
                    background: `linear-gradient(90deg, transparent, ${COLORS.GOLD_DIM}60, transparent)`,
                  }}
                />
              ))}
              {/* Center diamond row */}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", display: "flex", flexDirection: "column", gap: "32px" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 16 16">
                    <polygon points="8,1 15,8 8,15 1,8" fill="none" stroke={COLORS.GOLD_DIM} strokeWidth="1.5" opacity="0.7" />
                  </svg>
                ))}
              </div>
              {/* Bottom fringe */}
              <div style={{ display: "flex", justifyContent: "center", gap: "6px", padding: "4px 12px 8px" }}>
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} style={{ width: "4px", height: "16px", background: COLORS.GOLD_BASE, borderRadius: "0 0 2px 2px", opacity: 0.9 }} />
                ))}
              </div>
            </Box>
          </Box>

          {/* Welcome text */}
          <Box
            mt="10"
            textAlign="center"
            style={{ animation: phase === "spotlight" ? "fadeInDown 0.8s 0.4s ease-out both" : "fadeInUp 0.7s 1.2s ease-out both" }}
          >
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.5em",
                color: COLORS.GOLD_DIM,
                textTransform: "uppercase",
                marginBottom: "8px",
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              ✦ Welcome to Stardom ✦
            </Text>
            <Text
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: phase === "spotlight" ? "3.2rem" : "2.6rem",
                fontWeight: "700",
                color: COLORS.GOLD_BRIGHT,
                textShadow: `0 0 60px ${COLORS.GOLD_GLOW}`,
                lineHeight: "1",
                transition: "all 0.8s ease",
              }}
            >
              The Red Carpet Unfolds
            </Text>
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.7rem",
                letterSpacing: "0.2em",
                color: COLORS.GOLD_BASE,
                marginTop: "16px",
                opacity: phase === "reveal" ? 1 : 0,
                transition: "opacity 0.6s ease 2.2s",
              }}
            >
              FOR YOU
            </Text>
          </Box>
        </Box>
      )}

      {/* ── SUCCESS CARD ── */}
      <Box
        maxW="600px"
        mx="auto"
        mt="12"
        p={{ base: "8", md: "12" }}
        textAlign="center"
        style={{
          border: `2px solid ${COLORS.GOLD_DIM}`,
          background: `linear-gradient(180deg, ${COLORS.PANEL_MID}80 0%, ${COLORS.BG} 100%)`,
          boxShadow: phase === "done" ? `0 0 80px ${COLORS.GOLD_GLOW}50, inset 0 0 40px ${COLORS.GOLD_GLOW}20` : `0 0 60px ${COLORS.GOLD_GLOW}30`,
          opacity: phase === "done" ? 1 : 0,
          transform: phase === "done" ? "translateY(0) scale(1)" : "translateY(60px) scale(0.95)",
          transition: "all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        }}
      >
        <VStack gap="6">
          {/* Diamond icon */}
          <Box>
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <polygon points="30,4 56,22 56,38 30,56 4,38 4,22" fill="none" stroke={COLORS.GOLD_BASE} strokeWidth="2" />
              <polygon points="30,12 48,24 48,36 30,48 12,36 12,24" fill={COLORS.GOLD_GLOW} opacity="0.4" />
              <polygon points="30,20 42,28 42,32 30,40 18,32 18,28" fill={COLORS.GOLD_BRIGHT} opacity="0.8" />
            </svg>
          </Box>

          {/* Heading */}
          <VStack gap="1">
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.4em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>
              ✦ Reservation Confirmed ✦
            </Text>
            <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2.8rem", fontWeight: "700", color: COLORS.GOLD_BRIGHT, lineHeight: "1", textShadow: `0 0 30px ${COLORS.GOLD_GLOW}` }}>
              You're on the List
            </Text>
          </VStack>

          {/* Details card */}
          <Box w="full" p="6" style={{ border: `1px solid ${COLORS.GOLD_DIM}40`, background: `${COLORS.GOLD_GLOW}10` }}>
            <VStack gap="4">
              {[
                { label: "Tier", value: tier },
                { label: "Table", value: String(tableNumber) },
                { label: "Tickets", value: String(quantity) },
                { label: "Group Code", value: groupCode, highlight: true },
              ].map((row, i) => (
                <Box key={i} w="full">
                  <HStack justify="space-between" w="full">
                    <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>
                      {row.label}
                    </Text>
                    <Text style={{
                      fontFamily: row.highlight ? "'Josefin Sans', sans-serif" : "'Cormorant Garamond', serif",
                      fontSize: row.highlight ? "1rem" : "1.1rem",
                      fontWeight: "700",
                      letterSpacing: row.highlight ? "0.15em" : undefined,
                      color: COLORS.GOLD_BRIGHT,
                      textShadow: row.highlight ? `0 0 15px ${COLORS.GOLD_GLOW}` : undefined,
                    }}>
                      {row.value}
                    </Text>
                  </HStack>
                  {i < 3 && <div style={{ height: "1px", width: "100%", background: `${COLORS.GOLD_DIM}30`, marginTop: "16px" }} />}
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Email notice */}
          <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.1em", color: COLORS.GOLD_DIM, lineHeight: "1.6" }}>
            A confirmation has been sent to{" "}
            <span style={{ color: COLORS.GOLD_BASE }}>{primaryEmail}</span>
          </Text>

          {/* QR notice */}
          <Box p="4" style={{ border: `1px solid ${COLORS.CRIMSON}40`, background: `${COLORS.CRIMSON}10` }}>
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", letterSpacing: "0.08em", color: COLORS.GOLD_BASE, lineHeight: "1.6" }}>
              Your exclusive QR entry code arrives 3 days before the Gala.
              <br />
              <span style={{ color: COLORS.CRIMSON, fontStyle: "italic" }}>Guard it — it is yours alone.</span>
            </Text>
          </Box>

          <div style={{ height: "1px", width: "100%", background: `linear-gradient(90deg, transparent, ${COLORS.GOLD_DIM}40, transparent)` }} />

          <Text style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", fontStyle: "italic", color: COLORS.CRIMSON, lineHeight: "1.6", letterSpacing: "0.02em" }}>
            "{FITZGERALD_QUOTE}"
          </Text>
          <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.55rem", letterSpacing: "0.2em", color: COLORS.GOLD_DIM, opacity: 0.7 }}>
            — F. Scott Fitzgerald
          </Text>
        </VStack>
      </Box>

      {/* Keyframe styles */}
      <style>{`
        @keyframes carpetUnroll {
          from { height: 0px; }
          to   { height: 280px; }
        }
        @keyframes carpetEntrance {
          from { transform: translateY(-60px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(0)     rotate(0deg)   translateX(0);        opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg) translateX(var(--drift, 60px)); opacity: 0; }
        }
        @keyframes confettiBurst {
          0%   { transform: translate(0, 0) rotate(0deg);   opacity: 1; }
          100% { transform: translate(var(--drift, 100px), -100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spotlightPulse {
          0%   { opacity: 0; transform: scale(0.8); }
          50%  { opacity: 1; }
          100% { opacity: 0; transform: scale(1.2); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
      `}</style>
    </Box>
  )
}
