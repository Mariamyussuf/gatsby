import { useState } from "react"
import { Box, VStack, HStack, Text, Button, Badge } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { toaster } from "@/components/ui/toaster"

declare const __SUPABASE_URL__: string
declare const __SUPABASE_ANON_KEY__: string

interface Recipient {
  name: string
  email: string
}

type BlastState = "idle" | "previewing" | "confirming" | "sending" | "done"

export function PRBlastPanel() {
  const [state, setState] = useState<BlastState>("idle")
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [results, setResults] = useState<{ sent: number; failed: number } | null>(null)
  const [testEmail, setTestEmail] = useState("yussufmariamagbeke@gmail.com")
  const [testSending, setTestSending] = useState(false)

  const callBlast = async (body: object) => {
    const res = await fetch(`${__SUPABASE_URL__}/functions/v1/send-pr-blast`, {
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

  const sendTest = async () => {
    if (!testEmail.trim()) {
      toaster.create({ title: "Enter a test email address", type: "error" })
      return
    }
    setTestSending(true)
    try {
      const data = await callBlast({ override_email: testEmail.trim() })
      toaster.create({
        title: data.sent === 1 ? `Test PR email sent to ${testEmail} ✓` : "Test failed",
        type: data.sent === 1 ? "success" : "error",
        duration: 6000,
      })
    } catch (err) {
      toaster.create({ title: String(err), type: "error" })
    } finally {
      setTestSending(false)
    }
  }

  const runDryRun = async () => {
    setState("previewing")
    try {
      const data = await callBlast({ dry_run: true })
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
      const data = await callBlast({ dry_run: false })
      setResults({ sent: data.sent, failed: data.failed })
      setState("done")
      toaster.create({
        title: `Blast sent — ${data.sent} delivered, ${data.failed} failed`,
        type: data.failed === 0 ? "success" : "warning",
        duration: 8000,
      })
    } catch (err) {
      toaster.create({ title: String(err), type: "error" })
      setState("confirming")
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
      <VStack gap={5} align="stretch">
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
              PR Blast Email
            </Text>
            <Badge
              style={{
                background: `rgba(34,197,94,0.15)`,
                color: `#22c55e`,
                border: `1px solid rgba(34,197,94,0.4)`,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.55rem",
                letterSpacing: "0.15em",
                padding: "3px 8px",
                borderRadius: "3px",
              }}
            >
              ✓ SEND TODAY · 13 MAY
            </Badge>
          </HStack>
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.72rem",
              color: COLORS.GOLD_DIM,
              lineHeight: 1.6,
            }}
          >
            Sends the <em>"10 Days to the Gala"</em> email to every confirmed ticket holder.
            Each email includes their personalised Manage Ticket link.
          </Text>
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
            Test — Send to Your Inbox
          </Text>
          <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", color: `${COLORS.GOLD_DIM}80`, marginBottom: "4px" }}>
            Sends the PR email to this address only (won't go to real attendees)
          </Text>
          <HStack gap={2}>
            <input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="your@email.com"
              type="email"
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
            style={{
              background: `${COLORS.GOLD_BASE}18`,
              border: `1px solid ${COLORS.GOLD_DIM}50`,
              color: COLORS.GOLD_BASE,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.65rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "14px 24px",
              cursor: "pointer",
              borderRadius: "4px",
            }}
          >
            Preview Recipients →
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
            Fetching recipient list…
          </Text>
        )}

        {/* ── CONFIRMING ── */}
        {state === "confirming" && (
          <VStack gap={4} align="stretch">
            {/* Recipient preview list */}
            <Box
              style={{
                border: `1px solid ${COLORS.GOLD_DIM}30`,
                borderRadius: "4px",
                maxHeight: "260px",
                overflowY: "auto",
              }}
            >
              <HStack
                px={3}
                py={2}
                style={{ borderBottom: `1px solid ${COLORS.GOLD_DIM}25`, background: `${COLORS.GOLD_DIM}08` }}
              >
                <Text
                  flex="1"
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.55rem",
                    letterSpacing: "0.2em",
                    color: `${COLORS.GOLD_DIM}90`,
                    textTransform: "uppercase",
                  }}
                >
                  Name
                </Text>
                <Text
                  flex="1"
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.55rem",
                    letterSpacing: "0.2em",
                    color: `${COLORS.GOLD_DIM}90`,
                    textTransform: "uppercase",
                  }}
                >
                  Email
                </Text>
              </HStack>
              {recipients.map((r, i) => (
                <HStack
                  key={i}
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
                      fontSize: "0.68rem",
                      color: COLORS.GOLD_DIM,
                    }}
                  >
                    {r.email}
                  </Text>
                </HStack>
              ))}
            </Box>

            <HStack gap={3}>
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
                {recipients.length} recipient{recipients.length !== 1 ? "s" : ""}
              </Badge>
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
                ✦ Send to All {recipients.length}
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
              Sending…
            </Text>
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.68rem",
                color: COLORS.GOLD_DIM,
              }}
            >
              This may take a minute. Don't close this tab.
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
                {results.failed === 0 ? "✓ All emails delivered" : "⚠ Blast complete with errors"}
              </Text>
              <HStack gap={4}>
                <Text
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.72rem",
                    color: COLORS.GOLD_DIM,
                  }}
                >
                  ✓ Sent: <strong style={{ color: COLORS.GOLD_BASE }}>{results.sent}</strong>
                </Text>
                {results.failed > 0 && (
                  <Text
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.72rem",
                      color: "#C41E3A",
                    }}
                  >
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
