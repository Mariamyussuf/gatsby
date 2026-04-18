import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Box, Text, VStack, HStack, Input, Button } from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import { COLORS, EVENT_DATE, TRANSFER_LOCK_HOURS, FITZGERALD_QUOTE } from "@/config/constants"
import { toaster } from "@/components/ui/toaster"

type AttendeeData = {
  id: string
  first_name: string
  last_name: string
  email: string
  ticket_id: string
  group_booking_code: string
  table_number: number
  transfer_locked: boolean
  tier_name?: string
}

export default function ManageTicketPage() {
  const { manageToken } = useParams<{ manageToken: string }>()
  const [attendee, setAttendee] = useState<AttendeeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isLocked = () => {
    const lockTime = new Date(EVENT_DATE.getTime() - TRANSFER_LOCK_HOURS * 60 * 60 * 1000)
    return new Date() >= lockTime || (attendee?.transfer_locked ?? false)
  }

  useEffect(() => {
    const fetchAttendee = async () => {
      const { data, error } = await supabase
        .from("attendees")
        .select("*, ticket_tiers (name)")
        .eq("manage_token", manageToken)
        .maybeSingle()

      if (error || !data) {
        setNotFound(true)
      } else {
        setAttendee({ ...data, tier_name: data.ticket_tiers?.name })
        setFirstName(data.first_name)
        setLastName(data.last_name)
        setEmail(data.email)
      }
      setLoading(false)
    }
    fetchAttendee()
  }, [manageToken])

  const handleSave = async () => {
    if (!attendee || isLocked()) return
    if (!firstName || !lastName || !email) {
      toaster.error({ title: "Please fill in all fields." })
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toaster.error({ title: "Please enter a valid email address." })
      return
    }
    setSaving(true)
    const { error } = await supabase.from("attendees").update({
      first_name: firstName,
      last_name: lastName,
      email,
    }).eq("id", attendee.id)

    if (!error) {
      await supabase.from("transfer_log").insert({
        attendee_id: attendee.id,
        old_first_name: attendee.first_name,
        old_last_name: attendee.last_name,
        old_email: attendee.email,
        new_first_name: firstName,
        new_last_name: lastName,
        new_email: email,
      })

      // 👉 Resend email trigger here — send transfer confirmation emails
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-transfer-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          attendee_id: attendee.id,
          new_email: email,
          new_name: `${firstName} ${lastName}`,
          old_email: attendee.email,
        }),
      }).catch(() => {})

      setAttendee((prev) => prev ? { ...prev, first_name: firstName, last_name: lastName, email } : prev)
      setSaved(true)
      toaster.success({ title: "Ticket updated", description: "Confirmation emails have been sent." })
    } else {
      toaster.error({ title: "Error updating ticket", description: error.message })
    }
    setSaving(false)
  }

  const containerStyle = {
    backgroundColor: COLORS.BG,
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
  }

  const cardStyle = {
    border: `1px solid ${COLORS.GOLD_DIM}40`,
    background: `linear-gradient(180deg, ${COLORS.PANEL_MID}80 0%, ${COLORS.BG} 100%)`,
    padding: "48px",
    maxWidth: "500px",
    width: "100%",
  }

  const inputStyle = {
    background: `${COLORS.PANEL_MID}60`,
    border: `1px solid ${COLORS.GOLD_DIM}40`,
    color: COLORS.GOLD_BASE,
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "0.8rem",
  }

  const labelStyle = {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: "0.55rem",
    letterSpacing: "0.2em",
    color: COLORS.GOLD_DIM,
    textTransform: "uppercase" as const,
    marginBottom: "4px",
    display: "block",
  }

  if (loading) {
    return (
      <div style={containerStyle}>
        <Text style={{ fontFamily: "'Josefin Sans', sans-serif", color: COLORS.GOLD_DIM, fontSize: "0.8rem", letterSpacing: "0.2em" }}>
          Loading...
        </Text>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <VStack gap="4" textAlign="center">
            <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: "700", color: COLORS.CRIMSON }}>
              Ticket Not Found
            </Text>
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_DIM }}>
              This link is invalid or has expired.
            </Text>
          </VStack>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <VStack gap="6" align="stretch">
          {/* Header */}
          <VStack gap="1" textAlign="center">
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.55rem", letterSpacing: "0.4em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>
              ✦ Manage My Ticket ✦
            </Text>
            <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: "700", color: COLORS.GOLD_BRIGHT }}>
              {attendee?.first_name} {attendee?.last_name}
            </Text>
          </VStack>

          {/* Ticket info */}
          <Box p="4" style={{ border: `1px solid ${COLORS.GOLD_DIM}30`, background: `${COLORS.GOLD_GLOW}10` }}>
            <VStack gap="2">
              <HStack justify="space-between" w="full">
                <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>Tier</Text>
                <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_BASE }}>{attendee?.tier_name}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>Table</Text>
                <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_BASE }}>{attendee?.table_number}</Text>
              </HStack>
              <HStack justify="space-between" w="full">
                <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", letterSpacing: "0.15em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>Ticket ID</Text>
                <Text style={{ fontFamily: "monospace", fontSize: "0.6rem", color: COLORS.GOLD_BASE }}>{attendee?.ticket_id}</Text>
              </HStack>
            </VStack>
          </Box>

          {isLocked() ? (
            <Box p="4" textAlign="center" style={{ border: `1px solid ${COLORS.CRIMSON}40`, background: `${COLORS.CRIMSON}10` }}>
              <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", letterSpacing: "0.1em", color: COLORS.CRIMSON, fontStyle: "italic" }}>
                Ticket transfers are now closed. The name on this ticket is final.
              </Text>
            </Box>
          ) : saved ? (
            <Box p="4" textAlign="center" style={{ border: `1px solid ${COLORS.GOLD_DIM}40`, background: `${COLORS.GOLD_GLOW}10` }}>
              <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_BASE }}>
                ✓ Ticket updated. Confirmation emails have been sent.
              </Text>
            </Box>
          ) : (
            <VStack gap="4" align="stretch">
              <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.55rem", letterSpacing: "0.2em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>
                Update Name / Transfer Ticket
              </Text>
              <Box>
                <label style={labelStyle}>First Name</label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
              </Box>
              <Box>
                <label style={labelStyle}>Last Name</label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
              </Box>
              <Box>
                <label style={labelStyle}>Email Address</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} />
              </Box>
              <Button
                onClick={handleSave}
                loading={saving}
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
                Save Changes
              </Button>
            </VStack>
          )}

          {/* Quote */}
          <Box pt="4" style={{ borderTop: `1px solid ${COLORS.GOLD_DIM}20` }}>
            <Text textAlign="center" style={{ fontFamily: "'Playfair Display', serif", fontSize: "0.8rem", fontStyle: "italic", color: COLORS.CRIMSON, lineHeight: "1.7" }}>
              "{FITZGERALD_QUOTE}"
            </Text>
          </Box>
        </VStack>
      </div>
    </div>
  )
}
