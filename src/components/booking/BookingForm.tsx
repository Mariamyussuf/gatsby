import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  Textarea,
  Separator,
} from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import type { TicketTier, GalaTable } from "@/lib/supabase"
import { COLORS, SQUAD_PUBLIC_KEY, SQUAD_BASE_URL } from "@/config/constants"
import { SuccessScreen } from "./SuccessScreen"
import { toaster } from "@/components/ui/toaster"

type GuestInfo = { firstName: string; email: string }

type Props = {
  tier: TicketTier
  table: GalaTable
  onTableFilled: () => void
}

function generateRef(): string {
  return `GATSBY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
}

function generateGroupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `GATSBY-${code}`
}

function generateToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 16)}`
}

export function BookingForm({ tier, table, onTableFilled }: Props) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [guests, setGuests] = useState<GuestInfo[]>([])
  const [seatingNotes, setSeatingNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [successData, setSuccessData] = useState<null | {
    groupCode: string
    tier: string
    tableNumber: number
    quantity: number
  }>(null)

  const seatsLeft = table.seats_total - table.seats_booked
  const maxQty = Math.min(seatsLeft, 10)
  const total = (tier.price_kobo * quantity) / 100

  useEffect(() => {
    if (quantity > 1) {
      setGuests(
        Array.from({ length: quantity - 1 }, (_, i) =>
          guests[i] || { firstName: "", email: "" }
        )
      )
    } else {
      setGuests([])
    }
  }, [quantity])

  const updateGuest = (idx: number, field: keyof GuestInfo, value: string) => {
    const updated = [...guests]
    updated[idx] = { ...updated[idx], [field]: value }
    setGuests(updated)
  }

  const validate = (): string | null => {
    if (!firstName || !lastName || !email || !phone) return "Please fill in all required fields."
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email address."
    if (quantity < 1 || quantity > maxQty) return `Quantity must be between 1 and ${maxQty}.`
    for (const g of guests) {
      if (!g.firstName || !g.email) return "Please fill in all guest details."
      if (!/\S+@\S+\.\S+/.test(g.email)) return "Please enter valid guest email addresses."
    }
    return null
  }

  const handlePayment = async () => {
    const err = validate()
    if (err) { toaster.error({ title: "Validation Error", description: err }); return }

    setLoading(true)
    const reference = generateRef()
    const groupCode = generateGroupCode()

    try {
      // Create pending transaction in DB
      const { data: txn, error: txnErr } = await supabase.from("transactions").insert({
        reference,
        tier_id: tier.id,
        table_id: table.id,
        primary_email: email,
        primary_first_name: firstName,
        primary_last_name: lastName,
        primary_phone: phone,
        quantity,
        unit_price_kobo: tier.price_kobo,
        total_kobo: tier.price_kobo * quantity,
        group_booking_code: groupCode,
        payment_status: "pending",
        seating_notes: seatingNotes || null,
      }).select().single()

      if (txnErr) throw txnErr

      // 👉 Squad payment initialisation here
      // Load Squad inline payment
      const squadPublicKey = SQUAD_PUBLIC_KEY || "sandbox_pk_sample_12345"

      const allAttendees = [
        { firstName, email, isPrimary: true },
        ...guests.map((g) => ({ firstName: g.firstName, email: g.email, isPrimary: false })),
      ]

      // For dev/demo: simulate successful payment
      if (!SQUAD_PUBLIC_KEY || SQUAD_PUBLIC_KEY === "undefined") {
        await confirmPayment(txn.id, reference, groupCode, allAttendees)
        return
      }

      // Real Squad implementation
      const SquadPay = (window as any).SquadPay
      if (!SquadPay) throw new Error("Squad payment SDK not loaded")

      const squad = new SquadPay({
        onClose: () => { setLoading(false) },
        onLoad: () => {},
        onSuccess: async (data: any) => {
          await confirmPayment(txn.id, reference, groupCode, allAttendees, data.transaction_ref)
        },
        key: squadPublicKey,
        email,
        amount: tier.price_kobo * quantity,
        currency_code: "NGN",
        transaction_ref: reference,
        payment_channels: ["card", "bank", "ussd"],
        metadata: {
          tier: tier.name,
          table: table.table_number,
          quantity,
          group_code: groupCode,
        },
      })
      squad.setup()
      squad.open()
    } catch (e: any) {
      toaster.error({ title: "Payment Error", description: e.message })
      setLoading(false)
    }
  }

  const confirmPayment = async (
    txnId: string,
    reference: string,
    groupCode: string,
    attendees: { firstName: string; email: string; isPrimary: boolean }[],
    squadRef?: string
  ) => {
    try {
      // Check table still has space
      const { data: freshTable } = await supabase
        .from("gala_tables")
        .select("seats_booked, seats_total")
        .eq("id", table.id)
        .single()

      if (freshTable && freshTable.seats_booked + quantity > freshTable.seats_total) {
        onTableFilled()
        setLoading(false)
        return
      }

      // Update transaction status
      await supabase.from("transactions").update({
        payment_status: "confirmed",
        squad_reference: squadRef || `demo_${Date.now()}`,
        confirmed_at: new Date().toISOString(),
      }).eq("id", txnId)

      // Atomically decrement seats
      try {
        await supabase.rpc("increment_seats_booked", {
          p_table_id: table.id,
          p_quantity: quantity,
        })
      } catch {
        // Fallback if RPC not available
        await supabase.from("gala_tables").update({
          seats_booked: table.seats_booked + quantity,
        }).eq("id", table.id)
      }

      // Create attendee records
      for (const att of attendees) {
        const ticketId = `BUSA-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        const manageToken = generateToken()
        await supabase.from("attendees").insert({
          transaction_id: txnId,
          tier_id: tier.id,
          table_id: table.id,
          table_number: table.table_number,
          first_name: att.firstName,
          last_name: att.isPrimary ? lastName : att.firstName,
          email: att.email,
          ticket_id: ticketId,
          group_booking_code: groupCode,
          is_primary: att.isPrimary,
          transfer_locked: false,
          manage_token: manageToken,
        })

        // Create VVIP pickup record if needed
        if (tier.name === "VVIP") {
          const { data: attendeeRecord } = await supabase.from("attendees")
            .select("id").eq("manage_token", manageToken).single()
          if (attendeeRecord) {
            await supabase.from("vvip_pickups").insert({ attendee_id: attendeeRecord.id })
          }
        }
      }

      // 👉 Resend email trigger here
      // Trigger confirmation emails via Edge Function
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-confirmation-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ reference, groupCode }),
      }).catch(() => {}) // Non-blocking

      setSuccessData({
        groupCode,
        tier: tier.name,
        tableNumber: table.table_number,
        quantity,
      })
    } catch (e: any) {
      toaster.error({ title: "Error confirming payment", description: e.message })
    } finally {
      setLoading(false)
    }
  }

  if (successData) {
    return <SuccessScreen {...successData} primaryEmail={email} />
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
    fontSize: "0.6rem",
    letterSpacing: "0.2em",
    color: COLORS.GOLD_DIM,
    textTransform: "uppercase" as const,
    marginBottom: "4px",
  }

  return (
    <Box
      id="booking-form"
      maxW="700px"
      mx="auto"
      mt="12"
      p={{ base: "6", md: "10" }}
      style={{
        border: `1px solid ${COLORS.GOLD_DIM}40`,
        background: `linear-gradient(180deg, ${COLORS.PANEL_MID}60 0%, ${COLORS.BG} 100%)`,
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
            ✦ Your Details ✦
          </Text>
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: "700",
              color: COLORS.GOLD_BRIGHT,
            }}
          >
            Complete Your Booking
          </Text>
        </VStack>

        {/* Selected info */}
        <Box
          p="4"
          style={{ border: `1px solid ${COLORS.GOLD_DIM}30`, background: `${COLORS.GOLD_GLOW}10` }}
        >
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              color: COLORS.GOLD_DIM,
            }}
          >
            {tier.name} · Table {table.table_number} · {seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} available
          </Text>
        </Box>

        {/* Primary attendee */}
        <VStack gap="4" align="stretch">
          <Text style={{ ...labelStyle }}>Primary Attendee</Text>
          <HStack gap="4">
            <Box flex="1">
              <Text style={labelStyle}>First Name *</Text>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} placeholder="First name" />
            </Box>
            <Box flex="1">
              <Text style={labelStyle}>Last Name *</Text>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} placeholder="Last name" />
            </Box>
          </HStack>
          <Box>
            <Text style={labelStyle}>Email Address *</Text>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={inputStyle} placeholder="your@email.com" />
          </Box>
          <Box>
            <Text style={labelStyle}>Phone Number *</Text>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" style={inputStyle} placeholder="+234 800 000 0000" />
          </Box>
        </VStack>

        <Separator style={{ borderColor: `${COLORS.GOLD_DIM}30` }} />

        {/* Quantity */}
        <Box>
          <Text style={labelStyle}>Number of Tickets *</Text>
          <HStack gap="3">
            <Button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.GOLD_DIM}60`,
                color: COLORS.GOLD_BASE,
                width: "40px",
                height: "40px",
                cursor: "pointer",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.2rem",
              }}
            >
              −
            </Button>
            <Text
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.5rem",
                color: COLORS.GOLD_BRIGHT,
                minWidth: "40px",
                textAlign: "center",
              }}
            >
              {quantity}
            </Text>
            <Button
              onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
              style={{
                background: "transparent",
                border: `1px solid ${COLORS.GOLD_DIM}60`,
                color: COLORS.GOLD_BASE,
                width: "40px",
                height: "40px",
                cursor: "pointer",
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.2rem",
              }}
            >
              +
            </Button>
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                color: COLORS.GOLD_DIM,
                letterSpacing: "0.1em",
              }}
            >
              Max {maxQty}
            </Text>
          </HStack>
        </Box>

        {/* Additional guests */}
        {guests.length > 0 && (
          <VStack gap="4" align="stretch">
            <Separator style={{ borderColor: `${COLORS.GOLD_DIM}30` }} />
            <Text style={labelStyle}>Additional Guests</Text>
            {guests.map((g, i) => (
              <Box
                key={i}
                p="4"
                style={{ border: `1px solid ${COLORS.GOLD_DIM}20`, background: `${COLORS.PANEL_MID}30` }}
              >
                <Text
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    color: COLORS.GOLD_DIM,
                    marginBottom: "8px",
                  }}
                >
                  Guest {i + 1}
                </Text>
                <HStack gap="4">
                  <Box flex="1">
                    <Text style={labelStyle}>First Name *</Text>
                    <Input
                      value={g.firstName}
                      onChange={(e) => updateGuest(i, "firstName", e.target.value)}
                      style={inputStyle}
                      placeholder="First name"
                      size="sm"
                    />
                  </Box>
                  <Box flex="1">
                    <Text style={labelStyle}>Email *</Text>
                    <Input
                      value={g.email}
                      onChange={(e) => updateGuest(i, "email", e.target.value)}
                      type="email"
                      style={inputStyle}
                      placeholder="guest@email.com"
                      size="sm"
                    />
                  </Box>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}

        {/* Seating notes */}
        <Box>
          <Text style={labelStyle}>Table Preference / Notes (Optional)</Text>
          <Textarea
            value={seatingNotes}
            onChange={(e) => setSeatingNotes(e.target.value)}
            style={inputStyle}
            placeholder="Any seating preferences or special notes..."
            rows={3}
          />
        </Box>

        <Separator style={{ borderColor: `${COLORS.GOLD_DIM}30` }} />

        {/* Order summary */}
        <VStack gap="3" align="stretch">
          <Text style={labelStyle}>Order Summary</Text>
          <HStack justify="space-between">
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_DIM }}>
              {tier.name} Ticket × {quantity}
            </Text>
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_BASE }}>
              ₦{(tier.price_kobo / 100).toLocaleString()} each
            </Text>
          </HStack>
          <HStack justify="space-between">
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_DIM }}>
              Table {table.table_number}
            </Text>
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.7rem", color: COLORS.GOLD_DIM }}>
              {tier.name} Section
            </Text>
          </HStack>
          <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${COLORS.GOLD_DIM}40, transparent)` }} />
          <HStack justify="space-between">
            <Text
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.2rem",
                fontWeight: "700",
                color: COLORS.GOLD_BRIGHT,
              }}
            >
              Total
            </Text>
            <Text
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.4rem",
                fontWeight: "700",
                color: COLORS.GOLD_BRIGHT,
                textShadow: `0 0 15px ${COLORS.GOLD_GLOW}`,
              }}
            >
              ₦{total.toLocaleString()}
            </Text>
          </HStack>
        </VStack>

        {/* Submit */}
        <Button
          onClick={handlePayment}
          loading={loading}
          style={{
            background: `${COLORS.PANEL}`,
            border: `2px solid ${COLORS.GOLD_DIM}`,
            color: COLORS.GOLD_BRIGHT,
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.75rem",
            fontWeight: "600",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            height: "56px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: `0 0 20px ${COLORS.GOLD_GLOW}20`,
          }}
          _hover={{
            background: `${COLORS.GOLD_GLOW}30`,
            borderColor: COLORS.GOLD_BASE,
            boxShadow: `0 0 30px ${COLORS.GOLD_GLOW}40`,
          }}
        >
          ✦ Proceed to Payment ✦
        </Button>

        <Text
          textAlign="center"
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.55rem",
            letterSpacing: "0.1em",
            color: COLORS.GOLD_DIM,
            opacity: 0.6,
          }}
        >
          Secured by GTB Squad · Your seat is reserved on confirmed payment only
        </Text>
      </VStack>
    </Box>
  )
}
