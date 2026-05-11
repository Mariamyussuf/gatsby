"use client"

import { useState } from "react"
import { Box, VStack, HStack, Heading, Tabs, Text } from "@chakra-ui/react"
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

const tabs = [
  { value: "overview", label: "Overview" },
  { value: "tables", label: "Table Map" },
  { value: "locks", label: "Table Locks" },
  { value: "transactions", label: "Transactions" },
  { value: "attendees", label: "Attendees" },
  { value: "awards", label: "Awards" },
  { value: "vvip", label: "VVIP Pickups" },
  { value: "waitlist", label: "Waitlist" },
  { value: "scanner", label: "QR Scanner" },
]

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Box bg={COLORS.BG} minH="100vh" p={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="2xl" color={COLORS.GOLD_BASE}>
          Admin Dashboard
        </Heading>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List borderBottom={`2px solid ${COLORS.GOLD_BASE}`} mb={6}>
            {tabs.map(({ value, label }) => (
              <Tabs.Trigger
                key={value}
                value={value}
                color={activeTab === value ? COLORS.GOLD_BRIGHT : COLORS.TEXT_MUTED}
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
            <TransactionsList />
          </Tabs.Content>

          <Tabs.Content value="attendees">
            <AttendeeList />
          </Tabs.Content>

          <Tabs.Content value="awards">
            <AwardsNominationsList />
          </Tabs.Content>

          <Tabs.Content value="vvip">
            <VVIPPickupManager />
          </Tabs.Content>

          <Tabs.Content value="waitlist">
            <WaitlistAdmin />
          </Tabs.Content>

          <Tabs.Content value="scanner">
            <QRScanner />
          </Tabs.Content>
        </Tabs>
      </VStack>
    </Box>
  )
}
