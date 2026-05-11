"use client"

import { useEffect, useState } from "react"
import { Box, VStack, HStack, Heading, Button, Text, Spinner, Table } from "@chakra-ui/react"
import { Checkbox } from "@/components/ui/checkbox"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"

interface VVIPAttendee {
  id: string
  attendee_id: string
  first_name: string
  last_name: string
  email: string
  ticket_id: string
  table_number: number
  picked_up: boolean
  picked_up_by: string | null
  picked_up_at: string | null
}

export function VVIPPickupManager() {
  const [attendees, setAttendees] = useState<VVIPAttendee[]>([])
  const [filtered, setFiltered] = useState<VVIPAttendee[]>([])
  const [loading, setLoading] = useState(true)
  const [showPickedUp, setShowPickedUp] = useState(false)
  const [tierMissing, setTierMissing] = useState(false)

  useEffect(() => {
    fetchVVIPAttendees()
  }, [])

  useEffect(() => {
    if (showPickedUp) {
      setFiltered(attendees.filter((a) => a.picked_up))
    } else {
      setFiltered(attendees.filter((a) => !a.picked_up))
    }
  }, [attendees, showPickedUp])

  const fetchVVIPAttendees = async () => {
    try {
      // Match tier case-insensitively (schema seed uses "VVIP"; remote DB may differ)
      const { data: tierList } = await supabase
        .from("ticket_tiers")
        .select("id, name")
        .ilike("name", "vvip")
        .limit(10)

      const tierData =
        tierList?.find((t) => t.name === "VVIP") ??
        tierList?.find((t) => t.name.replace(/\s+/g, "").toLowerCase() === "vvip") ??
        tierList?.[0]

      if (!tierData?.id) {
        console.warn("[v0] VVIP tier not found — no `ticket_tiers` row matches name ILIKE 'vvip'")
        setTierMissing(true)
        setAttendees([])
        setLoading(false)
        return
      }
      setTierMissing(false)

      // Fetch VVIP attendees with pickup info
      const { data, error } = await supabase
        .from("attendees")
        .select("id, first_name, last_name, email, ticket_id, table_number")
        .eq("tier_id", tierData.id)
        .order("first_name")

      if (error) {
        console.error("[v0] Error fetching VVIP attendees:", error)
        setLoading(false)
        return
      }

      if (!data) {
        setLoading(false)
        return
      }

      // Get pickup info for each attendee
      const attendeesWithPickup: VVIPAttendee[] = []
      for (const attendee of data) {
        const { data: pickupData } = await supabase
          .from("vvip_pickups")
          .select("id, picked_up, picked_up_by, picked_up_at")
          .eq("attendee_id", attendee.id)
          .maybeSingle()

        attendeesWithPickup.push({
          id: pickupData?.id || "",
          attendee_id: attendee.id,
          first_name: attendee.first_name,
          last_name: attendee.last_name,
          email: attendee.email,
          ticket_id: attendee.ticket_id,
          table_number: attendee.table_number,
          picked_up: pickupData?.picked_up || false,
          picked_up_by: pickupData?.picked_up_by || null,
          picked_up_at: pickupData?.picked_up_at || null,
        })
      }

      setAttendees(attendeesWithPickup)
    } catch (err) {
      console.error("[v0] Error in VVIPPickupManager:", err)
    } finally {
      setLoading(false)
    }
  }

  const togglePickup = async (attendee: VVIPAttendee) => {
    try {
      const { error } = await supabase
        .from("vvip_pickups")
        .update({
          picked_up: !attendee.picked_up,
          picked_up_by: !attendee.picked_up ? "Admin" : null,
          picked_up_at: !attendee.picked_up ? new Date().toISOString() : null,
        })
        .eq("attendee_id", attendee.attendee_id)

      if (error) throw error

      toaster.create({
        title: attendee.picked_up ? "Unmarked as picked up" : "Marked as picked up",
        description: `${attendee.first_name} ${attendee.last_name}`,
        type: "success",
      })

      fetchVVIPAttendees()
    } catch (err) {
      console.error("[v0] Error toggling pickup:", err)
      toaster.create({ title: "Error updating pickup status", type: "error" })
    }
  }

  if (loading) {
    return (
      <VStack justify="center" align="center" minH="300px">
        <Spinner color={COLORS.GOLD_BASE} size="lg" />
        <Text color={COLORS.TEXT}>Loading VVIP attendees...</Text>
      </VStack>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      {tierMissing && (
        <Box p={4} borderRadius="md" borderWidth={1} borderColor={COLORS.GOLD_DIM} bg={`${COLORS.PANEL_MID}80`}>
          <Text color={COLORS.TEXT} fontSize="sm">
            No VVIP tier found in <code>ticket_tiers</code> (expected a row whose name matches{" "}
            <code>VVIP</code> case-insensitively). Seed or rename the tier in Supabase, then refresh.
          </Text>
        </Box>
      )}
      <HStack justify="space-between">
        <Heading size="lg" color={COLORS.GOLD_BASE}>
          VVIP Ticket Pickups
        </Heading>
        <HStack>
          <Checkbox
            checked={showPickedUp}
            onCheckedChange={(d) => setShowPickedUp(d.checked === true)}
            colorPalette="orange"
          >
            <Text color={COLORS.TEXT} fontSize="sm">
              Show picked up only
            </Text>
          </Checkbox>
        </HStack>
      </HStack>

      <Box overflowX="auto" borderRadius="md" borderColor={COLORS.ACCENT} borderWidth={1}>
        <Table.Root size="sm">
          <Table.Header bg={COLORS.PANEL_DARK}>
            <Table.Row>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600">
                Name
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600">
                Email
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600" textAlign="center">
                Ticket ID
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600" textAlign="center">
                Table
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600" textAlign="center">
                Picked Up
              </Table.ColumnHeader>
              <Table.ColumnHeader color={COLORS.GOLD_BASE} fontWeight="600">
                Action
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filtered.map((attendee) => (
              <Table.Row key={attendee.attendee_id} _hover={{ bg: `${COLORS.GOLD_BASE}15` }}>
                <Table.Cell color={COLORS.TEXT} fontWeight="500">
                  {attendee.first_name} {attendee.last_name}
                </Table.Cell>
                <Table.Cell color={COLORS.TEXT_MUTED} fontSize="xs">
                  {attendee.email}
                </Table.Cell>
                <Table.Cell color={COLORS.TEXT} textAlign="center" fontSize="sm" fontFamily="monospace">
                  {attendee.ticket_id}
                </Table.Cell>
                <Table.Cell color={COLORS.TEXT} textAlign="center">
                  {attendee.table_number}
                </Table.Cell>
                <Table.Cell textAlign="center">
                  <Text
                    fontSize="sm"
                    fontWeight="600"
                    color={attendee.picked_up ? "#10b981" : "#ef4444"}
                    textTransform="uppercase"
                  >
                    {attendee.picked_up ? "✓ Yes" : "✗ No"}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  <Button size="sm" onClick={() => togglePickup(attendee)} colorScheme={attendee.picked_up ? "red" : "green"}>
                    {attendee.picked_up ? "Undo" : "Mark Pickup"}
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {filtered.length === 0 && (
        <Text color={COLORS.TEXT_MUTED} textAlign="center" py={8}>
          {showPickedUp ? "No VVIP attendees picked up yet" : "All VVIP attendees have been picked up"}
        </Text>
      )}

      <HStack fontSize="sm" color={COLORS.TEXT_MUTED}>
        <Text>Total VVIP attendees: {attendees.length}</Text>
        <Text>•</Text>
        <Text>Picked up: {attendees.filter((a) => a.picked_up).length}</Text>
        <Text>•</Text>
        <Text>Pending: {attendees.filter((a) => !a.picked_up).length}</Text>
      </HStack>
    </VStack>
  )
}
