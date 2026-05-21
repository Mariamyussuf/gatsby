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
import { VotingResultsPanel } from "./VotingResultsPanel"
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
  { value: "awards", label: "Awards", exco: false },
  { value: "votes", label: "Live Votes", exco: false },
  { value: "vvip", label: "VVIP Pickups", exco: false },
  { value: "waitlist", label: "Waitlist", exco: false },
  { value: "scanner", label: "QR Scanner", exco: false },
  { value: "blast", label: "Blast Email", exco: false },
]

// ── Blocked screen shown to exco — no access to any panel ────────────────────
function ExcoBlocked() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="100vh"
      style={{ backgroundColor: COLORS.BG }}
    >
      <Box
        p="12"
        maxW="420px"
        w="full"
        textAlign="center"
        style={{
          border: `1px solid #cc333340`,
          background: `linear-gradient(180deg, #1a000a 0%, ${COLORS.BG} 100%)`,
          borderRadius: "10px",
          boxShadow: `0 0 60px #cc000025`,
        }}
      >
        <Text
          style={{
            fontSize: "3.5rem",
            marginBottom: "12px",
            lineHeight: 1,
          }}
        >
          🌐
        </Text>
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.55rem",
            letterSpacing: "0.3em",
            color: `${COLORS.GOLD_DIM}60`,
            textTransform: "uppercase",
            marginBottom: "10px",
          }}
        >
          ERR_SITE_UNAVAILABLE
        </Text>
        <Text
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "1.7rem",
            fontWeight: "700",
            letterSpacing: "0.05em",
            color: "#e05555",
            marginBottom: "12px",
          }}
        >
          This page is unavailable
        </Text>
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.5rem",
            letterSpacing: "0.15em",
            color: `${COLORS.GOLD_DIM}35`,
            textTransform: "uppercase",
          }}
        >
          Error Code: 403 · Forbidden
        </Text>
      </Box>
    </Box>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export function AdminDashboard({ role }: { role: AdminRole }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [presetManualReference, setPresetManualReference] = useState<string | null>(null)

  const isExco = role === "exco"

  // Excos see nothing — just a blocked screen
  if (isExco) return <ExcoBlocked />

  const tabs = ALL_TABS.filter((t) => !isExco || t.exco)

  // If active tab gets hidden after role change, reset to overview
  const safActiveTab = tabs.find((t) => t.value === activeTab) ? activeTab : "overview"

  return (
    <Box bg={COLORS.BG} minH="100vh" p={{ base: 3, md: 6 }}>
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
              · Admin View
            </Text>
          )}
        </Heading>

        <Tabs.Root value={safActiveTab} onValueChange={(e) => setActiveTab(e.value)}>
          <Tabs.List
            borderBottom={`2px solid ${COLORS.GOLD_BASE}`}
            mb={6}
            style={{ overflowX: "auto", flexWrap: "nowrap", WebkitOverflowScrolling: "touch" }}
          >
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
            <AwardsNominationsList hideMatric={isExco} />
          </Tabs.Content>

          <Tabs.Content value="votes">
            <VotingResultsPanel />
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
