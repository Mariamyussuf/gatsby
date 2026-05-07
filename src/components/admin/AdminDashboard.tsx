import { useState, useEffect } from "react"
import { Box, Text, VStack, HStack, Button } from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import { TableMap } from "./TableMap"
import { AttendeeList } from "./AttendeeList"
import { TransactionsList } from "./TransactionsList"
import { AwardsNominationsList } from "./AwardsNominationsList"
import { ManualConfirmation } from "./ManualConfirmation"
import { QRScanner } from "./QRScanner"
import { VVIPPickupManager } from "./VVIPPickupManager"
import { WaitlistAdmin } from "./WaitlistAdmin"

type Stats = {
  totalSold: number
  totalRevenue: number
  byTier: { name: string; count: number; revenue: number }[]
}

const TABS = [
  { value: "overview", label: "Table Map" },
  { value: "transactions", label: "Transactions" },
  { value: "attendees", label: "Attendees" },
  { value: "awards", label: "Awards" },
  { value: "recovery", label: "Recovery" },
  { value: "waitlist", label: "Waitlist" },
  { value: "scanner", label: "QR Scanner" },
  { value: "vvip", label: "VVIP Pickups" },
]

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalSold: 0, totalRevenue: 0, byTier: [] })
  const [activeTab, setActiveTab] = useState("overview")

  const fetchStats = async () => {
    const { data: attendees } = await supabase
      .from("attendees")
      .select("tier_id, ticket_tiers (name)")
    const { data: txns } = await supabase
      .from("transactions")
      .select("total_kobo, quantity, tier_id, ticket_tiers (name)")
      .eq("payment_status", "confirmed")

    if (attendees && txns) {
      const totalSold = attendees.length
      const totalRevenue = txns.reduce((s: number, t: any) => s + t.total_kobo, 0) / 100

      const tierMap: Record<string, { count: number; revenue: number; name: string }> = {}
      for (const t of txns as any[]) {
        const tName = t.ticket_tiers?.name || "Unknown"
        if (!tierMap[tName]) tierMap[tName] = { count: 0, revenue: 0, name: tName }
        tierMap[tName].count += t.quantity
        tierMap[tName].revenue += t.total_kobo / 100
      }

      setStats({ totalSold, totalRevenue, byTier: Object.values(tierMap) })
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const StatCard = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <Box
      p="6"
      style={{
        border: `1px solid ${COLORS.GOLD_DIM}40`,
        background: `linear-gradient(180deg, ${COLORS.PANEL_MID}60 0%, ${COLORS.BG} 100%)`,
      }}
    >
      <Text
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.55rem",
          letterSpacing: "0.25em",
          color: COLORS.GOLD_DIM,
          textTransform: "uppercase",
          marginBottom: "8px",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "2rem",
          fontWeight: "700",
          color: COLORS.GOLD_BRIGHT,
        }}
      >
        {value}
      </Text>
      {sub && (
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.6rem",
            color: COLORS.GOLD_DIM,
            marginTop: "4px",
          }}
        >
          {sub}
        </Text>
      )}
    </Box>
  )

  const allStatCards = [
    { label: "Tickets Sold", value: String(stats.totalSold) },
    { label: "Total Revenue", value: `₦${stats.totalRevenue.toLocaleString()}` },
    ...stats.byTier.map((t) => ({
      label: `${t.name} Tickets`,
      value: String(t.count),
      sub: `₦${t.revenue.toLocaleString()}`,
    })),
  ]

  return (
    <Box
      minH="100vh"
      style={{ backgroundColor: COLORS.BG }}
      px={{ base: "4", md: "8" }}
      py="8"
    >
      {/* Header */}
      <HStack justify="space-between" mb="8" align="center">
        <VStack gap="0" align="start">
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.8rem",
              fontWeight: "700",
              color: COLORS.GOLD_BRIGHT,
              letterSpacing: "0.1em",
            }}
          >
            BUSA Admin
          </Text>
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "0.3em",
              color: COLORS.GOLD_DIM,
              textTransform: "uppercase",
            }}
          >
            The Great Gatsby Gala · Control Centre
          </Text>
        </VStack>
        <Button
          onClick={() => {
            sessionStorage.removeItem("gatsby_admin")
            window.location.reload()
          }}
          size="sm"
          style={{
            background: "transparent",
            border: `1px solid ${COLORS.GOLD_DIM}40`,
            color: COLORS.GOLD_DIM,
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.55rem",
            letterSpacing: "0.15em",
            cursor: "pointer",
          }}
        >
          Sign Out
        </Button>
      </HStack>

      {/* Stats — SimpleGrid replaced with responsive flex wrap */}
      <Box
        mb="10"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "16px",
        }}
      >
        {allStatCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </Box>

      {/* Tabs — Chakra Tabs replaced with plain state-driven tabs */}
      <Box>
        {/* Tab List */}
        <Box
          style={{
            borderBottom: `1px solid ${COLORS.GOLD_DIM}30`,
            marginBottom: "24px",
            display: "flex",
            flexWrap: "wrap",
            gap: "0",
            overflowX: "auto",
          }}
        >
          {TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: activeTab === value ? COLORS.GOLD_BRIGHT : COLORS.GOLD_DIM,
                cursor: "pointer",
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderBottom: activeTab === value
                  ? `2px solid ${COLORS.GOLD_BASE}`
                  : "2px solid transparent",
                transition: "color 0.2s, border-color 0.2s",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </button>
          ))}
        </Box>

        {/* Tab Panels */}
        <Box>
          {activeTab === "overview" && <TableMap />}
          {activeTab === "transactions" && <TransactionsList />}
          {activeTab === "attendees" && <AttendeeList />}
          {activeTab === "awards" && <AwardsNominationsList />}
          {activeTab === "recovery" && <ManualConfirmation />}
          {activeTab === "waitlist" && <WaitlistAdmin />}
          {activeTab === "scanner" && <QRScanner />}
          {activeTab === "vvip" && <VVIPPickupManager />}
        </Box>
      </Box>
    </Box>
  )
}
