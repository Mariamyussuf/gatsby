import { useEffect, useState, useCallback } from "react"
import {
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Badge,
} from "@chakra-ui/react"

import { supabase } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import { toaster } from "@/components/ui/toaster"

declare const __SUPABASE_URL__: string
declare const __SUPABASE_ANON_KEY__: string

const attendeeSelect = `
  id,
  first_name,
  last_name,
  email,
  ticket_id,
  table_number,
  group_booking_code
`

type ResendEmailsProps = {
  /** When set (e.g. after switching tabs), fills the field and runs lookup once. */
  prefill?: string | null
  onPrefillConsumed?: () => void
}

export function ResendEmails(props: ResendEmailsProps = {}) {
  const { prefill, onPrefillConsumed } = props
  const [groupCode, setGroupCode] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [attendees, setAttendees] = useState<
    {
      id: string
      first_name: string
      last_name: string
      email: string
      ticket_id: string
      table_number: number
      group_booking_code: string
    }[]
  >([])

  const searchByLookup = useCallback(async (raw: string) => {
    const code = raw.trim()
    if (!code) {
      toaster.create({
        title: "Enter a group code or payment reference",
        type: "error",
      })
      return
    }

    setIsSearching(true)

    try {
      const { data: byGroup, error: errGroup } = await supabase
        .from("attendees")
        .select(attendeeSelect)
        .eq("group_booking_code", code)

      if (!errGroup && byGroup && byGroup.length > 0) {
        setAttendees(byGroup)
        toaster.create({
          title: `Found ${byGroup.length} attendee(s)`,
          type: "success",
        })
        return
      }

      const { data: txn, error: txnErr } = await supabase
        .from("transactions")
        .select("group_booking_code")
        .eq("reference", code)
        .maybeSingle()

      if (txnErr || !txn?.group_booking_code) {
        toaster.create({
          title: "No attendees found",
          description: "Try the booking group code or Squad/payment reference.",
          type: "error",
        })
        setAttendees([])
        return
      }

      const { data: byRef, error: errRef } = await supabase
        .from("attendees")
        .select(attendeeSelect)
        .eq("group_booking_code", txn.group_booking_code)

      if (errRef || !byRef || byRef.length === 0) {
        toaster.create({
          title: "No attendees found",
          type: "error",
        })
        setAttendees([])
        return
      }

      setAttendees(byRef)
      setGroupCode(txn.group_booking_code)
      toaster.create({
        title: `Found ${byRef.length} attendee(s) (via reference)`,
        type: "success",
      })
    } catch (err: unknown) {
      toaster.create({
        title: err instanceof Error ? err.message : "Search failed",
        type: "error",
      })
      setAttendees([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    if (!prefill?.trim()) return
    const v = prefill.trim()
    setGroupCode(v)
    void searchByLookup(v)
    onPrefillConsumed?.()
  }, [prefill, searchByLookup])

  const handleSearch = () => {
    void searchByLookup(groupCode)
  }

  const handleResendEmails = async () => {
    if (attendees.length === 0) return

    setIsSending(true)

    try {
      const groupCodeToSend = attendees[0]?.group_booking_code ?? groupCode.trim()

      const response = await fetch(`${__SUPABASE_URL__}/functions/v1/send-confirmation-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${__SUPABASE_ANON_KEY__}`,
          apikey: __SUPABASE_ANON_KEY__,
        },
        body: JSON.stringify({
          groupCode: groupCodeToSend,
        }),
      })

      if (!response.ok) {
        throw new Error(`Email function failed: ${response.status}`)
      }

      toaster.create({
        title: "Emails sent",
        description: "Confirmation emails resent successfully.",
        type: "success",
      })
    } catch (err: unknown) {
      toaster.create({
        title: "Failed to send emails",
        description: err instanceof Error ? err.message : "Unknown error",
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
      <VStack gap={4} align="stretch">
        <Text fontSize="lg" fontWeight="600" color={COLORS.GOLD_BASE}>
          Resend confirmation emails
        </Text>

        <Text fontSize="sm" color={COLORS.TEXT_MUTED}>
          Use the booking <strong>group code</strong> or the payment <strong>reference</strong> from the Transactions list.
        </Text>

        <HStack>
          <Input
            placeholder="Group code or payment reference"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          <Button onClick={handleSearch} loading={isSearching} colorPalette="orange">
            Search
          </Button>
        </HStack>

        {attendees.length > 0 && (
          <VStack align="stretch">
            {attendees.map((att) => (
              <HStack key={att.id} justify="space-between" p={3} bg={COLORS.BG} borderRadius="md">
                <Box>
                  <Text color={COLORS.TEXT}>
                    {att.first_name} {att.last_name}
                  </Text>

                  <Text fontSize="xs" color={COLORS.GOLD_DIM}>
                    {att.email}
                  </Text>
                </Box>

                <VStack gap={0}>
                  <Badge colorPalette="yellow">{att.ticket_id}</Badge>

                  <Text fontSize="xs" color={COLORS.GOLD_DIM}>
                    Table {att.table_number}
                  </Text>
                </VStack>
              </HStack>
            ))}

            <Button mt={4} onClick={handleResendEmails} loading={isSending} colorPalette="green">
              Resend emails
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
