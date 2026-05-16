import { useEffect, useRef, useState } from "react"
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
import type { Database } from "@/lib/supabase"

type AwardCategory = Database["public"]["Tables"]["award_categories"]["Row"]
type Nomination = Database["public"]["Tables"]["award_nominations"]["Row"]

interface CategoryNominations {
  category: AwardCategory
  nominations: Nomination[]
  count: number
}

interface TallyEntry {
  name: string
  count: number
}

/**
 * Converts a name to Title Case for normalised display.
 */
function toTitleCase(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(?:^|[\s\-'])\S/g, (ch) => ch.toUpperCase())
}

/**
 * Builds a vote tally, merging case-insensitive variants of the same name.
 * Picks the most-frequently-submitted casing for display; falls back to
 * Title Case when all variants are unique.
 */
function buildTally(nominations: Nomination[]): TallyEntry[] {
  // key = lowercased name → { total count, variant frequency map }
  const map: Record<string, { total: number; variants: Record<string, number> }> = {}

  for (const nom of nominations) {
    const raw = (nom.nominee_name ?? "Unknown").trim()
    const key = raw.toLowerCase()
    if (!map[key]) map[key] = { total: 0, variants: {} }
    map[key].total += 1
    map[key].variants[raw] = (map[key].variants[raw] ?? 0) + 1
  }

  return Object.values(map)
    .map(({ total, variants }) => {
      // Pick the variant that was submitted the most; fall back to title case
      const bestVariant = Object.entries(variants).sort((a, b) => b[1] - a[1])[0]?.[0]
      return { name: bestVariant ?? toTitleCase(Object.keys(variants)[0] ?? "Unknown"), count: total }
    })
    .sort((a, b) => b.count - a.count)
}

// ── Bar Chart ──────────────────────────────────────────────────────────────
function NomineeBarChart({ nominations }: { nominations: Nomination[] }) {
  const tally = buildTally(nominations)
  if (tally.length === 0) {
    return (
      <Text
        style={{
          fontFamily: "'Josefin Sans', sans-serif",
          fontSize: "0.7rem",
          color: `${COLORS.GOLD_DIM}70`,
          fontStyle: "italic",
        }}
      >
        No nominations yet
      </Text>
    )
  }

  const max = tally[0].count

  return (
    <VStack gap="2" align="stretch" width="100%">
      {tally.map((entry, i) => {
        const pct = Math.round((entry.count / max) * 100)
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
                  maxWidth: "60%",
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
                }}
              >
                {entry.count}
              </Text>
            </HStack>
            {/* Track */}
            <Box
              w="100%"
              h="6px"
              style={{
                background: `${COLORS.GOLD_DIM}18`,
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              {/* Fill */}
              <Box
                h="100%"
                style={{
                  width: `${pct}%`,
                  background: isTop
                    ? `linear-gradient(90deg, ${COLORS.GOLD_BASE}, ${COLORS.GOLD_BRIGHT})`
                    : `${COLORS.GOLD_DIM}60`,
                  borderRadius: "3px",
                  transition: "width 0.6s ease",
                }}
              />
            </Box>
          </Box>
        )
      })}
    </VStack>
  )
}

// ── Category Card ───────────────────────────────────────────────────────────
function CategoryCard({
  data,
  searchQuery,
  sectionRef,
}: {
  data: CategoryNominations
  searchQuery: string
  sectionRef: (el: HTMLDivElement | null) => void
}) {
  const filtered = data.nominations.filter(
    (nom) =>
      !searchQuery ||
      nom.nominee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nom.nominator_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box
      ref={sectionRef}
      p="6"
      mb="4"
      style={{
        border: `1px solid ${COLORS.GOLD_DIM}35`,
        background: `${COLORS.PANEL_MID}25`,
        borderRadius: "6px",
        scrollMarginTop: "16px",
      }}
    >
      {/* Category Header */}
      <HStack justify="space-between" mb="4" align="start">
        <VStack gap="0" align="start">
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.15rem",
              fontWeight: "600",
              color: COLORS.GOLD_BRIGHT,
              letterSpacing: "0.5px",
            }}
          >
            {data.category.name}
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
            {data.count} nomination{data.count !== 1 ? "s" : ""}
          </Text>
        </VStack>

        {/* Mini nomination count badge */}
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
            {data.count}
          </Text>
        </Box>
      </HStack>

      {/* Two-column: bar chart + nominee list */}
      <HStack gap="6" align="start">
        {/* Bar Chart */}
        <Box flex="1" minW="0">
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "0.18em",
              color: `${COLORS.GOLD_DIM}80`,
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Votes
          </Text>
          <NomineeBarChart nominations={data.nominations} />
        </Box>

        {/* Separator */}
        <Box
          w="1px"
          alignSelf="stretch"
          style={{ background: `${COLORS.GOLD_DIM}20`, flexShrink: 0 }}
        />

        {/* Nomination entries */}
        <Box flex="1" minW="0">
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "0.18em",
              color: `${COLORS.GOLD_DIM}80`,
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            Entries
          </Text>

          {filtered.length === 0 ? (
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.7rem",
                color: `${COLORS.GOLD_DIM}60`,
                fontStyle: "italic",
              }}
            >
              {searchQuery ? "No matches" : "No nominations yet"}
            </Text>
          ) : (
            <VStack gap="2" align="stretch">
              {filtered.map((nom) => (
                <Box
                  key={nom.id}
                  style={{
                    borderLeft: `2px solid ${COLORS.GOLD_DIM}35`,
                    paddingLeft: "10px",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "0.9rem",
                      fontWeight: "500",
                      color: COLORS.GOLD_BRIGHT,
                    }}
                  >
                    {String(nom.nominee_name ?? "")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.65rem",
                      color: `${COLORS.GOLD_DIM}80`,
                    }}
                  >
                    by {String(nom.nominator_name ?? "")}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </HStack>
    </Box>
  )
}

// ── Main Component ──────────────────────────────────────────────────────────
export function AwardsNominationsList() {
  const [nominations, setNominations] = useState<CategoryNominations[]>([])
  const [allNominations, setAllNominations] = useState<Nomination[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [uniqueNominatorCount, setUniqueNominatorCount] = useState(0)
  const [totalNominationCount, setTotalNominationCount] = useState(0)

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const fetchNominations = async () => {
    try {
      const { data: categories } = await supabase
        .from("award_categories")
        .select("*")
        .order("display_order", { ascending: true })

      const { data: allNominations } = await supabase
        .from("award_nominations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10000) // Supabase PostgREST defaults to 1000 rows — raise cap

      if (categories && allNominations) {
        // Store flat list for export
        setAllNominations(allNominations)

        // Count total nomination rows
        setTotalNominationCount(allNominations.length)

        // Count unique nominators (by matric number)
        const uniqueNominators = new Set(
          allNominations.map((n) => (n as Record<string, unknown>).nominator_matric).filter(Boolean)
        )
        setUniqueNominatorCount(uniqueNominators.size)

        const grouped = categories.map((cat) => ({
          category: cat,
          nominations: allNominations.filter((n) => n.award_category_id === cat.id),
          count: allNominations.filter((n) => n.award_category_id === cat.id).length,
        }))
        setNominations(grouped)
        if (!activeId && grouped.length > 0) setActiveId(grouped[0].category.id)
      }
    } catch (err) {
      console.error("[AwardsNominationsList] Error fetching:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNominations()
    const interval = setInterval(fetchNominations, 10000)
    return () => clearInterval(interval)
  }, [])

  const scrollTo = (id: string) => {
    setActiveId(id)
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const totalNominations = uniqueNominatorCount
  const totalRows = totalNominationCount

  const exportCSV = () => {
    if (allNominations.length === 0) return
    const headers = [
      "Award Category",
      "Nominee Name",
      "Nominator Name",
      "Nominator Matric",
      "Nominator Email",
      "Nominator Phone",
      "Submitted At",
    ]
    const escape = (v: unknown) => {
      const s = String(v ?? "")
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }
    const rows = allNominations.map((n) => [
      escape((n as Record<string, unknown>).award_category_name ?? ""),
      escape(n.nominee_name ?? ""),
      escape(n.nominator_name ?? ""),
      escape((n as Record<string, unknown>).nominator_matric ?? ""),
      escape(n.nominator_email ?? ""),
      escape(n.nominator_phone ?? ""),
      escape(n.created_at ?? ""),
    ].join(","))
    const csv = [headers.join(","), ...rows].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `busa-nominations-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <VStack justify="center" align="center" gap="4" minH="400px">
        <Text color={COLORS.GOLD_DIM}>Loading nominations...</Text>
      </VStack>
    )
  }

  return (
    <HStack align="start" gap="0" height="calc(100vh - 180px)" overflow="hidden">
      {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
      <Box
        w="220px"
        flexShrink={0}
        height="100%"
        overflowY="auto"
        pr="3"
        style={{
          borderRight: `1px solid ${COLORS.GOLD_DIM}25`,
        }}
      >
        {/* Totals */}
        <Box mb="4" pb="3" style={{ borderBottom: `1px solid ${COLORS.GOLD_DIM}20` }}>
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              color: COLORS.GOLD_DIM,
              textTransform: "uppercase",
              marginBottom: "2px",
            }}
          >
            Total Nominations
          </Text>
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: "700",
              color: COLORS.GOLD_BRIGHT,
              lineHeight: 1,
            }}
          >
            {totalRows}
          </Text>
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              color: `${COLORS.GOLD_DIM}80`,
              textTransform: "uppercase",
              marginTop: "8px",
              marginBottom: "2px",
            }}
          >
            Unique Nominators
          </Text>
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "1.4rem",
              fontWeight: "600",
              color: COLORS.GOLD_DIM,
              lineHeight: 1,
            }}
          >
            {totalNominations}
          </Text>
        </Box>

        {/* Refresh */}
        <Button
          onClick={fetchNominations}
          size="sm"
          width="100%"
          mb="2"
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
          ↺ Refresh
        </Button>

        {/* Export CSV */}
        <Button
          onClick={exportCSV}
          size="sm"
          width="100%"
          mb="4"
          style={{
            background: `${COLORS.GOLD_BASE}28`,
            border: `1px solid ${COLORS.GOLD_BASE}60`,
            color: COLORS.GOLD_BRIGHT,
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.55rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          ↓ Export All CSV
        </Button>

        {/* Category nav links */}
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.55rem",
            letterSpacing: "0.2em",
            color: `${COLORS.GOLD_DIM}80`,
            textTransform: "uppercase",
            marginBottom: "8px",
          }}
        >
          Categories
        </Text>

        <VStack gap="1" align="stretch">
          {nominations.map((n) => {
            const isActive = activeId === n.category.id
            return (
              <Box
                key={n.category.id}
                onClick={() => scrollTo(n.category.id)}
                style={{
                  cursor: "pointer",
                  padding: "7px 10px",
                  borderRadius: "4px",
                  borderLeft: `2px solid ${isActive ? COLORS.GOLD_BASE : "transparent"}`,
                  background: isActive ? `${COLORS.GOLD_BASE}12` : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                <Text
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.68rem",
                    color: isActive ? COLORS.GOLD_BRIGHT : COLORS.GOLD_DIM,
                    fontWeight: isActive ? "600" : "400",
                    lineHeight: 1.3,
                  }}
                >
                  {n.category.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.58rem",
                    color: `${COLORS.GOLD_DIM}70`,
                  }}
                >
                  {n.count} vote{n.count !== 1 ? "s" : ""}
                </Text>
              </Box>
            )
          })}
        </VStack>
      </Box>

      {/* ── RIGHT CONTENT ─────────────────────────────────────── */}
      <Box flex="1" height="100%" overflowY="auto" pl="5" pr="1">
        {/* Search */}
        <Box mb="4">
          <Input
            placeholder="Search by nominee or nominator…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: `${COLORS.BG}60`,
              border: `1px solid ${COLORS.GOLD_DIM}40`,
              color: COLORS.TEXT,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.82rem",
              padding: "8px 12px",
              borderRadius: "4px",
              width: "100%",
            }}
          />
        </Box>

        {/* One card per category */}
        {nominations.map((n) => (
          <CategoryCard
            key={n.category.id}
            data={n}
            searchQuery={searchQuery}
            sectionRef={(el) => { sectionRefs.current[n.category.id] = el }}
          />
        ))}
      </Box>
    </HStack>
  )
}
