declare const __SUPABASE_URL__: string
declare const __SUPABASE_ANON_KEY__: string

import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Box, Text, Spinner, VStack } from "@chakra-ui/react"
import { confirmBooking, PENDING_BOOKING_KEY, type PendingBooking } from "@/lib/confirmBooking"
import { SuccessScreen } from "@/components/booking/SuccessScreen"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"

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
    const verifyPayment = async () => {
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

      try {
        // Verify payment was actually successful
        setMessage("Verifying payment status…")
        
        let paymentVerified = false
        
        // Try to verify with Squad API first
        try {
          const verifyRes = await fetch(`${__SUPABASE_URL__}/functions/v1/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${__SUPABASE_ANON_KEY__}`,
            },
            body: JSON.stringify({
              reference: pending.reference,
              gatewayRef: gatewayRef ?? transactionRef,
            }),
          })

          const verifyData = await verifyRes.json()
          
          if (verifyData.success === true) {
            paymentVerified = true
          } else if (verifyData.reason === "cancelled") {
            setMessage("Payment cancelled. Your booking was not confirmed.")
            setStatus("error")
            sessionStorage.removeItem(PENDING_BOOKING_KEY)
            return
          } else if (verifyData.reason === "failed") {
            setMessage("Payment failed. Please try again.")
            setStatus("error")
            sessionStorage.removeItem(PENDING_BOOKING_KEY)
            return
          }
          // If verification returns other status, fall through to database check
        } catch (verifyErr) {
          // If Squad verification fails (CORS, network, etc), fall back to database check
          console.log("[v0] Squad verification failed, using database fallback")
        }

        // Fallback: check if transaction exists in database (Squad already processed it)
        if (!paymentVerified) {
          setMessage("Checking transaction status…")
          const { data: txn, error: txnErr } = await supabase
            .from("transactions")
            .select("payment_status, reference")
            .eq("reference", pending.reference)
            .single()
          
          // If transaction exists, Squad has already processed it
          if (txn && !txnErr) {
            paymentVerified = true
          }
        }

        if (!paymentVerified) {
          setMessage("Payment verification failed. Please contact support.")
          setStatus("error")
          sessionStorage.removeItem(PENDING_BOOKING_KEY)
          return
        }

        // Only confirm booking after payment is verified
        const result = await confirmBooking(pending, gatewayRef ?? transactionRef ?? undefined)
        sessionStorage.removeItem(PENDING_BOOKING_KEY)
        setSuccessData({
          groupCode: result.groupCode,
          tier: result.tierName,
          tableNumber: result.tableNumber,
          quantity: result.quantity,
        })
        setStatus("success")
      } catch (err: any) {
        if (err.message === "TABLE_FULL") {
          setMessage("Your table has been filled while you were paying. Please contact support.")
        } else {
          setMessage(`Payment verification failed: ${err.message}`)
        }
        setStatus("error")
        sessionStorage.removeItem(PENDING_BOOKING_KEY)
      }
    }

    verifyPayment()
  }, [params])

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
