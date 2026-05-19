"use client"

import { useState } from "react"
import { Box, VStack, Heading, Tabs, Input, Button, Text } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { TableMap } from "./TableMap"
import { StatsOverview } from "./StatsOverview"
import { TransactionsList } from "./TransactionsList"
import { AttendeeList } from "./AttendeeList"
import { TableLockManager } from "./TableLockManager"
import { AwardsNominationsList } from "./AwardsNominationsList"
import { VVIPPickupManager } from "./VVIPPickupManager"
import { WaitlistAdmin } from "./WaitlistAdmin"
import { QRScanner } from "./QRScanner"
import { ManualConfirmation } from "./ManualConfirmation"
import { PRBlastPanel } from "./PRBlastPanel"
import { QRBlastPanel } from "./QRBlastPanel"
import type { AdminRole } from "./AdminLogin"

// ─── Password to unlock the Awards Nominations view for exco ─────────────────
// Change this to whatever code you want to share with excos.
const AWARDS_UNLOCK_CODE = "NomResults2025!"

const ALL_TABS = [
  { value: "overview", label: "Overview", exco: false },
  { value: "tables", label: "Table Map", exco: false },
  { value: "locks", label: "Table Locks", exco: false },
  { value: "transactions", label: "Transactions", exco: false },
  { value: "manual", label: "Payments & recovery", exco: false },
  { value: "attendees", label: "Attendees", exco: false },
  { value: "awards", label: "Awards", exco: true },
  { value: "vvip", label: "VVIP Pickups", exco: false },
  { value: "waitlist", label: "Waitlist", exco: false },
  { value: "scanner", label: "QR Scanner", exco: false },
  { value: "blast", label: "📣 Blast Email", exco: false },
]

// ── Awards gate shown to exco before they enter the unlock code ───────────────
function AwardsGate({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("")
  const [shake, setShake] = useState(false)

  const attempt = () => {
    if (code.trim() === AWARDS_UNLOCK_CODE) {
      onUnlock()
    } else {
      setShake(true)
      setCode("")
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="400px"
    >
      <Box
        p="10"
        maxW="360px"
        w="full"
        style={{
          border: `1px solid ${COLORS.GOLD_DIM}35`,
          background: `linear-gradient(180deg, ${COLORS.PANEL_MID}60 0%, ${COLORS.BG} 100%)`,
          borderRadius: "8px",
          boxShadow: `0 0 40px ${COLORS.GOLD_GLOW}15`,
          animation: shake ? "shake 0.5s ease" : undefined,
        }}
      >
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-8px); }
            40%, 80% { transform: translateX(8px); }
          }
        `}</style>

        <VStack gap="6">
          <VStack gap="1" textAlign="center">
            <Text
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "1.6rem",
                fontWeight: "700",
                letterSpacing: "0.15em",
                color: COLORS.GOLD_BRIGHT,
              }}
            >
              🏆 Awards
            </Text>
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.25em",
                color: COLORS.GOLD_DIM,
                textTransform: "uppercase",
              }}
            >
              Nominations Unlock Code Required
            </Text>
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.65rem",
                color: `${COLORS.GOLD_DIM}80`,
                marginTop: "4px",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Enter the nominations access code to view award tallies.
            </Text>
          </VStack>

          <VStack gap="3" w="full">
            <Input
              type="password"
              placeholder="Enter nominations code…"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && attempt()}
              style={{
                background: `${COLORS.PANEL_MID}60`,
                border: `1px solid ${COLORS.GOLD_DIM}40`,
                color: COLORS.GOLD_BASE,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.8rem",
              }}
            />
            <Button
              onClick={attempt}
              w="full"
              style={{
                background: `linear-gradient(135deg, ${COLORS.GOLD_DIM}, ${COLORS.GOLD_BASE})`,
                color: COLORS.BG,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.65rem",
                fontWeight: "600",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                height: "44px",
                cursor: "pointer",
              }}
            >
              Unlock
            </Button>
          </VStack>
        </VStack>
      </Box>
    </Box>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export function AdminDashboard({ role }: { role: AdminRole }) {
  const [activeTab, setActiveTab] = useState(role === "exco" ? "awards" : "overview")
  const [presetManualReference, setPresetManualReference] = useState<string | null>(null)
  const [awardsUnlocked, setAwardsUnlocked] = useState(false)

  const isExco = role === "exco"
  const tabs = ALL_TABS.filter((t) => !isExco || t.exco)

  // If active tab gets hidden after role change, reset to overview
  const safActiveTab = tabs.find((t) => t.value === activeTab) ? activeTab : "overview"

  return (
    <Box bg={COLORS.BG} minH="100vh" p={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="2xl" color={COLORS.GOLD_BASE}>
          Admin Dashboard
          {isExco && (
            <Text
              as="span"
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: COLORS.GOLD_DIM,
                textTransform: "uppercase",
                marginLeft: "14px",
                verticalAlign: "middle",
              }}
            >
              · Exco View
            </Text>
          )}
        </Heading>

        <Tabs.Root value={safActiveTab} onValueChange={(e) => setActiveTab(e.value)}>
          <Tabs.List borderBottom={`2px solid ${COLORS.GOLD_BASE}`} mb={6}>
            {tabs.map(({ value, label }) => (
              <Tabs.Trigger
                key={value}
                value={value}
                color={safActiveTab === value ? COLORS.GOLD_BRIGHT : COLORS.TEXT_MUTED}
                _selected={{
                  color: COLORS.GOLD_BRIGHT,
                  borderBottom: `3px solid ${COLORS.GOLD_BASE}`,
                }}
                fontSize="sm"
                fontWeight="500"
              >
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {!isExco && (
            <>
              <Tabs.Content value="overview">
                <StatsOverview />
              </Tabs.Content>

              <Tabs.Content value="tables">
                <TableMap />
              </Tabs.Content>

              <Tabs.Content value="locks">
                <TableLockManager />
              </Tabs.Content>

              <Tabs.Content value="transactions">
                <TransactionsList
                  onRecoverPending={(ref) => {
                    setPresetManualReference(ref)
                    setActiveTab("manual")
                  }}
                />
              </Tabs.Content>

              <Tabs.Content value="manual">
                <ManualConfirmation
                  presetReference={presetManualReference}
                  onPresetConsumed={() => setPresetManualReference(null)}
                />
              </Tabs.Content>

              <Tabs.Content value="attendees">
                <AttendeeList />
              </Tabs.Content>
            </>
          )}

          <Tabs.Content value="awards">
            {isExco && !awardsUnlocked ? (
              <AwardsGate onUnlock={() => setAwardsUnlocked(true)} />
            ) : (
              <AwardsNominationsList />
            )}
          </Tabs.Content>

          {!isExco && (
            <>
              <Tabs.Content value="vvip">
                <VVIPPickupManager />
              </Tabs.Content>

              <Tabs.Content value="waitlist">
                <WaitlistAdmin />
              </Tabs.Content>

              <Tabs.Content value="scanner">
                <QRScanner />
              </Tabs.Content>

              <Tabs.Content value="blast">
                <VStack gap={8} align="stretch">
                  <PRBlastPanel />
                  <Box w="100%" h="1px" style={{ background: `${COLORS.GOLD_DIM}20` }} />
                  <QRBlastPanel />
                </VStack>
              </Tabs.Content>
            </>
          )}
        </Tabs.Root>
      </VStack>
    </Box>
  )
}
