import { useEffect, useState } from "react"
import {
  Box,
  HStack,
  Input,
  Text,
  VStack,
  Button,
} from "@chakra-ui/react"
import { supabase } from "@/lib/supabase"
import { COLORS } from "@/config/constants"
import { VOTING_GROUPS } from "@/config/votingData"

/** Simple hook that returns true when viewport width < 640px */
function useIsMobile() {
  const [mobile, setMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 640)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return mobile
}

interface VoteTally {
  award_category_name: string
  nominee_name: string
  vote_count: number
}

interface CategoryVoteData {
  categoryName: string
  groupName: string
  tallies: { name: string; count: number }[]
  totalVotes: number
}

// ── Bar Chart ──────────────────────────────────────────────────────────────
function VoteBarChart({ tallies }: { tallies: { name: string; count: number }[] }) {
  if (tallies.length === 0) {
    return (
      <Text
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.7rem",
          color: `${COLORS.GOLD_DIM}70`,
          fontStyle: "italic",
        }}
      >
        No votes yet
      </Text>
    )
  }

  const max = tallies[0].count

  return (
    <VStack gap="2" align="stretch" width="100%">
      {tallies.map((entry, i) => {
        const pct = max > 0 ? Math.round((entry.count / max) * 100) : 0
        const isTop = i === 0
        return (
          <Box key={entry.name}>
            <HStack justify="space-between" mb="1">
              <Text
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "0.72rem",
                  color: isTop ? COLORS.GOLD_BRIGHT : COLORS.GOLD_DIM,
                  fontWeight: isTop ? "600" : "400",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "65%",
                }}
              >
                {entry.name}
              </Text>
              <Text
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "0.75rem",
                  color: isTop ? COLORS.GOLD_BASE : `${COLORS.GOLD_DIM}90`,
                  minWidth: "28px",
                  textAlign: "right",
                  fontWeight: isTop ? "700" : "400",
                }}
              >
                {entry.count}
              </Text>
            </HStack>
            {/* Track */}
            <Box w="100%" h="6px" style={{ background: `${COLORS.GOLD_DIM}18`, borderRadius: "3px", overflow: "hidden" }}>
              <Box h="100%" style={{
                width: `${pct}%`,
                background: isTop
                  ? `linear-gradient(90deg, ${COLORS.GOLD_BASE}, ${COLORS.GOLD_BRIGHT})`
                  : `${COLORS.GOLD_DIM}60`,
                borderRadius: "3px",
                transition: "width 0.6s ease",
              }} />
            </Box>
          </Box>
        )
      })}
    </VStack>
  )
}

// ── Category Vote Card ──────────────────────────────────────────────────────
function VoteCategoryCard({
  data,
  isMobile,
}: {
  data: CategoryVoteData
  isMobile: boolean
}) {
  return (
    <Box
      p={isMobile ? "4" : "6"}
      mb="4"
      style={{
        border: `1px solid ${COLORS.GOLD_DIM}35`,
        background: `${COLORS.PANEL_MID}25`,
        borderRadius: "6px",
      }}
    >
      {/* Header */}
      <HStack justify="space-between" mb="4" align="start">
        <VStack gap="0" align="start">
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: isMobile ? "1rem" : "1.15rem",
              fontWeight: "600",
              color: COLORS.GOLD_BRIGHT,
              letterSpacing: "0.5px",
            }}
          >
            {data.categoryName}
          </Text>
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.6rem",
              color: COLORS.GOLD_DIM,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            {data.totalVotes} vote{data.totalVotes !== 1 ? "s" : ""}
          </Text>
        </VStack>

        {/* Count badge */}
        <Box
          style={{
            background: `${COLORS.GOLD_BASE}15`,
            border: `1px solid ${COLORS.GOLD_DIM}40`,
            borderRadius: "4px",
            padding: "4px 10px",
          }}
        >
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.3rem",
              fontWeight: "700",
              color: COLORS.GOLD_BASE,
              lineHeight: 1,
            }}
          >
            {data.totalVotes}
          </Text>
        </Box>
      </HStack>

      {/* Bar chart */}
      <VoteBarChart tallies={data.tallies} />
    </Box>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────
export function VotingResultsPanel() {
  const isMobile = useIsMobile()
  const [categoryData, setCategoryData] = useState<CategoryVoteData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [totalVoters, setTotalVoters] = useState(0)
  const [totalVoteRows, setTotalVoteRows] = useState(0)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [activeGroup, setActiveGroup] = useState<string | null>(null)

  // Reset matric for votes
  const [resetMatric, setResetMatric] = useState("")
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [resetMessage, setResetMessage] = useState("")

  const fetchVotes = async () => {
    try {
      // Exact total vote row count (bypasses row cap)
      const { count: exactCount } = await supabase
        .from("award_votes")
        .select("*", { count: "exact", head: true })

      // Exact unique voter count via RPC
      const { data: uniqueVoterCount } = await supabase.rpc("get_unique_voter_count")

      // Per-category tallies via RPC (one row per category, no row cap issues)
      const { data: talliesData } = await supabase.rpc("get_vote_tallies")

      setTotalVoteRows(exactCount ?? 0)
      setTotalVoters(Number(uniqueVoterCount ?? 0))

      // Build category data from RPC tally results
      const tallyByCategory: Record<string, { name: string; count: number }[]> = {}
      for (const row of (talliesData ?? []) as { category_name: string; tallies: { nominee_name: string; vote_count: number }[] }[]) {
        tallyByCategory[row.category_name] = (row.tallies ?? []).map((t) => ({
          name: t.nominee_name,
          count: Number(t.vote_count),
        }))
      }

      // Map to voting groups structure
      const result: CategoryVoteData[] = []
      for (const group of VOTING_GROUPS) {
        for (const category of group.categories) {
          const tallies = tallyByCategory[category.name] ?? []

          // If no votes yet, show all nominees at 0
          const finalTallies = tallies.length > 0
            ? tallies
            : category.nominees.map((n) => ({ name: n.name, count: 0 }))

          const totalVotes = tallies.reduce((s, t) => s + t.count, 0)
          result.push({
            categoryName: category.name,
            groupName: group.name,
            tallies: finalTallies,
            totalVotes,
          })
        }
      }

      setCategoryData(result)
      setLastRefresh(new Date())
    } catch (err) {
      console.error("[VotingResults] Error fetching votes:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVotes()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchVotes, 10000)
    return () => clearInterval(interval)
  }, [])

  const resetVoterMatric = async () => {
    const matric = resetMatric.trim()
    if (!matric) return
    setResetStatus("loading")
    setResetMessage("")
    try {
      const { error, count } = await supabase
        .from("award_votes")
        .delete({ count: "exact" })
        .eq("voter_matric", matric)
      if (error) throw error
      setResetStatus("success")
      setResetMessage(`Cleared ${count ?? 0} vote(s) for ${matric}. They can now re-vote.`)
      setResetMatric("")
      fetchVotes()
    } catch (err) {
      console.error(err)
      setResetStatus("error")
      setResetMessage("Delete failed. Check the console for details.")
    }
  }



  // Filter categories by search
  const filteredData = categoryData.filter((cat) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      cat.categoryName.toLowerCase().includes(q) ||
      cat.tallies.some((t) => t.name.toLowerCase().includes(q))
    )
  })

  // Group filtered data
  const groupedData: Record<string, CategoryVoteData[]> = {}
  for (const cat of filteredData) {
    const key = cat.groupName
    if (!groupedData[key]) groupedData[key] = []
    groupedData[key].push(cat)
  }

  if (isLoading) {
    return (
      <VStack justify="center" align="center" gap="4" minH="400px">
        <Text color={COLORS.GOLD_DIM}>Loading votes...</Text>
      </VStack>
    )
  }

  return (
    <Box>
      {/* ── HEADER STATS ── */}
      <Box
        mb="5"
        pb="4"
        style={{ borderBottom: `1px solid ${COLORS.GOLD_DIM}20` }}
      >
        <HStack
          gap="6"
          mb="3"
          style={{ flexWrap: "wrap" }}
        >
          <VStack gap="0" align="start">
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", color: COLORS.GOLD_DIM, textTransform: "uppercase" }}>
              Total Votes
            </Text>
            <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem", fontWeight: "700", color: COLORS.GOLD_BRIGHT, lineHeight: 1 }}>
              {totalVoteRows}
            </Text>
          </VStack>
          <VStack gap="0" align="start">
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", color: `${COLORS.GOLD_DIM}80`, textTransform: "uppercase" }}>
              Unique Voters
            </Text>
            <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: "600", color: COLORS.GOLD_DIM, lineHeight: 1 }}>
              {totalVoters}
            </Text>
          </VStack>
          <VStack gap="0" align="start">
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", color: `${COLORS.GOLD_DIM}80`, textTransform: "uppercase" }}>
              Categories
            </Text>
            <Text style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem", fontWeight: "600", color: COLORS.GOLD_DIM, lineHeight: 1 }}>
              {categoryData.length}
            </Text>
          </VStack>
          <Box flex="1" />
          <VStack gap="1" align="end">
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.5rem", letterSpacing: "0.15em", color: `${COLORS.GOLD_DIM}60`, textTransform: "uppercase" }}>
              Auto-refreshes every 10s
            </Text>
            <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.55rem", color: `${COLORS.GOLD_DIM}50` }}>
              Last: {lastRefresh.toLocaleTimeString()}
            </Text>
          </VStack>
        </HStack>

        {/* Action buttons */}
        <HStack gap="3" style={{ flexWrap: "wrap" }}>
          <Button
            onClick={fetchVotes}
            size="sm"
            style={{
              background: `${COLORS.GOLD_BASE}18`,
              border: `1px solid ${COLORS.GOLD_DIM}40`,
              color: COLORS.GOLD_BASE,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            ↺ Refresh Now
          </Button>

        </HStack>
      </Box>

      {/* ── SEARCH + RESET ── */}
      <HStack gap="3" mb="4" align="end" style={{ flexWrap: "wrap" }}>
        <Box flex="1" minW="200px">
          <Input
            placeholder="Search category or nominee…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: `${COLORS.BG}60`,
              border: `1px solid ${COLORS.GOLD_DIM}40`,
              color: COLORS.TEXT,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.75rem",
              padding: "8px 12px",
              borderRadius: "4px",
              width: "100%",
            }}
          />
        </Box>
      </HStack>

      {/* ── RESET MATRIC ── */}
      <Box
        mb="5"
        p="4"
        style={{
          border: `1px solid #cc333340`,
          borderRadius: "6px",
          background: `#8B000010`,
        }}
      >
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.55rem",
            letterSpacing: "0.2em",
            color: `${COLORS.GOLD_DIM}90`,
            textTransform: "uppercase",
            marginBottom: "6px",
          }}
        >
          Reset a Voter's Matric
        </Text>
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.58rem",
            color: `${COLORS.GOLD_DIM}70`,
            marginBottom: "8px",
            lineHeight: 1.5,
          }}
        >
          Deletes all votes for a matric so they can re-vote.
        </Text>
        <HStack gap="2">
          <Input
            placeholder="e.g. 2023/12782"
            value={resetMatric}
            onChange={(e) => { setResetMatric(e.target.value); setResetStatus("idle"); setResetMessage("") }}
            size="sm"
            style={{
              background: `${COLORS.BG}80`,
              border: `1px solid ${COLORS.GOLD_DIM}40`,
              color: COLORS.GOLD_BRIGHT,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.7rem",
              borderRadius: "4px",
              flex: 1,
            }}
          />
          <Button
            onClick={resetVoterMatric}
            size="sm"
            disabled={!resetMatric.trim() || resetStatus === "loading"}
            style={{
              background: resetStatus === "success" ? `${COLORS.GOLD_DIM}20` : `#8B000020`,
              border: `1px solid ${resetStatus === "success" ? COLORS.GOLD_DIM : "#cc333360"}`,
              color: resetStatus === "success" ? COLORS.GOLD_DIM : "#ff6666",
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {resetStatus === "loading" ? "Clearing..." : "✕ Clear Votes"}
          </Button>
        </HStack>
        {resetMessage && (
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.58rem",
              color: resetStatus === "success" ? COLORS.GOLD_DIM : "#ff6666",
              marginTop: "6px",
              lineHeight: 1.5,
            }}
          >
            {resetMessage}
          </Text>
        )}
      </Box>

      {/* ── GROUP FILTER PILLS ── */}
      <Box
        mb="4"
        style={{
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          display: "flex",
          gap: "8px",
          paddingBottom: "6px",
        }}
      >
        <Box
          onClick={() => setActiveGroup(null)}
          style={{
            cursor: "pointer",
            padding: "5px 14px",
            borderRadius: "20px",
            border: `1px solid ${!activeGroup ? COLORS.GOLD_BASE : `${COLORS.GOLD_DIM}40`}`,
            background: !activeGroup ? `${COLORS.GOLD_BASE}20` : "transparent",
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "all 0.2s ease",
          }}
        >
          <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.62rem", color: !activeGroup ? COLORS.GOLD_BRIGHT : COLORS.GOLD_DIM, fontWeight: !activeGroup ? "600" : "400" }}>
            All Categories
          </Text>
        </Box>
        {VOTING_GROUPS.map((group) => {
          const isActive = activeGroup === group.type
          const groupVotes = categoryData
            .filter((c) => c.groupName === group.name)
            .reduce((s, c) => s + c.totalVotes, 0)
          return (
            <Box
              key={group.type}
              onClick={() => setActiveGroup(group.type)}
              style={{
                cursor: "pointer",
                padding: "5px 14px",
                borderRadius: "20px",
                border: `1px solid ${isActive ? COLORS.GOLD_BASE : `${COLORS.GOLD_DIM}40`}`,
                background: isActive ? `${COLORS.GOLD_BASE}20` : "transparent",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 0.2s ease",
              }}
            >
              <Text style={{ fontFamily: "'Josefin Sans', sans-serif", fontSize: "0.62rem", color: isActive ? COLORS.GOLD_BRIGHT : COLORS.GOLD_DIM, fontWeight: isActive ? "600" : "400" }}>
                {group.name} <span style={{ color: `${COLORS.GOLD_DIM}80` }}>({groupVotes})</span>
              </Text>
            </Box>
          )
        })}
      </Box>

      {/* ── CATEGORY CARDS ── */}
      {Object.entries(groupedData)
        .filter(([groupName]) => {
          if (!activeGroup) return true
          const matchingGroup = VOTING_GROUPS.find((g) => g.type === activeGroup)
          return matchingGroup?.name === groupName
        })
        .map(([groupName, cats]) => (
          <Box key={groupName} mb="6">
            {/* Group header */}
            <Box
              mb="3"
              pb="2"
              style={{ borderBottom: `1px solid ${COLORS.GOLD_DIM}20` }}
            >
              <Text
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: isMobile ? "1.1rem" : "1.3rem",
                  fontWeight: "600",
                  color: COLORS.GOLD_BASE,
                  letterSpacing: "1px",
                }}
              >
                {groupName}
              </Text>
              <Text
                style={{
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "0.5rem",
                  letterSpacing: "0.2em",
                  color: `${COLORS.GOLD_DIM}70`,
                  textTransform: "uppercase",
                }}
              >
                {cats.reduce((s, c) => s + c.totalVotes, 0)} total votes across {cats.length} categories
              </Text>
            </Box>

            {/* Category cards within this group */}
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: "12px",
              }}
            >
              {cats.map((cat) => (
                <VoteCategoryCard
                  key={cat.categoryName}
                  data={cat}
                  isMobile={isMobile}
                />
              ))}
            </Box>
          </Box>
        ))}

      {filteredData.length === 0 && (
        <VStack justify="center" align="center" gap="4" minH="200px">
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.8rem",
              color: `${COLORS.GOLD_DIM}60`,
              fontStyle: "italic",
            }}
          >
            {searchQuery ? "No categories match your search" : "No vote data yet"}
          </Text>
        </VStack>
      )}
    </Box>
  )
}
