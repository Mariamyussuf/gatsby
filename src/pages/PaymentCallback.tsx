import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Box, Text, Spinner, VStack } from "@chakra-ui/react"
import { confirmBooking, PENDING_BOOKING_KEY, type PendingBooking } from "@/lib/confirmBooking"
import { SuccessScreen } from "@/components/booking/SuccessScreen"
import { COLORS } from "@/config/constants"

export default function PaymentCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your payment…")
  const [successData, setSuccessData] = useState<{
    groupCode: string
    tier: string
    tableNumber: number
    quantity: number
  } | null>(null)

  useEffect(() => {
    const transactionRef = params.get("transaction_ref") ?? params.get("squad_ref")
    const gatewayRef = params.get("gateway_ref")

    const raw = sessionStorage.getItem(PENDING_BOOKING_KEY)
    if (!raw) {
      setMessage("No pending booking found. Please try booking again.")
      setStatus("error")
      return
    }

    const pending: PendingBooking = JSON.parse(raw)

    if (transactionRef && transactionRef !== pending.reference) {
      console.warn("Reference mismatch", transactionRef, pending.reference)
    }

    confirmBooking(pending, gatewayRef ?? transactionRef ?? undefined)
      .then((result) => {
        sessionStorage.removeItem(PENDING_BOOKING_KEY)
        setSuccessData({
          groupCode: result.groupCode,
          tier: result.tierName,
          tableNumber: result.tableNumber,
          quantity: result.quantity,
        })
        setStatus("success")
      })
      .catch((err) => {
        if (err.message === "TABLE_FULL") {
          setMessage("Your table has been filled while you were paying. Please contact support.")
        } else {
          setMessage(`Payment verification failed: ${err.message}`)
        }
        setStatus("error")
      })
  }, [])

  if (status === "success" && successData) {
    return (
      <SuccessScreen
        groupCode={successData.groupCode}
        tier={successData.tier}
        tableNumber={successData.tableNumber}
        quantity={successData.quantity}
      />
    )
  }

  return (
    <Box minH="100vh" style={{ backgroundColor: COLORS.BG }} display="flex" alignItems="center" justifyContent="center">
      <VStack gap={6}>
        {status === "loading" && <Spinner size="xl" color={COLORS.GOLD_BASE} />}
        <Text
          fontFamily="'Cormorant Garamond', serif"
          fontSize="xl"
          color={status === "error" ? "red.400" : COLORS.GOLD_BASE}
          textAlign="center"
          maxW="400px"
          px={4}
        >
          {message}
        </Text>
        {status === "error" && (
          <Text
            fontSize="sm"
            color={COLORS.GOLD_DIM}
            cursor="pointer"
            textDecoration="underline"
            onClick={() => navigate("/")}
          >
            Return to homepage
          </Text>
        )}
      </VStack>
    </Box>
  )
}
