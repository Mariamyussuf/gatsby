import { useState } from "react"
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { toaster } from "@/components/ui/toaster"

const ADMIN_PASSWORD = "BusaGala2025!"

type Props = {
  onLogin: () => void
}

export function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem("gatsby_admin", "1")
        onLogin()
      } else {
        toaster.error({ title: "Access Denied", description: "Invalid password." })
      }
      setLoading(false)
    }, 600)
  }

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      style={{ backgroundColor: COLORS.BG }}
    >
      <Box
        w="full"
        maxW="400px"
        p="10"
        style={{
          border: `1px solid ${COLORS.GOLD_DIM}40`,
          background: `linear-gradient(180deg, ${COLORS.PANEL_MID}80 0%, ${COLORS.BG} 100%)`,
          boxShadow: `0 0 60px ${COLORS.GOLD_GLOW}20`,
        }}
      >
        <VStack gap="8">
          <VStack gap="1" textAlign="center">
            <Text
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2rem",
                fontWeight: "700",
                letterSpacing: "0.3em",
                color: COLORS.GOLD_BRIGHT,
              }}
            >
              BUSA
            </Text>
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.55rem",
                letterSpacing: "0.35em",
                color: COLORS.GOLD_DIM,
                textTransform: "uppercase",
              }}
            >
              Admin Dashboard
            </Text>
          </VStack>

          <VStack gap="3" w="full">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              style={{
                background: `${COLORS.PANEL_MID}60`,
                border: `1px solid ${COLORS.GOLD_DIM}40`,
                color: COLORS.GOLD_BASE,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.8rem",
              }}
            />
            <Button
              onClick={handleLogin}
              loading={loading}
              w="full"
              style={{
                background: `linear-gradient(135deg, ${COLORS.GOLD_DIM}, ${COLORS.GOLD_BASE})`,
                color: COLORS.BG,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.65rem",
                fontWeight: "600",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                height: "48px",
                cursor: "pointer",
              }}
            >
              Enter
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Box>
  )
}
