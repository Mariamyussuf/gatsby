import { useState } from "react"
import { Box, Button, Input, Text, VStack } from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import type { TicketTier } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import { toaster } from "@/components/ui/toaster"

type Props = {
  tier: TicketTier
  compact?: boolean
}

export function WaitlistForm({ tier, compact }: Props) {
  const [open, setOpen] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async () => {
    if (!firstName || !email) return
    setLoading(true)
    const { error } = await supabase.from("waitlist").insert({
      first_name: firstName,
      email,
      tier_id: tier.id,
      tier_name: tier.name,
    })
    setLoading(false)
    if (error) {
      toaster.error({ title: "Error joining waitlist", description: error.message })
    } else {
      setDone(true)
      toaster.success({ title: "You're on the waitlist!", description: "We'll notify you if a seat becomes available." })
    }
  }

  if (done) {
    return (
      <Box
        p="3"
        textAlign="center"
        style={{ border: `1px solid ${COLORS.GOLD_DIM}40`, background: `${COLORS.GOLD_GLOW}10` }}
      >
        <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", color: COLORS.GOLD_DIM, letterSpacing: "0.1em" }}>
          ✦ You're on the waitlist
        </Text>
      </Box>
    )
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        style={{
          background: "transparent",
          border: `1px solid ${COLORS.CRIMSON}60`,
          color: COLORS.CRIMSON,
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.6rem",
          fontWeight: "400",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          cursor: "pointer",
          height: "44px",
        }}
        _hover={{ borderColor: COLORS.CRIMSON, background: `${COLORS.CRIMSON}10` }}
      >
        Join Waitlist
      </Button>
    )
  }

  return (
    <VStack gap="2" align="stretch">
      <Input
        placeholder="First Name"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        size="sm"
        style={{
          background: `${COLORS.PANEL_MID}80`,
          border: `1px solid ${COLORS.GOLD_DIM}40`,
          color: COLORS.GOLD_BASE,
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.7rem",
        }}
      />
      <Input
        placeholder="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        size="sm"
        style={{
          background: `${COLORS.PANEL_MID}80`,
          border: `1px solid ${COLORS.GOLD_DIM}40`,
          color: COLORS.GOLD_BASE,
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.7rem",
        }}
      />
      <Button
        onClick={handleSubmit}
        loading={loading}
        size="sm"
        style={{
          background: COLORS.CRIMSON,
          color: "white",
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.6rem",
          letterSpacing: "0.15em",
          height: "36px",
        }}
      >
        Join Waitlist
      </Button>
    </VStack>
  )
}
