"use client"

import { useEffect, useState } from "react"
import { Box, VStack, SimpleGrid, Heading, Text, Spinner } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"

interface Stat {
  label: string
  value: string
  sub?: string
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch confirmed transactions
      const { data: txns, error } = await supabase
        .from("transactions")
        .select("quantity, total_kobo, tier_name")
        .eq("payment_status", "confirmed")

      if (error) {
        console.error("[v0] Error fetching transactions:", error)
        setLoading(false)
        return
      }

      if (!txns || txns.length === 0) {
        setStats([
          { label: "Tickets Sold", value: "0" },
          { label: "Total Revenue", value: "NGN 0" },
        ])
        setLoading(false)
        return
      }

      // Calculate totals
      const totalSold = txns.reduce((sum, t) => sum + (t.quantity || 0), 0)
      const totalRevenue = txns.reduce((sum, t) => sum + (t.total_kobo || 0), 0) / 100

      // Calculate by tier
      const tierMap: Record<string, { count: number; revenue: number }> = {}
      for (const t of txns) {
        const tierName = t.tier_name || "Unknown"
        if (!tierMap[tierName]) {
          tierMap[tierName] = { count: 0, revenue: 0 }
        }
        tierMap[tierName].count += t.quantity || 0
        tierMap[tierName].revenue += (t.total_kobo || 0) / 100
      }

      const statsList: Stat[] = [
        { label: "Tickets Sold", value: String(totalSold) },
        { label: "Total Revenue", value: `NGN ${totalRevenue.toLocaleString()}` },
      ]

      // Add tier stats
      for (const [tierName, data] of Object.entries(tierMap)) {
        statsList.push({
          label: `${tierName} Tickets`,
          value: String(data.count),
          sub: `NGN ${data.revenue.toLocaleString()}`,
        })
      }

      setStats(statsList)
    } catch (err) {
      console.error("[v0] Error in StatsOverview:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <VStack justify="center" align="center" minH="300px">
        <Spinner color={COLORS.GOLD_BASE} size="lg" />
        <Text color={COLORS.TEXT}>Loading statistics...</Text>
      </VStack>
    )
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg" color={COLORS.GOLD_BASE}>
        Event Statistics
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {stats.map((stat) => (
          <Box key={stat.label} p={4} bg={COLORS.PANEL_MID} borderRadius="md" borderColor={COLORS.ACCENT} borderWidth={1}>
            <Text fontSize="xs" color={COLORS.TEXT_MUTED} textTransform="uppercase" letterSpacing="0.05em" mb={2}>
              {stat.label}
            </Text>
            <Text fontSize="2xl" fontWeight="bold" color={COLORS.GOLD_BASE} mb={1}>
              {stat.value}
            </Text>
            {stat.sub && (
              <Text fontSize="sm" color={COLORS.TEXT_DIM}>
                {stat.sub}
              </Text>
            )}
          </Box>
        ))}
      </SimpleGrid>
    </VStack>
  )
}
