import { useState } from "react"
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Spinner,
  Badge,
} from "@chakra-ui/react"

import { supabase } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import { toaster } from "@/components/ui/toaster"

declare const __SUPABASE_URL__: string
declare const __SUPABASE_ANON_KEY__: string

export function ResendEmails() {
  const [groupCode, setGroupCode] = useState("")
  const [isSearching, setIsSearching] =
    useState(false)

  const [isSending, setIsSending] =
    useState(false)

  const [attendees, setAttendees] = useState<any[]>(
    []
  )

  const handleSearch = async () => {
    if (!groupCode.trim()) {
      toaster.create({
        title: "Enter a group code",
        type: "error",
      })

      return
    }

    setIsSearching(true)

    try {
      const { data, error } = await supabase
        .from("attendees")
        .select(`
          id,
          first_name,
          last_name,
          email,
          ticket_id,
          table_number,
          group_booking_code
        `)
        .eq(
          "group_booking_code",
          groupCode.trim()
        )

      if (error || !data || data.length === 0) {
        toaster.create({
          title: "No attendees found",
          type: "error",
        })

        setAttendees([])
      } else {
        setAttendees(data)

        toaster.create({
          title: `Found ${data.length} attendee(s)`,
          type: "success",
        })
      }
    } catch (err: any) {
      toaster.create({
        title: err.message,
        type: "error",
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleResendEmails = async () => {
    if (attendees.length === 0) return

    setIsSending(true)

    try {
      const response = await fetch(
        `${__SUPABASE_URL__}/functions/v1/send-confirmation-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${__SUPABASE_ANON_KEY__}`,
          },
          body: JSON.stringify({
            groupCode: groupCode.trim(),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          `Email function failed: ${response.status}`
        )
      }

      toaster.create({
        title: "Emails sent",
        description:
          "Confirmation emails resent successfully.",
        type: "success",
      })
    } catch (err: any) {
      toaster.create({
        title: "Failed to send emails",
        description: err.message,
        type: "error",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Box
      p={6}
      bg={`${COLORS.GOLD_GLOW}10`}
      borderRadius="lg"
      border={`1px solid ${COLORS.GOLD_GLOW}30`}
    >
      <VStack spacing={4} align="stretch">
        <Text
          fontSize="lg"
          fontWeight="600"
          color={COLORS.GOLD_BASE}
        >
          Resend Confirmation Emails
        </Text>

        <HStack>
          <Input
            placeholder="Enter group code"
            value={groupCode}
            onChange={(e) =>
              setGroupCode(e.target.value)
            }
          />

          <Button
            onClick={handleSearch}
            loading={isSearching}
            colorPalette="orange"
          >
            Search
          </Button>
        </HStack>

        {attendees.length > 0 && (
          <VStack align="stretch">
            {attendees.map((att) => (
              <HStack
                key={att.id}
                justify="space-between"
                p={3}
                bg={COLORS.BG}
                borderRadius="md"
              >
                <Box>
                  <Text color={COLORS.TEXT}>
                    {att.first_name}{" "}
                    {att.last_name}
                  </Text>

                  <Text
                    fontSize="xs"
                    color={COLORS.GOLD_DIM}
                  >
                    {att.email}
                  </Text>
                </Box>

                <VStack gap={0}>
                  <Badge colorPalette="yellow">
                    {att.ticket_id}
                  </Badge>

                  <Text
                    fontSize="xs"
                    color={COLORS.GOLD_DIM}
                  >
                    Table {att.table_number}
                  </Text>
                </VStack>
              </HStack>
            ))}

            <Button
              mt={4}
              onClick={handleResendEmails}
              loading={isSending}
              colorPalette="green"
            >
              Resend Emails
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
