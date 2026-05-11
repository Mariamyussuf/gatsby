import { useState, useEffect } from "react"
import { Box, VStack, HStack, Text, Button, SimpleGrid } from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import { AttendeeList } from "./AttendeeList"
import { TransactionsList } from "./TransactionsList"
import { AwardsNominationsList } from "./AwardsNominationsList"
import { TableLockManager } from "./TableLockManager"
import { ManualConfirmation } from "./ManualConfirmation"
import { QRScanner } from "./QRScanner"
import { VVIPPickupManager } from "./VVIPPickupManager"
import { WaitlistAdmin } from "./WaitlistAdmin"
import { Tabs } from "@chakra-ui/react"

type Stats = {
  totalSold: number
  totalRevenue: number
  byTier: { name: string; count: number; revenue: number }[]
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Box
      p="6"
      style={{
        border: `1px solid ${COLORS.GOLD_DIM}40`,
        background: `linear-gradient(180deg, ${COLORS.PANEL_MID}60 0%, ${COLORS.BG} 100%)`,
      }}
    >
      <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.55rem", letterSpacing: "0.25em", color: COLORS.GOLD_DIM, textTransform: "uppercase", marginBottom: "8px" }}>
        {label}
      </Text>
      <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: "700", color: COLORS.GOLD_BRIGHT }}>
        {value}
      </Text>
      {sub && (
        <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.6rem", color: COLORS.GOLD_DIM, marginTop: "4px" }}>
          {sub}
        </Text>
      )}
    </Box>
  )
}

const TAB_TRIGGER_STYLE: React.CSSProperties = {
  fontFamily: "'Josefin Sans', sans-serif",
  fontSize: "0.6rem",
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: COLORS.GOLD_DIM,
  cursor: "pointer",
  padding: "10px 16px",
  background: "transparent",
  border: "none",
  borderBottom: "2px solid transparent",
}

const TABS = [
  { value: "locks",        label: "Table Locks" },
  { value: "transactions", label: "Transactions" },
  { value: "attendees",    label: "Attendees" },
  { value: "awards",       label: "Awards" },
  { value: "recovery",     label: "Recovery" },
  { value: "waitlist",     label: "Waitlist" },
  { value: "scanner",      label: "QR Scanner" },
  { value: "vvip",         label: "VVIP Pickups" },
]

export function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalSold: 0, totalRevenue: 0, byTier: [] })

  const fetchStats = async () => {
    const { data: attendees } = await supabase
      .from("attendees")
      .select("id")

    const { data: txns } = await supabase
      .from("transactions")
      .select("total_kobo, quantity, ticket_tiers (name)")
      .eq("payment_status", "confirmed")

    if (attendees && txns) {
      // Count total tickets sold by summing quantity from transactions
      const totalSold = txns.reduce((s: number, t: any) => s + (t.quantity ?? 0), 0)
      const totalRevenue = txns.reduce((s: number, t: any) => s + (t.total_kobo ?? 0), 0) / 100

      const tierMap: Record<string, { count: number; revenue: number; name: string }> = {}
      for (const t of txns) {
        // FIX: Supabase joined relations return an array, not a plain object.
        // ticket_tiers could be { name: string } | { name: string }[] | null
        const tierRaw = t.ticket_tiers
        const tName: string =
          Array.isArray(tierRaw)
            ? (tierRaw[0]?.name ?? "Unknown")
            : ((tierRaw as { name?: string } | null)?.name ?? "Unknown")

        if (!tierMap[tName]) tierMap[tName] = { count: 0, revenue: 0, name: tName }
        tierMap[tName].count += t.quantity ?? 0
        tierMap[tName].revenue += (t.total_kobo ?? 0) / 100
      }

      setStats({ totalSold, totalRevenue, byTier: Object.values(tierMap) })
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Box minH="100vh" style={{ backgroundColor: COLORS.BG }} px={{ base: "4", md: "8" }} py="8">
      {/* Header */}
      <HStack justify="space-between" mb="8" align="center">
        <VStack gap="0" align="start">
          <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.8rem", fontWeight: "700", color: COLORS.GOLD_BRIGHT, letterSpacing: "0.1em" }}>
            BUSA Admin
          </Text>
          <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.55rem", letterSpacing: "0.3em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>
            The Great Gatsby Gala · Control Centre
          </Text>
        </VStack>
        <Button
          onClick={() => { sessionStorage.removeItem("gatsby_admin"); window.location.reload() }}
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

      {/* Stats */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" mb="10">
        <StatCard label="Tickets Sold" value={String(stats.totalSold)} />
        <StatCard label="Total Revenue" value={`NGN ${stats.totalRevenue.toLocaleString()}`} />
        {stats.byTier.map((t) => (
          <StatCard
            key={t.name}
            label={`${t.name} Tickets`}
            value={String(t.count)}
            sub={`NGN ${t.revenue.toLocaleString()}`}
          />
        ))}
      </SimpleGrid>

      {/* Tabs */}
      <Tabs.Root defaultValue="overview">
        <Tabs.List style={{ borderBottom: `1px solid ${COLORS.GOLD_DIM}30`, marginBottom: "24px" }}>
          {[
            { value: "overview",      label: "Table Map" },
            { value: "locks",         label: "Table Locks" },
            { value: "transactions",  label: "Transactions" },
            { value: "attendees",     label: "Attendees" },
            { value: "awards",        label: "Awards" },
            { value: "recovery",      label: "Recovery" },
            { value: "waitlist",      label: "Waitlist" },
            { value: "scanner",       label: "QR Scanner" },
            { value: "vvip",          label: "VVIP Pickups" },
          ].map(({ value, label }) => (
            <Tabs.Trigger key={value} value={value} style={TAB_TRIGGER_STYLE} _selected={{ color: COLORS.GOLD_BRIGHT, borderBottom: `2px solid ${COLORS.GOLD_BASE}` }}>
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        
        <Tabs.Content value="overview"><Text>Dashboard Overview</Text></Tabs.Content>
        <Tabs.Content value="locks"><TableLockManager /></Tabs.Content>
        <Tabs.Content value="transactions"><TransactionsList /></Tabs.Content>
        <Tabs.Content value="attendees"><AttendeeList /></Tabs.Content>
        <Tabs.Content value="awards"><AwardsNominationsList /></Tabs.Content>
        <Tabs.Content value="recovery"><ManualConfirmation /></Tabs.Content>
        <Tabs.Content value="waitlist"><WaitlistAdmin /></Tabs.Content>
        <Tabs.Content value="scanner"><QRScanner /></Tabs.Content>
        <Tabs.Content value="vvip"><VVIPPickupManager /></Tabs.Content>
      </Tabs.Root>
    </Box>
  )
}
