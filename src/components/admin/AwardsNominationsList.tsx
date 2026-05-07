import { useEffect, useState } from "react"
import { Box, VStack, HStack, Text, Input, Badge, SimpleGrid, ScrollArea, Button } from "@chakra-ui/react"
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

export function AwardsNominationsList() {
  const [nominations, setNominations] = useState<CategoryNominations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const fetchNominations = async () => {
    try {
      // Fetch categories
      const { data: categories } = await supabase
        .from("award_categories")
        .select("*")
        .order("display_order", { ascending: true })

      // Fetch all nominations
      const { data: allNominations } = await supabase
        .from("award_nominations")
        .select("*")
        .order("created_at", { ascending: false })

      if (categories && allNominations) {
        const grouped = categories.map((cat) => ({
          category: cat,
          nominations: allNominations.filter((n) => n.award_category_id === cat.id),
          count: allNominations.filter((n) => n.award_category_id === cat.id).length,
        }))
        setNominations(grouped)
      }
    } catch (err) {
      console.error("[v0] Error fetching nominations:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNominations()
    // Poll for new nominations every 5 seconds
    const interval = setInterval(fetchNominations, 5000)
    return () => clearInterval(interval)
  }, [])

  const filteredNominations = selectedCategory
    ? nominations.find((n) => n.category.id === selectedCategory) || { category: null, nominations: [], count: 0 }
    : nominations

  const allNoms = Array.isArray(filteredNominations)
    ? filteredNominations.flatMap((n) => n.nominations)
    : filteredNominations.nominations

  const searchedNoms = allNoms.filter(
    (nom) =>
      nom.nominee_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nom.nominator_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nom.nomination_reason?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalNominations = Array.isArray(filteredNominations)
    ? filteredNominations.reduce((sum, n) => sum + n.count, 0)
    : filteredNominations.count

  if (isLoading) {
    return (
      <VStack justify="center" align="center" gap="4" minH="400px">
        <Text color={COLORS.GOLD_DIM}>Loading nominations...</Text>
      </VStack>
    )
  }

  return (
    <VStack gap="6" align="stretch">
      {/* Header Stats */}
      <Box
        p="6"
        style={{
          border: `1px solid ${COLORS.GOLD_DIM}40`,
          background: `linear-gradient(180deg, ${COLORS.PANEL_MID}60 0%, ${COLORS.BG} 100%)`,
        }}
      >
        <HStack justify="space-between" mb="4">
          <VStack gap="0" align="start">
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.2em",
                color: COLORS.GOLD_DIM,
                textTransform: "uppercase",
              }}
            >
              Total Nominations
            </Text>
            <Text
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "2.2rem",
                fontWeight: "700",
                color: COLORS.GOLD_BRIGHT,
              }}
            >
              {totalNominations}
            </Text>
          </VStack>
          <Button
            onClick={fetchNominations}
            size="sm"
            style={{
              background: COLORS.GOLD_BASE,
              color: COLORS.BG,
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "0.15em",
              cursor: "pointer",
              padding: "8px 16px",
            }}
          >
            Refresh
          </Button>
        </HStack>
        <Input
          placeholder="Search by nominee, nominator, or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: `${COLORS.BG}60`,
            border: `1px solid ${COLORS.GOLD_DIM}40`,
            color: COLORS.TEXT,
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.85rem",
            padding: "8px 12px",
          }}
        />
      </Box>

      {/* Category Leaderboard */}
      <Box>
        <Text
          style={{
            fontFamily: "'Josefin Sans', sans-serif",
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            color: COLORS.GOLD_DIM,
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          Categories
        </Text>
        <ScrollArea style={{ width: "100%", overflow: "auto", paddingBottom: "8px" }}>
          <HStack gap="2" wrap="wrap">
            <Button
              onClick={() => setSelectedCategory(null)}
              variant={selectedCategory === null ? "solid" : "outline"}
              size="sm"
              style={{
                background: selectedCategory === null ? COLORS.GOLD_BASE : "transparent",
                border: `1px solid ${COLORS.GOLD_DIM}40`,
                color: selectedCategory === null ? COLORS.BG : COLORS.GOLD_DIM,
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                cursor: "pointer",
              }}
            >
              All Categories
            </Button>
            {nominations.map((n) => (
              <Button
                key={n.category.id}
                onClick={() => setSelectedCategory(n.category.id)}
                variant={selectedCategory === n.category.id ? "solid" : "outline"}
                size="sm"
                style={{
                  background: selectedCategory === n.category.id ? COLORS.GOLD_BASE : "transparent",
                  border: `1px solid ${COLORS.GOLD_DIM}40`,
                  color: selectedCategory === n.category.id ? COLORS.BG : COLORS.GOLD_DIM,
                  fontFamily: "'Josefin Sans', sans-serif",
                  fontSize: "0.6rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {n.category.name} ({n.count})
              </Button>
            ))}
          </HStack>
        </ScrollArea>
      </Box>

      {/* Nominations List */}
      {searchedNoms.length === 0 ? (
        <Box
          p="6"
          textAlign="center"
          style={{
            border: `1px dashed ${COLORS.GOLD_DIM}40`,
          }}
        >
          <Text color={COLORS.GOLD_DIM}>
            {searchQuery ? "No nominations matching your search" : "No nominations yet"}
          </Text>
        </Box>
      ) : (
        <VStack gap="3" align="stretch">
          {searchedNoms.map((nom) => {
            const category = nominations
              .find((n) => n.category.id === nom.award_category_id)
              ?.category
            return (
              <Box
                key={nom.id}
                p="4"
                style={{
                  border: `1px solid ${COLORS.GOLD_DIM}40`,
                  background: `${COLORS.PANEL_MID}30`,
                  borderRadius: "4px",
                }}
              >
                <HStack justify="space-between" mb="2" align="start">
                  <VStack gap="1" align="start" flex="1">
                    <HStack gap="2" align="center">
                      <Text
                        style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "1rem",
                          fontWeight: "600",
                          color: COLORS.GOLD_BRIGHT,
                        }}
                      >
                        {nom.nominee_name}
                      </Text>
                      <Badge
                        style={{
                          background: COLORS.GOLD_BASE,
                          color: COLORS.BG,
                          fontFamily: "'Josefin Sans', sans-serif",
                          fontSize: "0.5rem",
                        }}
                      >
                        {category?.name || "Unknown"}
                      </Badge>
                    </HStack>
                    <Text
                      style={{
                        fontFamily: "'Josefin Sans', sans-serif",
                        fontSize: "0.75rem",
                        color: COLORS.GOLD_DIM,
                      }}
                    >
                      Nominated by: {nom.nominator_name}
                    </Text>
                  </VStack>
                  <Text
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.65rem",
                      color: COLORS.GOLD_DIM,
                    }}
                  >
                    {new Date(nom.created_at).toLocaleDateString()}
                  </Text>
                </HStack>

                {nom.nomination_reason && (
                  <Text
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.8rem",
                      color: COLORS.TEXT,
                      lineHeight: "1.4",
                      marginBottom: "6px",
                    }}
                  >
                    {nom.nomination_reason}
                  </Text>
                )}

                {nom.evidence_link && (
                  <Text
                    as="a"
                    href={nom.evidence_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.75rem",
                      color: COLORS.GOLD_BASE,
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    View Evidence
                  </Text>
                )}
              </Box>
            )
          })}
        </VStack>
      )}
    </VStack>
  )
}
