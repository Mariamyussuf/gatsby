import { useState, useEffect, useRef } from "react"
import { Box, Text, VStack, Button } from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import { COLORS } from "@/config/constants"

type ScanResult = {
  valid: boolean
  message: string
  attendee?: {
    first_name: string
    last_name: string
    tier_name: string
    table_number: number
    ticket_id: string
  }
}

export function QRScanner() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [manualInput, setManualInput] = useState("")
  const scannerRef = useRef<any>(null)
  const [scannerLoaded, setScannerLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"
    script.onload = () => setScannerLoaded(true)
    document.head.appendChild(script)
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const startScanning = () => {
    if (!(window as any).Html5Qrcode) return
    setScanning(true)
    setResult(null)

    scannerRef.current = new (window as any).Html5Qrcode("qr-reader")
    scannerRef.current.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText: string) => {
        stopScanning()
        processQr(decodedText)
      },
      () => {}
    ).catch(() => {
      setScanning(false)
      setResult({ valid: false, message: "Camera access denied. Try manual entry below." })
    })
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
    }
    setScanning(false)
  }

  const processQr = async (qrData: string) => {
    let ticketId = qrData
    try {
      const parsed = JSON.parse(qrData)
      ticketId = parsed.ticket_id || qrData
    } catch {}

    const { data: attendee, error } = await supabase
      .from("attendees")
      .select("*, ticket_tiers (name)")
      .eq("ticket_id", ticketId)
      .maybeSingle()

    if (error || !attendee) {
      setResult({ valid: false, message: "Invalid QR code — ticket not found." })
      return
    }

    if (attendee.qr_used_at) {
      setResult({
        valid: false,
        message: `Already scanned on ${new Date(attendee.qr_used_at).toLocaleString()}`,
        attendee: {
          first_name: attendee.first_name,
          last_name: attendee.last_name,
          tier_name: attendee.ticket_tiers?.name,
          table_number: attendee.table_number,
          ticket_id: attendee.ticket_id,
        },
      })
      return
    }

    await supabase.from("attendees").update({ qr_used_at: new Date().toISOString() }).eq("id", attendee.id)

    setResult({
      valid: true,
      message: "Entry granted — welcome to the Gala!",
      attendee: {
        first_name: attendee.first_name,
        last_name: attendee.last_name,
        tier_name: attendee.ticket_tiers?.name,
        table_number: attendee.table_number,
        ticket_id: attendee.ticket_id,
      },
    })
  }

  const handleManual = () => {
    if (manualInput.trim()) {
      processQr(manualInput.trim())
      setManualInput("")
    }
  }

  const resultColor = result?.valid ? "#22c55e" : "#ef4444"

  return (
    <VStack gap="8" align="stretch" maxW="500px" mx="auto">
      <Text
        textAlign="center"
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.6rem",
          letterSpacing: "0.3em",
          color: COLORS.GOLD_DIM,
          textTransform: "uppercase",
        }}
      >
        Point camera at attendee QR code
      </Text>

      {/* Scanner area */}
      <Box
        id="qr-reader"
        style={{
          border: `2px solid ${scanning ? COLORS.GOLD_BASE : COLORS.GOLD_DIM}40`,
          minHeight: "280px",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!scanning && (
          <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", color: COLORS.GOLD_DIM }}>
            Camera preview will appear here
          </Text>
        )}
      </Box>

      {/* Controls */}
      <Box display="flex" gap="3">
        {!scanning ? (
          <Button
            onClick={startScanning}
            flex="1"
            style={{
              background: `linear-gradient(135deg, ${COLORS.GOLD_DIM}, ${COLORS.GOLD_BASE})`,
              color: COLORS.BG,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.65rem",
              fontWeight: "600",
              letterSpacing: "0.2em",
              height: "48px",
              cursor: "pointer",
            }}
          >
            Start Scanner
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            flex="1"
            style={{
              background: `${COLORS.CRIMSON}`,
              color: "white",
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.65rem",
              height: "48px",
              cursor: "pointer",
            }}
          >
            Stop Scanner
          </Button>
        )}
      </Box>

      {/* Manual entry */}
      <Box>
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.55rem",
            letterSpacing: "0.2em",
            color: COLORS.GOLD_DIM,
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Manual Ticket ID Entry
        </Text>
        <Box display="flex" gap="2">
          <input
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleManual()}
            placeholder="Enter ticket ID..."
            style={{
              flex: 1,
              background: `${COLORS.PANEL_MID}60`,
              border: `1px solid ${COLORS.GOLD_DIM}40`,
              color: COLORS.GOLD_BASE,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.75rem",
              padding: "8px 12px",
              outline: "none",
            }}
          />
          <button
            onClick={handleManual}
            style={{
              background: `${COLORS.GOLD_GLOW}60`,
              border: `1px solid ${COLORS.GOLD_DIM}`,
              color: COLORS.GOLD_BASE,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.6rem",
              padding: "8px 16px",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            Check
          </button>
        </Box>
      </Box>

      {/* Result */}
      {result && (
        <Box
          p="6"
          style={{
            border: `2px solid ${resultColor}`,
            background: `${resultColor}10`,
            transition: "all 0.3s",
          }}
        >
          <VStack gap="3">
            <Box
              w="60px"
              h="60px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              style={{ background: resultColor, margin: "0 auto" }}
            >
              <Text style={{ fontSize: "2rem" }}>{result.valid ? "✓" : "✗"}</Text>
            </Box>
            <Text
              textAlign="center"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.3rem",
                fontWeight: "700",
                color: resultColor,
              }}
            >
              {result.message}
            </Text>
            {result.attendee && (
              <VStack gap="1" textAlign="center">
                <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.8rem", color: COLORS.GOLD_BASE }}>
                  {result.attendee.first_name} {result.attendee.last_name}
                </Text>
                <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.65rem", color: COLORS.GOLD_DIM }}>
                  {result.attendee.tier_name} · Table {result.attendee.table_number}
                </Text>
                <Text style={{ fontFamily: "monospace", fontSize: "0.6rem", color: COLORS.GOLD_DIM, opacity: 0.7 }}>
                  {result.attendee.ticket_id}
                </Text>
              </VStack>
            )}
          </VStack>
        </Box>
      )}
    </VStack>
  )
}
