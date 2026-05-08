import { useState } from "react"
import { Box, VStack, HStack, Input, Button, Text, Spinner, Badge } from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import { toaster } from "@/components/ui/toaster"

declare const __SUPABASE_URL__: string
declare const __SUPABASE_ANON_KEY__: string

export function ResendEmails() {
  const [groupCode, setGroupCode] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [attendees, setAttendees] = useState<any[]>([])

  const handleSearch = async () => {
    if (!groupCode.trim()) {
      toaster.create({ title: "Please enter a group code", type: "error" })
      return
    }

    setIsSearching(true)
    try {
      const { data, error } = await supabase
        .from("attendees")
        .select("id, first_name, last_name, email, ticket_id")
        .eq("group_code", groupCode.trim())

      if (error || !data || data.length === 0) {
        toaster.create({ title: "No attendees found for this group code", type: "error" })
        setAttendees([])
      } else {
        setAttendees(data)
        toaster.create({ title: `Found ${data.length} attendee(s)`, type: "success" })
      }
    } catch (err: any) {
      toaster.create({ title: `Error searching: ${err.message}`, type: "error" })
    } finally {
      setIsSearching(false)
    }
  }

  const handleResendEmails = async () => {
    if (attendees.length === 0) {
      toaster.create({ title: "No attendees to send emails to", type: "error" })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch(`${__SUPABASE_URL__}/functions/v1/send-confirmation-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${__SUPABASE_ANON_KEY__}`,
        },
        body: JSON.stringify({ groupCode: groupCode.trim() }),
      })

      if (!response.ok) {
        throw new Error(`Edge function returned ${response.status}`)
      }

      await response.json()

      toaster.create({
        title: "Emails sent successfully!",
        description: `Sent ${attendees.length} confirmation email(s)`,
        type: "success",
      })

      setGroupCode("")
      setAttendees([])
    } catch (err: any) {
      toaster.create({
        title: "Error sending emails",
        description: err.message,
        type: "error",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <VStack spacing={6} align="stretch">
      <Box p={6} bg={`${COLORS.GOLD_GLOW}10`} borderRadius="lg" border={`1px solid ${COLORS.GOLD_GLOW}30`}>
        <Text fontSize="lg" fontWeight="600" color={COLORS.GOLD_BASE} mb={4}>
          Resend Confirmation Emails
        </Text>
        <Text fontSize="sm" color={COLORS.TEXT_MUTED} mb={4}>
          Find attendees by group code and resend their confirmation emails with tickets.
        </Text>

        <VStack spacing={4} align="stretch">
          <HStack spacing={2}>
            <Input
              placeholder="Enter group code (e.g., GAL-ABC123)"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={isSearching}
              style={{
                borderColor: COLORS.GOLD_GLOW,
                color: COLORS.TEXT,
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching || !groupCode.trim()}
              bg={COLORS.GOLD_BASE}
              color={COLORS.BG}
              _hover={{ opacity: 0.9 }}
              minW="120px"
            >
              {isSearching ? <Spinner size="sm" /> : "Search"}
            </Button>
          </HStack>

          {attendees.length > 0 && (
            <Box p={4} bg={`${COLORS.GOLD_GLOW}20`} borderRadius="md" border={`1px solid ${COLORS.GOLD_GLOW}50`}>
              <Text fontSize="sm" color={COLORS.TEXT} mb={3}>
                <strong>Found {attendees.length} attendee(s):</strong>
              </Text>
              <VStack spacing={2} align="stretch">
                {attendees.map((att) => (
                  <HStack key={att.id} justify="space-between" p={2} bg={COLORS.BG} borderRadius="sm">
                    <Text fontSize="sm" color={COLORS.TEXT}>
                      {att.first_name} {att.last_name}
                    </Text>
                    <Text fontSize="xs" color={COLORS.TEXT_MUTED}>
                      {att.email}
                    </Text>
                    {/* ✅ Fixed: "yellow" is a valid Chakra colorScheme, closest to gold */}
                    <Badge colorScheme="yellow">{att.ticket_id}</Badge>
                  </HStack>
                ))}
              </VStack>

              <Button
                mt={4}
                onClick={handleResendEmails}
                disabled={isSending}
                width="100%"
                bg={COLORS.GOLD_BASE}
                color={COLORS.BG}
                fontWeight="600"
                _hover={{ opacity: 0.9 }}
              >
                {isSending ? (
                  // ✅ Fixed: use HStack to space Spinner and text, not mr prop on Spinner
                  <HStack spacing={2}>
                    <Spinner size="sm" />
                    <Text>Sending...</Text>
                  </HStack>
                ) : (
                  `Send Confirmation Emails (${attendees.length})`
                )}
              </Button>
            </Box>
          )}
        </VStack>
      </Box>
    </VStack>
  )
}
