import { useState, useMemo } from "react"
import { Box, VStack, HStack, Text, Button, Badge } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { toaster } from "@/components/ui/toaster"

// Event: May 23 2026 — QR goes out 3 days before = May 20
const QR_SEND_DATE = new Date("2026-05-20T00:00:00+01:00")

declare const __SUPABASE_URL__: string
declare const __SUPABASE_ANON_KEY__: string

interface Recipient {
  id: string
  name: string
  email: string
  ticket_id: string
}

type BlastState = "idle" | "previewing" | "confirming" | "sending" | "done"

export function QRBlastPanel() {
  const [state, setState] = useState<BlastState>("idle")
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [results, setResults] = useState<{ sent: number; failed: number } | null>(null)
  const [testId, setTestId] = useState("")
  const [testSending, setTestSending] = useState(false)

  // Date gate
  const { daysUntil, isUnlocked } = useMemo(() => {
    const now = new Date()
    const ms = QR_SEND_DATE.getTime() - now.getTime()
    const days = Math.ceil(ms / (1000 * 60 * 60 * 24))
    return { daysUntil: Math.max(days, 0), isUnlocked: now >= QR_SEND_DATE }
  }, [])

  const callFunction = async (body: object) => {
    const res = await fetch(`${__SUPABASE_URL__}/functions/v1/send-qr-blast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${__SUPABASE_ANON_KEY__}`,
        apikey: __SUPABASE_ANON_KEY__,
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? "Request failed")
    return data
  }

  const runDryRun = async () => {
    setState("previewing")
    try {
      const data = await callFunction({ dry_run: true })
      setRecipients(data.recipients ?? [])
      setState("confirming")
    } catch (err) {
      toaster.create({ title: String(err), type: "error" })
      setState("idle")
    }
  }

  const sendBlast = async () => {
    setState("sending")
    try {
      const data = await callFunction({ dry_run: false })
      setResults({ sent: data.sent, failed: data.failed })
      setState("done")
      toaster.create({
        title: `QR blast complete — ${data.sent} delivered, ${data.failed} failed`,
        type: data.failed === 0 ? "success" : "warning",
        duration: 8000,
      })
    } catch (err) {
      toaster.create({ title: String(err), type: "error" })
      setState("confirming")
    }
  }

  const sendTest = async () => {
    if (!testId.trim()) return
    setTestSending(true)
    try {
      const data = await callFunction({ attendee_id: testId.trim() })
      toaster.create({
        title: data.sent === 1 ? "Test QR sent ✓" : "Test failed",
        description: data.results?.[0]?.email ?? "",
        type: data.sent === 1 ? "success" : "error",
        duration: 6000,
      })
    } catch (err) {
      toaster.create({ title: String(err), type: "error" })
    } finally {
      setTestSending(false)
    }
  }

  const reset = () => {
    setState("idle")
    setRecipients([])
    setResults(null)
  }

  return (
    <Box
      p={6}
      style={{
        border: `1px solid ${COLORS.GOLD_DIM}40`,
        background: `linear-gradient(180deg, ${COLORS.PANEL_MID}50 0%, ${COLORS.BG} 100%)`,
        borderRadius: "6px",
      }}
    >
      <VStack gap={6} align="stretch">
        {/* Header */}
        <VStack align="start" gap={1}>
          <HStack gap={3} align="center">
            <Text
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.3rem",
                fontWeight: "600",
                color: COLORS.GOLD_BRIGHT,
                letterSpacing: "0.5px",
              }}
            >
              QR Entry Pass Blast
            </Text>
            <Badge
              style={{
                background: isUnlocked ? `rgba(34,197,94,0.15)` : `${COLORS.GOLD_BASE}20`,
                color: isUnlocked ? `#22c55e` : COLORS.GOLD_BASE,
                border: `1px solid ${isUnlocked ? `rgba(34,197,94,0.4)` : `${COLORS.GOLD_DIM}40`}`,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.55rem",
                letterSpacing: "0.15em",
                padding: "3px 8px",
                borderRadius: "3px",
              }}
            >
              {isUnlocked ? "✓ SEND TODAY" : `IN ${daysUntil} DAY${daysUntil !== 1 ? "S" : ""} · 20 MAY"}
            </Badge>
          </HStack>
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.72rem",
              color: COLORS.GOLD_DIM,
              lineHeight: 1.7,
            }}
          >
            Generates a unique QR code from each attendee's <code>ticket_id</code> and emails
            it as a styled entry pass. Only sends to attendees who haven't received theirs yet
            (<code>qr_code_sent = false</code>).
          </Text>

          {/* Date lock notice */}
          {!isUnlocked && (
            <Box
              mt={1}
              px={3}
              py={2}
              style={{
                background: `${COLORS.GOLD_DIM}0A`,
                border: `1px solid ${COLORS.GOLD_DIM}30`,
                borderRadius: "4px",
                width: "100%",
              }}
            >
              <Text
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "0.68rem",
                  color: `${COLORS.GOLD_DIM}90`,
                  lineHeight: 1.6,
                }}
              >
                🔒 Blast locked until <strong style={{ color: COLORS.GOLD_BASE }}>Wednesday 20 May 2026</strong>.
                Test sends are available now.
              </Text>
            </Box>
          )}
        </VStack>

        {/* ── TEST SEND ── */}
        <Box
          p={4}
          style={{
            border: `1px solid ${COLORS.GOLD_DIM}25`,
            borderRadius: "4px",
            background: `${COLORS.GOLD_DIM}06`,
          }}
        >
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.58rem",
              letterSpacing: "0.2em",
              color: `${COLORS.GOLD_DIM}90`,
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Test — Send to a Single Attendee
          </Text>
          <HStack gap={2}>
            <input
              value={testId}
              onChange={(e) => setTestId(e.target.value)}
              placeholder="Attendee UUID from Supabase…"
              style={{
                flex: 1,
                background: `${COLORS.PANEL_MID}60`,
                border: `1px solid ${COLORS.GOLD_DIM}40`,
                color: COLORS.GOLD_BASE,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.72rem",
                padding: "8px 12px",
                borderRadius: "3px",
                outline: "none",
              }}
            />
            <Button
              onClick={sendTest}
              loading={testSending}
              style={{
                background: `${COLORS.GOLD_DIM}20`,
                border: `1px solid ${COLORS.GOLD_DIM}50`,
                color: COLORS.GOLD_DIM,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "8px 16px",
                cursor: "pointer",
                borderRadius: "3px",
                whiteSpace: "nowrap",
              }}
            >
              Send Test
            </Button>
          </HStack>
        </Box>

        <Box w="100%" h="1px" style={{ background: `${COLORS.GOLD_DIM}20` }} />

        {/* ── IDLE ── */}
        {state === "idle" && (
          <Button
            onClick={runDryRun}
            disabled={!isUnlocked}
            style={{
              background: isUnlocked ? `${COLORS.GOLD_BASE}18` : `${COLORS.GOLD_DIM}08`,
              border: `1px solid ${isUnlocked ? `${COLORS.GOLD_DIM}50` : `${COLORS.GOLD_DIM}20`}`,
              color: isUnlocked ? COLORS.GOLD_BASE : `${COLORS.GOLD_DIM}50`,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "14px 24px",
              cursor: isUnlocked ? "pointer" : "not-allowed",
              borderRadius: "4px",
            }}
          >
            {isUnlocked ? "Preview Recipients →" : `Locked until 20 May (${daysUntil} day${daysUntil !== 1 ? "s" : ""} away)`}
          </Button>
        )}

        {/* ── PREVIEWING ── */}
        {state === "previewing" && (
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.72rem",
              color: COLORS.GOLD_DIM,
            }}
          >
            Fetching eligible attendees…
          </Text>
        )}

        {/* ── CONFIRMING ── */}
        {state === "confirming" && (
          <VStack gap={4} align="stretch">
            {recipients.length === 0 ? (
              <Box
                p={5}
                textAlign="center"
                style={{ border: `1px dashed ${COLORS.GOLD_DIM}30`, borderRadius: "4px" }}
              >
                <Text
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.75rem",
                    color: COLORS.GOLD_DIM,
                  }}
                >
                  ✓ All attendees have already received their QR code.
                </Text>
              </Box>
            ) : (
              <>
                {/* Recipient table */}
                <Box
                  style={{
                    border: `1px solid ${COLORS.GOLD_DIM}30`,
                    borderRadius: "4px",
                    maxHeight: "280px",
                    overflowY: "auto",
                  }}
                >
                  <HStack
                    px={3}
                    py={2}
                    style={{
                      borderBottom: `1px solid ${COLORS.GOLD_DIM}25`,
                      background: `${COLORS.GOLD_DIM}08`,
                      position: "sticky",
                      top: 0,
                    }}
                  >
                    {["Name", "Email", "Ticket ID"].map((h) => (
                      <Text
                        key={h}
                        flex="1"
                        style={{
                          fontFamily: "'Josefin Sans', sans-serif",
                          fontSize: "0.55rem",
                          letterSpacing: "0.2em",
                          color: `${COLORS.GOLD_DIM}90`,
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </Text>
                    ))}
                  </HStack>
                  {recipients.map((r, i) => (
                    <HStack
                      key={r.id}
                      px={3}
                      py={2}
                      style={{
                        borderBottom: i < recipients.length - 1 ? `1px solid ${COLORS.GOLD_DIM}15` : "none",
                      }}
                    >
                      <Text
                        flex="1"
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "0.85rem",
                          color: COLORS.GOLD_BRIGHT,
                        }}
                      >
                        {r.name}
                      </Text>
                      <Text
                        flex="1"
                        style={{
                          fontFamily: "'Josefin Sans', sans-serif",
                          fontSize: "0.65rem",
                          color: COLORS.GOLD_DIM,
                        }}
                      >
                        {r.email}
                      </Text>
                      <Text
                        flex="1"
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.6rem",
                          color: `${COLORS.GOLD_DIM}80`,
                        }}
                      >
                        {r.ticket_id}
                      </Text>
                    </HStack>
                  ))}
                </Box>

                <HStack gap={3} align="center">
                  <Badge
                    style={{
                      background: `${COLORS.GOLD_BASE}20`,
                      color: COLORS.GOLD_BASE,
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.65rem",
                      letterSpacing: "0.1em",
                      padding: "4px 10px",
                      borderRadius: "3px",
                    }}
                  >
                    {recipients.length} pending
                  </Badge>
                  <Text
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.65rem",
                      color: `${COLORS.GOLD_DIM}70`,
                    }}
                  >
                    QR codes will be generated &amp; sent individually
                  </Text>
                </HStack>

                <HStack gap={3}>
                  <Button
                    onClick={sendBlast}
                    style={{
                      background: `linear-gradient(135deg, #8B0000, #C41E3A)`,
                      color: "#F5E6C8",
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.65rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      padding: "14px 24px",
                      cursor: "pointer",
                      borderRadius: "4px",
                      border: "none",
                    }}
                  >
                    ✦ Send QR Codes to All {recipients.length}
                  </Button>
                  <Button
                    onClick={reset}
                    variant="ghost"
                    style={{
                      color: COLORS.GOLD_DIM,
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.65rem",
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </Button>
                </HStack>
              </>
            )}
          </VStack>
        )}

        {/* ── SENDING ── */}
        {state === "sending" && (
          <Box
            p={5}
            textAlign="center"
            style={{
              border: `1px solid ${COLORS.GOLD_DIM}30`,
              borderRadius: "4px",
              background: `${COLORS.GOLD_DIM}08`,
            }}
          >
            <Text
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.1rem",
                color: COLORS.GOLD_BRIGHT,
                marginBottom: "6px",
              }}
            >
              Generating &amp; sending QR codes…
            </Text>
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.68rem",
                color: COLORS.GOLD_DIM,
              }}
            >
              Each QR is generated individually. Don't close this tab.
            </Text>
          </Box>
        )}

        {/* ── DONE ── */}
        {state === "done" && results && (
          <VStack gap={4} align="stretch">
            <Box
              p={5}
              style={{
                border: `1px solid ${results.failed === 0 ? COLORS.GOLD_DIM : "#8B0000"}50`,
                borderRadius: "4px",
                background: results.failed === 0 ? `${COLORS.GOLD_DIM}08` : `rgba(139,0,0,0.08)`,
              }}
            >
              <Text
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1.15rem",
                  color: results.failed === 0 ? COLORS.GOLD_BRIGHT : "#C41E3A",
                  marginBottom: "8px",
                }}
              >
                {results.failed === 0 ? "✓ All QR codes delivered" : "⚠ Complete with errors"}
              </Text>
              <HStack gap={4}>
                <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.72rem", color: COLORS.GOLD_DIM }}>
                  ✓ Sent: <strong style={{ color: COLORS.GOLD_BASE }}>{results.sent}</strong>
                </Text>
                {results.failed > 0 && (
                  <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.72rem", color: "#C41E3A" }}>
                    ✗ Failed: <strong>{results.failed}</strong>
                  </Text>
                )}
              </HStack>
            </Box>
            <Button
              onClick={reset}
              variant="ghost"
              style={{
                color: COLORS.GOLD_DIM,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.65rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              ← Back
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  )
}
