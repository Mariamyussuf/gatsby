import { useEffect, useState } from "react"
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Container,
  Spinner,
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

interface NominatorInfo {
  name: string
  matricNumber: string
  email: string
  phone: string
}

interface CategoryNomination {
  categoryId: string
  categoryName: string
  nomineeName: string
}

const MATRIC_REGEX = /^\d{4}\/\d{5}$/

const categoryGroups = [
  { name: "Social Awards", type: "social" as const, emoji: "👥" },
  { name: "Creative Awards", type: "creative" as const, emoji: "🎨" },
  { name: "Sports Awards", type: "sports" as const, emoji: "⚽" },
  { name: "Entertainment Awards", type: "entertainment" as const, emoji: "🎭" },
  { name: "Innovation Awards", type: "innovation" as const, emoji: "💡" },
]

const inputStyles = {
  bg: "transparent" as const,
  borderColor: COLORS.GOLD_DIM,
  color: COLORS.TEXT,
  _placeholder: { color: COLORS.TEXT_DIM },
  _focus: { borderColor: COLORS.GOLD_BRIGHT, boxShadow: "none" },
}

function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <Box>
      <Text color={COLORS.TEXT} fontSize="sm" fontWeight="500" mb={1}>
        {label}
      </Text>
      {hint && (
        <Text color={COLORS.TEXT_DIM} fontSize="xs" mb={1}>
          {hint}
        </Text>
      )}
      {children}
      {error && (
        <Text color="#FF6B6B" fontSize="xs" mt={1}>
          {error}
        </Text>
      )}
    </Box>
  )
}

export default function AwardsPage() {
  const [categories, setCategories] = useState<AwardsByType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = 1 + categoryGroups.length + 1

  const [nominator, setNominator] = useState<NominatorInfo>({
    name: "",
    matricNumber: "",
    email: "",
    phone: "",
  })

  const [nominations, setNominations] = useState<Record<string, CategoryNomination[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

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

      const grouped: AwardsByType = {
        social: [],
        creative: [],
        sports: [],
        entertainment: [],
        innovation: [],
      }

      data?.forEach((cat) => {
        const type = cat.category_type as keyof AwardsByType
        if (type in grouped) grouped[type].push(cat)
      })

      setCategories(grouped)

      const initialNominations: Record<string, CategoryNomination[]> = {}
      categoryGroups.forEach((group) => {
        const cats = grouped[group.type] || []
        initialNominations[group.type] = cats.map((cat) => ({
          categoryId: cat.id,
          categoryName: cat.name,
          nomineeName: "",
        }))
      })
      setNominations(initialNominations)
    } catch (error) {
      console.error("Failed to load categories:", error)
      toaster.create({
        title: "Error loading categories",
        type: "error",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const progressPercent = Math.round((currentStep / (totalSteps - 1)) * 100)

  const validateNominatorStep = () => {
    const newErrors: Record<string, string> = {}
    if (!nominator.name.trim()) newErrors.name = "Name is required"
    if (!nominator.matricNumber.trim()) {
      newErrors.matricNumber = "Matric number is required"
    } else if (!MATRIC_REGEX.test(nominator.matricNumber.trim())) {
      newErrors.matricNumber = "Format must be YYYY/NNNNN — e.g. 2024/12345"
    }
    if (!nominator.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nominator.email)) {
      newErrors.email = "Enter a valid email address"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateCategoryStep = (groupType: string) => {
    const newErrors: Record<string, string> = {}
    const groupNominations = nominations[groupType] || []
    groupNominations.forEach((nom, i) => {
      if (!nom.nomineeName.trim()) {
        newErrors[`${groupType}_${i}_name`] = "Nominee name is required"
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateNominatorStep()) return
    } else if (currentStep >= 1 && currentStep <= categoryGroups.length) {
      const group = categoryGroups[currentStep - 1]
      if (!validateCategoryStep(group.type)) return
    }
    setCurrentStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBack = () => {
    setErrors({})
    setCurrentStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const updateNomination = (groupType: string, index: number, value: string) => {
    setNominations((prev) => {
      const updated = [...(prev[groupType] || [])]
      updated[index] = { ...updated[index], nomineeName: value }
      return { ...prev, [groupType]: updated }
    })
    setErrors((prev) => {
      const next = { ...prev }
      delete next[`${groupType}_${index}_name`]
      return next
    })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const allNominations = Object.values(nominations).flat()
      const inserts = allNominations.map((nom) => ({
        award_category_id: nom.categoryId,
        nominee_name: nom.nomineeName,
        nominator_name: nominator.name,
        nominator_email: nominator.email,
        nominator_matric: nominator.matricNumber,
        nominator_phone: nominator.phone || null,
      }))

      const { error } = await supabase.from("award_nominations").insert(inserts)
      if (error) throw error
      setSubmitted(true)
    } catch (error) {
      console.error("Submission error:", error)
      toaster.create({
        title: "Submission failed",
        description: "Please try again.",
        type: "error",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── LOADING ───────────────────────────────────────────────────────────────────
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

  // ── SUCCESS ───────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Box minH="100vh" bg={COLORS.BG} display="flex" alignItems="center" justifyContent="center">
        <VStack gap={6} textAlign="center" px={6}>
          <Text fontSize="5xl">🏆</Text>
          <Heading
            fontFamily="'Cormorant Garamond', serif"
            color={COLORS.GOLD_BRIGHT}
            fontSize="3xl"
            letterSpacing="1px"
          >
            Nominations Submitted!
          </Heading>
          <Text color={COLORS.TEXT} maxW="480px" fontSize="md">
            Thank you, {nominator.name.split(" ")[0]}. Your nominations have been recorded across
            all {categoryGroups.length} categories.
          </Text>
        </VStack>
      </Box>
    )
  }

  const currentGroupLabel =
    currentStep === 0
      ? "Your Info"
      : currentStep <= categoryGroups.length
      ? `${categoryGroups[currentStep - 1].emoji} ${categoryGroups[currentStep - 1].name}`
      : "Review & Submit"

  // ── MAIN RENDER ───────────────────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg={COLORS.BG} pt={12} pb={20}>
      <Container maxW="680px">
        {/* Page Header */}
        <VStack gap={3} mb={10} textAlign="center">
          <Heading
            fontFamily="'Cormorant Garamond', serif"
            color={COLORS.GOLD_BRIGHT}
            fontSize="4xl"
            letterSpacing="2px"
          >
            BUSA AWARDS
          </Heading>
          <Text color={COLORS.TEXT_DIM} fontSize="sm" maxW="480px">
            Fill in your information once, then nominate peers across all award categories.
          </Text>
        </VStack>

        {/* Progress Bar */}
        <Box width="100%" mb={8}>
          <HStack justify="space-between" mb={2}>
            <Text color={COLORS.TEXT_DIM} fontSize="xs" textTransform="uppercase" letterSpacing="1px">
              {currentGroupLabel}
            </Text>
            <Text color={COLORS.TEXT_DIM} fontSize="xs">
              Step {currentStep + 1} of {totalSteps}
            </Text>
          </HStack>
          <Box width="100%" bg={COLORS.PANEL_MID} borderRadius="full" h="6px" overflow="hidden">
            <Box
              h="100%"
              bg={COLORS.GOLD_BRIGHT}
              borderRadius="full"
              width={`${progressPercent}%`}
              style={{ transition: "width 0.4s ease" }}
            />
          </Box>
          <HStack justify="space-between" mt={3}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <Box
                key={i}
                w="8px"
                h="8px"
                borderRadius="full"
                bg={i <= currentStep ? COLORS.GOLD_BRIGHT : COLORS.PANEL_MID}
                flexShrink={0}
                style={{ transition: "background 0.3s ease" }}
              />
            ))}
          </HStack>
        </Box>

        {/* Step Card */}
        <Box
          bg={COLORS.PANEL_DARK}
          borderWidth="1px"
          borderColor={COLORS.GOLD_DIM}
          borderRadius="xl"
          p={{ base: 5, md: 8 }}
          mb={6}
        >
          {/* ── STEP 0: NOMINATOR INFO ── */}
          {currentStep === 0 && (
            <VStack gap={6} align="stretch">
              <VStack align="start" gap={1}>
                <Heading
                  fontFamily="'Cormorant Garamond', serif"
                  color={COLORS.GOLD_BRIGHT}
                  fontSize="2xl"
                  letterSpacing="1px"
                >
                  Your Information
                </Heading>
                <Text color={COLORS.TEXT_DIM} fontSize="sm">
                  You'll only fill this in once. It will be attached to all your nominations.
                </Text>
              </VStack>

              <FormField label="Full Name *" error={errors.name}>
                <Input
                  placeholder="e.g. Amara Okafor"
                  value={nominator.name}
                  onChange={(e) => {
                    setNominator({ ...nominator, name: e.target.value })
                    setErrors((prev) => { const n = { ...prev }; delete n.name; return n })
                  }}
                  {...inputStyles}
                />
              </FormField>

              <FormField label="Matric Number *" hint="Format: 2024/12345" error={errors.matricNumber}>
                <Input
                  placeholder="2024/12345"
                  value={nominator.matricNumber}
                  onChange={(e) => {
                    setNominator({ ...nominator, matricNumber: e.target.value })
                    setErrors((prev) => { const n = { ...prev }; delete n.matricNumber; return n })
                  }}
                  {...inputStyles}
                />
              </FormField>

              <FormField label="Email Address *" error={errors.email}>
                <Input
                  placeholder="you@university.edu.ng"
                  type="email"
                  value={nominator.email}
                  onChange={(e) => {
                    setNominator({ ...nominator, email: e.target.value })
                    setErrors((prev) => { const n = { ...prev }; delete n.email; return n })
                  }}
                  {...inputStyles}
                />
              </FormField>

              <FormField label="Phone Number (optional)">
                <Input
                  placeholder="+234 800 000 0000"
                  type="tel"
                  value={nominator.phone}
                  onChange={(e) => setNominator({ ...nominator, phone: e.target.value })}
                  {...inputStyles}
                />
              </FormField>
            </VStack>
          )}

          {/* ── STEPS 1–N: CATEGORY NOMINATIONS ── */}
          {currentStep >= 1 && currentStep <= categoryGroups.length && (() => {
            const group = categoryGroups[currentStep - 1]
            const groupNominations = nominations[group.type] || []
            return (
              <VStack gap={6} align="stretch">
                <VStack align="start" gap={1}>
                  <HStack gap={3} align="center">
                    <Text fontSize="2xl">{group.emoji}</Text>
                    <Heading
                      fontFamily="'Cormorant Garamond', serif"
                      color={COLORS.GOLD_BRIGHT}
                      fontSize="2xl"
                      letterSpacing="1px"
                    >
                      {group.name}
                    </Heading>
                  </HStack>
                  <Text color={COLORS.TEXT_DIM} fontSize="sm">
                    Enter the name of your nominee for each award below.
                  </Text>
                </VStack>

                {groupNominations.map((nom, i) => (
                  <Box
                    key={nom.categoryId}
                    bg={COLORS.BG}
                    borderWidth="1px"
                    borderColor={COLORS.GOLD_DIM}
                    borderRadius="lg"
                    p={5}
                  >
                    <Text
                      color={COLORS.GOLD_BRIGHT}
                      fontWeight="600"
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="1px"
                      mb={3}
                    >
                      {nom.categoryName}
                    </Text>
                    <FormField
                      label="Nominee's Full Name *"
                      error={errors[`${group.type}_${i}_name`]}
                    >
                      <Input
                        placeholder="Who are you nominating?"
                        value={nom.nomineeName}
                        onChange={(e) => updateNomination(group.type, i, e.target.value)}
                        {...inputStyles}
                      />
                    </FormField>
                  </Box>
                ))}
              </VStack>
            )
          })()}

          {/* ── REVIEW STEP ── */}
          {currentStep === totalSteps - 1 && (
            <VStack gap={6} align="stretch">
              <VStack align="start" gap={1}>
                <Heading
                  fontFamily="'Cormorant Garamond', serif"
                  color={COLORS.GOLD_BRIGHT}
                  fontSize="2xl"
                  letterSpacing="1px"
                >
                  Review Your Nominations
                </Heading>
                <Text color={COLORS.TEXT_DIM} fontSize="sm">
                  Everything look good? Use Back to make changes before submitting.
                </Text>
              </VStack>

              {/* Nominator summary */}
              <Box
                bg={COLORS.BG}
                borderWidth="1px"
                borderColor={COLORS.GOLD_DIM}
                borderRadius="lg"
                p={5}
              >
                <Text
                  color={COLORS.GOLD_BASE}
                  fontWeight="600"
                  fontSize="xs"
                  textTransform="uppercase"
                  letterSpacing="1px"
                  mb={3}
                >
                  Your Details
                </Text>
                <VStack align="start" gap={1}>
                  <Text color={COLORS.TEXT} fontSize="sm">
                    <Text as="span" color={COLORS.TEXT_DIM}>Name: </Text>{nominator.name}
                  </Text>
                  <Text color={COLORS.TEXT} fontSize="sm">
                    <Text as="span" color={COLORS.TEXT_DIM}>Matric: </Text>{nominator.matricNumber}
                  </Text>
                  <Text color={COLORS.TEXT} fontSize="sm">
                    <Text as="span" color={COLORS.TEXT_DIM}>Email: </Text>{nominator.email}
                  </Text>
                  {nominator.phone && (
                    <Text color={COLORS.TEXT} fontSize="sm">
                      <Text as="span" color={COLORS.TEXT_DIM}>Phone: </Text>{nominator.phone}
                    </Text>
                  )}
                </VStack>
              </Box>

              {/* Nominations summary */}
              {categoryGroups.map((group) => {
                const groupNominations = nominations[group.type] || []
                return (
                  <Box
                    key={group.type}
                    bg={COLORS.BG}
                    borderWidth="1px"
                    borderColor={COLORS.GOLD_DIM}
                    borderRadius="lg"
                    p={5}
                  >
                    <HStack gap={2} mb={4}>
                      <Text>{group.emoji}</Text>
                      <Text
                        color={COLORS.GOLD_BASE}
                        fontWeight="600"
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="1px"
                      >
                        {group.name}
                      </Text>
                    </HStack>
                    <VStack gap={3} align="stretch">
                      {groupNominations.map((nom, i) => (
                        <HStack
                          key={nom.categoryId}
                          justify="space-between"
                          borderTop={i > 0 ? `1px solid ${COLORS.GOLD_DIM}` : undefined}
                          pt={i > 0 ? 3 : 0}
                        >
                          <Text color={COLORS.TEXT_DIM} fontSize="sm">{nom.categoryName}</Text>
                          <Text color={COLORS.TEXT} fontSize="sm" fontWeight="500">{nom.nomineeName}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Box>
                )
              })}
            </VStack>
          )}
        </Box>

        {/* Navigation */}
        <HStack justify="space-between" gap={4}>
          <Button
            variant="outline"
            borderColor={COLORS.GOLD_DIM}
            color={COLORS.GOLD_DIM}
            onClick={handleBack}
            visibility={currentStep === 0 ? "hidden" : "visible"}
            _hover={{ borderColor: COLORS.GOLD_BRIGHT, color: COLORS.GOLD_BRIGHT }}
          >
            ← Back
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              bg={COLORS.GOLD_BRIGHT}
              color={COLORS.BG}
              onClick={handleNext}
              _hover={{ opacity: 0.9 }}
              px={8}
            >
              Next →
            </Button>
          ) : (
            <Button
              bg={COLORS.GOLD_BRIGHT}
              color={COLORS.BG}
              loading={isSubmitting}
              onClick={handleSubmit}
              _hover={{ opacity: 0.9 }}
              px={8}
            >
              Submit All Nominations 🏆
            </Button>
          )}
        </HStack>
      </Container>
    </Box>
  )
}
