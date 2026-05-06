import { useEffect, useState } from "react"
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Container,
  Card,
  Spinner,
  SimpleGrid,
} from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"
import type { Database } from "@/lib/supabase"

type AwardCategory = Database["public"]["Tables"]["award_categories"]["Row"]

interface AwardsByType {
  social: AwardCategory[]
  creative: AwardCategory[]
  sports: AwardCategory[]
  entertainment: AwardCategory[]
  innovation: AwardCategory[]
}

export default function AwardsPage() {
  const [categories, setCategories] = useState<AwardsByType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<AwardCategory | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nomineeName: "",
    nomineeEmail: "",
    nomineePhone: "",
    nominatorName: "",
    nominatorEmail: "",
    nominatorPhone: "",
    nominationReason: "",
    evidenceLink: "",
  })

  // Load categories on mount
  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("award_categories")
        .select("*")
        .order("display_order", { ascending: true })

      if (error) throw error

      // Group categories by type
      const grouped: AwardsByType = {
        social: [],
        creative: [],
        sports: [],
        entertainment: [],
        innovation: [],
      }

      data?.forEach((cat) => {
        const type = cat.category_type as keyof AwardsByType
        if (type in grouped) {
          grouped[type].push(cat)
        }
      })

      setCategories(grouped)
    } catch (error) {
      console.error("Failed to load categories:", error)
      toaster.create({
        title: "Error",
        description: "Failed to load award categories",
        type: "error",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCategory) {
      toaster.create({
        title: "Please select an award category",
        type: "warning",
        duration: 3000,
      })
      return
    }

    if (!formData.nomineeName || !formData.nominatorName || !formData.nominationReason) {
      toaster.create({
        title: "Please fill in all required fields",
        type: "warning",
        duration: 3000,
      })
      return
    }

    try {
      setIsSubmitting(true)

      const { error } = await supabase.from("award_nominations").insert({
        award_category_id: selectedCategory.id,
        nominee_name: formData.nomineeName,
        nominee_email: formData.nomineeEmail || null,
        nominee_phone: formData.nomineePhone || null,
        nominator_name: formData.nominatorName,
        nominator_email: formData.nominatorEmail,
        nominator_phone: formData.nominatorPhone || null,
        nomination_reason: formData.nominationReason,
        evidence_link: formData.evidenceLink || null,
      })

      if (error) throw error

      toaster.create({
        title: "Nomination submitted successfully!",
        description: "Thank you for nominating an outstanding individual.",
        type: "success",
        duration: 5000,
      })

      // Reset form
      resetForm()
    } catch (error) {
      console.error("Submission error:", error)
      toaster.create({
        title: "Error",
        description: "Failed to submit nomination",
        type: "error",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nomineeName: "",
      nomineeEmail: "",
      nomineePhone: "",
      nominatorName: "",
      nominatorEmail: "",
      nominatorPhone: "",
      nominationReason: "",
      evidenceLink: "",
    })
    setSelectedCategory(null)
  }

  const categoryGroups = [
    { name: "Social Awards", type: "social" as const, emoji: "👥" },
    { name: "Creative Awards", type: "creative" as const, emoji: "🎨" },
    { name: "Sports Awards", type: "sports" as const, emoji: "⚽" },
    { name: "Entertainment Awards", type: "entertainment" as const, emoji: "🎭" },
    { name: "Innovation Awards", type: "innovation" as const, emoji: "💡" },
  ]

  if (isLoading) {
    return (
      <Box minH="100vh" bg={COLORS.BG} display="flex" alignItems="center" justifyContent="center">
        <VStack gap={4}>
          <Spinner size="xl" color={COLORS.GOLD_BRIGHT} />
          <Text color={COLORS.TEXT}>Loading award categories...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bg={COLORS.BG} pt={12} pb={12}>
      <Container maxW="1200px">
        {/* Header */}
        <VStack gap={8} mb={12} textAlign="center">
          <Heading
            as="h1"
            fontSize="4xl"
            fontFamily="'Cormorant Garamond', serif"
            color={COLORS.GOLD_BRIGHT}
            letterSpacing="2px"
          >
            BUSA AWARDS
          </Heading>
          <Text color={COLORS.TEXT} fontSize="lg" maxW="600px">
            Celebrate excellence and nominate your peers for their outstanding achievements across multiple categories.
          </Text>
        </VStack>

        {/* Category Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6} mb={16}>
          {categoryGroups.map((group) => {
            const categoryList = categories?.[group.type] || []
            return (
              <Card.Root key={group.type} bg={COLORS.PANEL_DARK} borderColor={COLORS.GOLD_DIM} borderWidth="1px">
                <Card.Header pb={2}>
                  <Heading size="md" color={COLORS.GOLD_BRIGHT}>
                    {group.emoji} {group.name}
                  </Heading>
                </Card.Header>
                <Card.Body pt={2}>
                  <VStack align="start" gap={2}>
                    {categoryList.map((cat) => (
                      <Button
                        key={cat.id}
                        size="sm"
                        variant={selectedCategory?.id === cat.id ? "solid" : "outline"}
                        onClick={() => setSelectedCategory(cat)}
                        bg={selectedCategory?.id === cat.id ? COLORS.GOLD_BRIGHT : "transparent"}
                        color={selectedCategory?.id === cat.id ? COLORS.BG : COLORS.GOLD_DIM}
                        borderColor={COLORS.GOLD_DIM}
                        _hover={{
                          bg: selectedCategory?.id === cat.id ? COLORS.GOLD_BRIGHT : COLORS.PANEL_MID,
                          borderColor: COLORS.GOLD_BRIGHT,
                        }}
                        width="100%"
                        justifyContent="flex-start"
                      >
                        {cat.name}
                      </Button>
                    ))}
                  </VStack>
                </Card.Body>
              </Card.Root>
            )
          })}
        </SimpleGrid>

        {/* Nomination Form */}
        {selectedCategory && (
          <Card.Root
            bg={COLORS.PANEL_DARK}
            borderColor={COLORS.GOLD_DIM}
            borderWidth="1px"
            maxW="700px"
            mx="auto"
          >
            <Card.Header borderBottom={`1px solid ${COLORS.GOLD_DIM}`} pb={6}>
              <VStack align="start" gap={2}>
                <Heading size="lg" color={COLORS.GOLD_BRIGHT}>
                  Nominate for {selectedCategory.name}
                </Heading>
                <Text color={COLORS.TEXT_DIM} fontSize="sm">
                  {selectedCategory.description}
                </Text>
              </VStack>
            </Card.Header>

            {/* FIX: Removed `as="form"` from Card.Body — use a plain <form> wrapper inside instead */}
            <Card.Body pt={6}>
              <form onSubmit={handleSubmit}>
                <VStack gap={6}>
                  {/* Nominee Section */}
                  <Box width="100%">
                    <Heading size="sm" color={COLORS.GOLD_BASE} mb={4}>
                      Nominee Information
                    </Heading>
                    <VStack gap={4}>
                      <Input
                        placeholder="Nominee Name *"
                        required
                        value={formData.nomineeName}
                        onChange={(e) => setFormData({ ...formData, nomineeName: e.target.value })}
                        bg={COLORS.PANEL_MID}
                        borderColor={COLORS.GOLD_DIM}
                        color={COLORS.TEXT}
                        _placeholder={{ color: COLORS.TEXT_DIM }}
                      />
                      <Input
                        placeholder="Nominee Email"
                        type="email"
                        value={formData.nomineeEmail}
                        onChange={(e) => setFormData({ ...formData, nomineeEmail: e.target.value })}
                        bg={COLORS.PANEL_MID}
                        borderColor={COLORS.GOLD_DIM}
                        color={COLORS.TEXT}
                        _placeholder={{ color: COLORS.TEXT_DIM }}
                      />
                      <Input
                        placeholder="Nominee Phone"
                        type="tel"
                        value={formData.nomineePhone}
                        onChange={(e) => setFormData({ ...formData, nomineePhone: e.target.value })}
                        bg={COLORS.PANEL_MID}
                        borderColor={COLORS.GOLD_DIM}
                        color={COLORS.TEXT}
                        _placeholder={{ color: COLORS.TEXT_DIM }}
                      />
                    </VStack>
                  </Box>

                  {/* Nominator Section */}
                  <Box width="100%">
                    <Heading size="sm" color={COLORS.GOLD_BASE} mb={4}>
                      Your Information (Nominator)
                    </Heading>
                    <VStack gap={4}>
                      <Input
                        placeholder="Your Name *"
                        required
                        value={formData.nominatorName}
                        onChange={(e) => setFormData({ ...formData, nominatorName: e.target.value })}
                        bg={COLORS.PANEL_MID}
                        borderColor={COLORS.GOLD_DIM}
                        color={COLORS.TEXT}
                        _placeholder={{ color: COLORS.TEXT_DIM }}
                      />
                      <Input
                        placeholder="Your Email *"
                        type="email"
                        required
                        value={formData.nominatorEmail}
                        onChange={(e) => setFormData({ ...formData, nominatorEmail: e.target.value })}
                        bg={COLORS.PANEL_MID}
                        borderColor={COLORS.GOLD_DIM}
                        color={COLORS.TEXT}
                        _placeholder={{ color: COLORS.TEXT_DIM }}
                      />
                      <Input
                        placeholder="Your Phone"
                        type="tel"
                        value={formData.nominatorPhone}
                        onChange={(e) => setFormData({ ...formData, nominatorPhone: e.target.value })}
                        bg={COLORS.PANEL_MID}
                        borderColor={COLORS.GOLD_DIM}
                        color={COLORS.TEXT}
                        _placeholder={{ color: COLORS.TEXT_DIM }}
                      />
                    </VStack>
                  </Box>

                  {/* Reason Section */}
                  <Box width="100%">
                    <Heading size="sm" color={COLORS.GOLD_BASE} mb={4}>
                      Nomination Details
                    </Heading>
                    <VStack gap={4}>
                      <Textarea
                        placeholder="Why do you nominate this person? Please provide specific examples of their achievements or contributions. *"
                        required
                        value={formData.nominationReason}
                        onChange={(e) => setFormData({ ...formData, nominationReason: e.target.value })}
                        bg={COLORS.PANEL_MID}
                        borderColor={COLORS.GOLD_DIM}
                        color={COLORS.TEXT}
                        _placeholder={{ color: COLORS.TEXT_DIM }}
                        minH="120px"
                      />
                      <Input
                        placeholder="Evidence Link (Portfolio, Social Media, etc.)"
                        type="url"
                        value={formData.evidenceLink}
                        onChange={(e) => setFormData({ ...formData, evidenceLink: e.target.value })}
                        bg={COLORS.PANEL_MID}
                        borderColor={COLORS.GOLD_DIM}
                        color={COLORS.TEXT}
                        _placeholder={{ color: COLORS.TEXT_DIM }}
                      />
                    </VStack>
                  </Box>

                  {/* Action Buttons */}
                  <HStack width="100%" gap={4}>
                    <Button
                      flex={1}
                      variant="outline"
                      borderColor={COLORS.GOLD_DIM}
                      color={COLORS.GOLD_DIM}
                      type="button"
                      onClick={resetForm}
                    >
                      Cancel
                    </Button>
                    <Button
                      flex={1}
                      bg={COLORS.GOLD_BRIGHT}
                      color={COLORS.BG}
                      loading={isSubmitting}
                      type="submit"
                      _hover={{ opacity: 0.9 }}
                    >
                      Submit Nomination
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </Card.Body>
          </Card.Root>
        )}
      </Container>
    </Box>
  )
}
