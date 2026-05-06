import { useEffect, useState, useRef } from "react"
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
  Link,
} from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { supabase } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"
import type { Database } from "@/lib/supabase"

type AwardCategory = Database["public"]["Tables"]["award_categories"]["Row"]

interface NominatorInfo {
  name: string
  matricNumber: string
  email: string
  phone: string
}

interface Nomination {
  categoryId: string
  categoryName: string
  nomineeName: string
  badge?: string
}

const MATRIC_REGEX = /^\d{4}\/\d{5}$/

// Static award definitions — used for landing display + form structure
const AWARD_GROUPS = [
  {
    type: "social",
    name: "Social Awards",
    awards: [
      "Most Influential Male",
      "Most Influential Female",
      "Most Popular Male",
      "Most Popular Female",
      "Most Fashionable Male",
      "Most Fashionable Female",
    ],
  },
  {
    type: "creative",
    name: "Creative Awards",
    awards: [
      "Photographer of the Year",
      "Graphics Designer of the Year",
      "Video Editor of the Year",
    ],
  },
  {
    type: "sports",
    name: "Sports Awards",
    awards: [
      "Male Footballer of the Year",
      "Female Footballer of the Year",
      "Male Basketballer of the Year",
      "Female Basketballer of the Year",
    ],
  },
  {
    type: "entertainment",
    name: "Entertainment Awards",
    awards: [
      "Artiste of the Year",
      "Dancer of the Year",
      "Male & Female Model of the Year",
      "Content Creator of the Year",
      "Music Producer of the Year",
      "DJ of the Year",
    ],
  },
  {
    type: "innovation",
    name: "Innovation Awards",
    awards: [
      "Entrepreneur of the Year",
      "Innovation of the Year",
      "Brand of the Year",
      "Academic Excellence Award",
    ],
  },
  {
    type: "management",
    name: "Management Awards",
    awards: [
      "Best Lecturer of the Year",
      "Staff Advisors Award",
      "Most Distinguished Executive (Male)",
      "Most Distinguished Executive (Female)",
    ],
  },
  {
    type: "next_rated",
    name: "Next Rated Award",
    badge: "Next Rated",
    awards: ["Next Rated"],
  },
]

const inputStyles = {
  bg: `${COLORS.PANEL_DARK}40` as const,
  borderColor: `${COLORS.GOLD_DIM}50`,
  color: COLORS.GOLD_BRIGHT,
  _placeholder: { color: `${COLORS.GOLD_DIM}60` },
  _focus: { borderColor: COLORS.GOLD_BASE, boxShadow: `0 0 0 1px ${COLORS.GOLD_BASE}` },
  borderRadius: "2px",
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
      <Text color={COLORS.GOLD_DIM} fontSize="xs" fontWeight="500" mb={1} letterSpacing="0.5px">
        {label}
      </Text>
      {hint && <Text color={`${COLORS.GOLD_DIM}80`} fontSize="xs" mb={1}>{hint}</Text>}
      {children}
      {error && <Text color={COLORS.CRIMSON} fontSize="xs" mt={1}>{error}</Text>}
    </Box>
  )
}

// Cinematic landing screen shown before form starts
function LandingScreen({ onBegin }: { onBegin: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <Box
      minH="100vh"
      bg={COLORS.BG}
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
      px={4}
      py={10}
    >
      {/* Ambient glow */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="600px"
        h="600px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${COLORS.GOLD_GLOW}15 0%, transparent 70%)`}
        pointerEvents="none"
      />

      <VStack
        gap={6}
        textAlign="center"
        w="100%"
        maxW="480px"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 1s ease 0.4s, transform 1s ease 0.4s",
        }}
      >
        <VStack gap={2}>
          <Text color={COLORS.GOLD_DIM} fontSize="9px" letterSpacing="4px" textTransform="uppercase">
            Bells University Student Association
          </Text>
          <Heading
            fontFamily="'Cormorant Garamond', serif"
            color={COLORS.GOLD_BRIGHT}
            fontSize={{ base: "4xl", md: "5xl" }}
            letterSpacing="4px"
            fontWeight="300"
            lineHeight="1.1"
          >
            BUSA AWARDS
          </Heading>
          <Text
            color={COLORS.GOLD_DIM}
            fontSize="9px"
            letterSpacing="3px"
            textTransform="uppercase"
            mt={1}
          >
            THE GREAT GATSBY GALA
          </Text>
        </VStack>

        <Text color={COLORS.GOLD_DIM} fontSize="sm" lineHeight="1.9" maxW="340px" px={2}>
          Six categories. One night. The people who moved, created, led, and inspired —
          it's time to put their names forward.
        </Text>

        {/* Award categories preview */}
        <VStack gap={1} width="100%">
          {AWARD_GROUPS.map((group, i) => (
            <Box
              key={group.type}
              width="100%"
              py={1.5}
              px={3}
              borderLeft={`1px solid ${COLORS.GOLD_DIM}30`}
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity 0.6s ease ${0.8 + i * 0.1}s`,
              }}
            >
              <HStack justify="space-between">
                <Text color={COLORS.GOLD_DIM} fontSize="10px" letterSpacing="1px" textTransform="uppercase">
                  {group.name}
                </Text>
                {group.badge && (
                  <Text
                    color={COLORS.GOLD_BASE}
                    fontSize="8px"
                    letterSpacing="1px"
                    textTransform="uppercase"
                    border={`1px solid ${COLORS.GOLD_DIM}50`}
                    px={1.5}
                    py={0.5}
                    borderRadius="2px"
                  >
                    {group.badge}
                  </Text>
                )}
                <Text color={`${COLORS.GOLD_DIM}70`} fontSize="10px">
                  {group.awards.length} award{group.awards.length !== 1 ? "s" : ""}
                </Text>
              </HStack>
            </Box>
          ))}
        </VStack>

        <Button
          onClick={onBegin}
          bg="transparent"
          color={COLORS.GOLD_BASE}
          border={`1px solid ${COLORS.GOLD_DIM}60`}
          borderRadius="2px"
          px={8}
          py={5}
          fontSize="xs"
          letterSpacing="3px"
          textTransform="uppercase"
          width="100%"
          _hover={{ bg: `${COLORS.GOLD_GLOW}10`, borderColor: COLORS.GOLD_BASE }}
          style={{ opacity: visible ? 1 : 0, transition: "opacity 0.6s ease 1.6s" }}
        >
          Begin Nominations
        </Button>

        <Text
          color={`${COLORS.GOLD_GLOW}50`}
          fontSize="8px"
          letterSpacing="4px"
          textTransform="uppercase"
        >
          BUILT TO COOK
        </Text>
      </VStack>
    </Box>
  )
}

export default function AwardsPage() {
  const [hasBegun, setHasBegun] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isCheckingMatric, setIsCheckingMatric] = useState(false)
  const [alreadyVoted, setAlreadyVoted] = useState(false)

  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = 1 + AWARD_GROUPS.length + 1

  const [nominator, setNominator] = useState<NominatorInfo>({
    name: "",
    matricNumber: "",
    email: "",
    phone: "",
  })

  const [nominations, setNominations] = useState<Record<string, Nomination[]>>(() => {
    const init: Record<string, Nomination[]> = {}
    AWARD_GROUPS.forEach((group) => {
      init[group.type] = group.awards.map((award) => ({
        categoryId: "",
        categoryName: award,
        nomineeName: "",
        badge: group.badge,
      }))
    })
    return init
  })

  const [dbCategories, setDbCategories] = useState<AwardCategory[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    supabase
      .from("award_categories")
      .select("*")
      .then(({ data }) => { if (data) setDbCategories(data) })
  }, [])

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
    ;(nominations[groupType] || []).forEach((nom, i) => {
      if (!nom.nomineeName.trim()) newErrors[`${groupType}_${i}`] = "Nominee name is required"
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    if (currentStep === 0) {
      if (!validateNominatorStep()) return
      // Check for duplicate matric before proceeding
      setIsCheckingMatric(true)
      try {
        const { data, error } = await supabase
          .from("award_nominations")
          .select("id")
          .eq("nominator_matric", nominator.matricNumber.trim())
          .limit(1)
        if (!error && data && data.length > 0) {
          setAlreadyVoted(true)
          setIsCheckingMatric(false)
          return
        }
      } catch {
        // If check fails, allow through — DB will catch dupes on submit
      }
      setIsCheckingMatric(false)
    } else if (currentStep >= 1 && currentStep <= AWARD_GROUPS.length) {
      if (!validateCategoryStep(AWARD_GROUPS[currentStep - 1].type)) return
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
      delete next[`${groupType}_${index}`]
      return next
    })
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      const allNominations = Object.values(nominations).flat()

      const inserts = allNominations.map((nom) => {
        const dbCat = dbCategories.find(
          (c) => c.name.toLowerCase().trim() === nom.categoryName.toLowerCase().trim()
        )
        return {
          award_category_id: dbCat?.id ?? null,
          award_category_name: nom.categoryName,
          nominee_name: nom.nomineeName,
          nominator_name: nominator.name,
          nominator_email: nominator.email,
          nominator_matric: nominator.matricNumber,
          nominator_phone: nominator.phone || null,
        }
      })

      const { error } = await supabase.from("award_nominations").insert(inserts)
      if (error) throw error
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
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

  // ── LANDING ───────────────────────────────────────────────────────────────────
  if (!hasBegun) return <LandingScreen onBegin={() => setHasBegun(true)} />

  // ── ALREADY VOTED ─────────────────────────────────────────────────────────────
  if (alreadyVoted) {
    return (
      <Box
        minH="100vh"
        bg={COLORS.BG}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        px={6}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="500px"
          h="500px"
          borderRadius="full"
          bg={`radial-gradient(circle, ${COLORS.GOLD_GLOW}10 0%, transparent 70%)`}
          pointerEvents="none"
        />
        <VStack gap={6} textAlign="center" maxW="440px" position="relative">
          <VStack gap={3}>
            <Text color={`${COLORS.GOLD_DIM}80`} fontSize="9px" letterSpacing="4px" textTransform="uppercase">
              Bells University Student Association
            </Text>
            <Heading
              fontFamily="'Cormorant Garamond', serif"
              color={COLORS.GOLD_BRIGHT}
              fontSize="3xl"
              letterSpacing="2px"
              fontWeight="300"
            >
              Already Nominated
            </Heading>
          </VStack>
          <Box w="100%" border={`1px solid ${COLORS.GOLD_DIM}25`} borderRadius="4px" p={6} position="relative">
            <Box position="absolute" top="-1px" left="-1px" w="12px" h="12px" borderTop={`1px solid ${COLORS.GOLD_BASE}`} borderLeft={`1px solid ${COLORS.GOLD_BASE}`} />
            <Box position="absolute" top="-1px" right="-1px" w="12px" h="12px" borderTop={`1px solid ${COLORS.GOLD_BASE}`} borderRight={`1px solid ${COLORS.GOLD_BASE}`} />
            <Box position="absolute" bottom="-1px" left="-1px" w="12px" h="12px" borderBottom={`1px solid ${COLORS.GOLD_BASE}`} borderLeft={`1px solid ${COLORS.GOLD_BASE}`} />
            <Box position="absolute" bottom="-1px" right="-1px" w="12px" h="12px" borderBottom={`1px solid ${COLORS.GOLD_BASE}`} borderRight={`1px solid ${COLORS.GOLD_BASE}`} />
            <VStack gap={3}>
              <Text color={`${COLORS.GOLD_DIM}80`} fontSize="sm" lineHeight="1.9">
                Matric number{" "}
                <Text as="span" color={COLORS.GOLD_BASE} fontWeight="500">{nominator.matricNumber}</Text>{" "}
                has already submitted nominations.
              </Text>
              <Text color={`${COLORS.GOLD_DIM}60`} fontSize="xs" lineHeight="1.8">
                Each student may only nominate once. If you believe this is an error, please contact the BUSA team.
              </Text>
            </VStack>
          </Box>
          <Button
            onClick={() => { setAlreadyVoted(false); setNominator((p) => ({ ...p, matricNumber: "" })) }}
            bg="transparent"
            color={COLORS.GOLD_BASE}
            border={`1px solid ${COLORS.GOLD_DIM}50`}
            borderRadius="2px"
            px={8}
            py={5}
            fontSize="xs"
            letterSpacing="3px"
            textTransform="uppercase"
            width="100%"
            _hover={{ bg: `${COLORS.GOLD_GLOW}10`, borderColor: COLORS.GOLD_BASE }}
          >
            Try a Different Matric
          </Button>
          <Text color={`${COLORS.GOLD_GLOW}40`} fontSize="8px" letterSpacing="4px" textTransform="uppercase">
            BUILT TO COOK
          </Text>
        </VStack>
      </Box>
    )
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Box
        minH="100vh"
        bg={COLORS.BG}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        px={6}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="500px"
          h="500px"
          borderRadius="full"
          bg={`radial-gradient(circle, ${COLORS.GOLD_GLOW}15 0%, transparent 70%)`}
          pointerEvents="none"
        />
        <VStack gap={8} textAlign="center" maxW="500px" position="relative">
          <VStack gap={3}>
            <Text color={COLORS.GOLD_DIM} fontSize="xs" letterSpacing="4px" textTransform="uppercase">
              Nominations Received
            </Text>
            <Heading
              fontFamily="'Cormorant Garamond', serif"
              color={COLORS.GOLD_BRIGHT}
              fontSize="4xl"
              letterSpacing="2px"
              fontWeight="300"
            >
              Thank You, {nominator.name.split(" ")[0]}.
            </Heading>
            <Text color={COLORS.GOLD_DIM} fontSize="sm" lineHeight="1.9" maxW="400px">
              Your nominations have been recorded. The people you believe in
              are one step closer to being celebrated.
            </Text>
          </VStack>

          <Box w="100%" border={`1px solid ${COLORS.GOLD_DIM}30`} borderRadius="4px" p={6}>
            <VStack gap={4}>
              <Text color={COLORS.GOLD_DIM} fontSize="sm" lineHeight="1.9">
                Now get your tickets and be part of the night it all goes down.
                <br />
                <Text as="span" color={COLORS.GOLD_BASE}>Don't hear about it — be a part of it.</Text>
              </Text>
              <Link href="https://busagreatgatbsy.vercel.app/" target="_blank" _hover={{ textDecoration: "none" }} width="100%">
                <Button
                  width="100%"
                  bg="transparent"
                  color={COLORS.GOLD_BASE}
                  border={`1px solid ${COLORS.GOLD_DIM}50`}
                  borderRadius="2px"
                  fontSize="xs"
                  letterSpacing="4px"
                  textTransform="uppercase"
                  py={6}
                  _hover={{ bg: `${COLORS.GOLD_GLOW}10`, borderColor: COLORS.GOLD_BASE }}
                >
                  Get Your Tickets
                </Button>
              </Link>
            </VStack>
          </Box>

          <Text color={`${COLORS.GOLD_GLOW}50`} fontSize="8px" letterSpacing="4px" textTransform="uppercase">
            BUILT TO COOK
          </Text>
        </VStack>
      </Box>
    )
  }

  const currentGroupLabel =
    currentStep === 0
      ? "Your Information"
      : currentStep <= AWARD_GROUPS.length
      ? AWARD_GROUPS[currentStep - 1].name
      : "Review & Submit"

  // ── FORM ──────────────────────────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg={COLORS.BG} pt={10} pb={4} display="flex" flexDirection="column">
      <Container maxW="680px" flex={1}>

        {/* Header */}
        <VStack gap={1} mb={8} textAlign="center">
          <Text color={COLORS.GOLD_DIM} fontSize="9px" letterSpacing="5px" textTransform="uppercase">
            Bells University Student Association
          </Text>
          <Heading
            fontFamily="'Cormorant Garamond', serif"
            color={COLORS.GOLD_BRIGHT}
            fontSize="3xl"
            letterSpacing="4px"
            fontWeight="300"
          >
            BUSA AWARDS
          </Heading>
          <Text color={COLORS.GOLD_DIM} fontSize="9px" letterSpacing="3px" textTransform="uppercase" mt={1}>
            THE GREAT GATSBY GALA
          </Text>
        </VStack>

        {/* Progress */}
        <Box mb={8}>
          <HStack justify="space-between" mb={2}>
            <Text color={COLORS.GOLD_DIM} fontSize="9px" letterSpacing="2px" textTransform="uppercase">
              {currentGroupLabel}
            </Text>
            <Text color={COLORS.GOLD_DIM} fontSize="9px" letterSpacing="1px">
              {currentStep + 1} / {totalSteps}
            </Text>
          </HStack>
          <Box w="100%" h="1px" bg={`${COLORS.GOLD_DIM}20`} position="relative">
            <Box
              position="absolute"
              top={0}
              left={0}
              h="1px"
              bg={COLORS.GOLD_BASE}
              width={`${progressPercent}%`}
              style={{ transition: "width 0.5s ease" }}
            />
          </Box>
        </Box>

        {/* Card */}
        <Box
          border={`1px solid ${COLORS.GOLD_DIM}30`}
          borderRadius="4px"
          p={{ base: 5, md: 8 }}
          mb={6}
          position="relative"
          bg={`${COLORS.PANEL}08`}
        >
          {/* Corner accents */}
          <Box position="absolute" top="-1px" left="-1px" w="16px" h="16px" borderTop={`1px solid ${COLORS.GOLD_BASE}`} borderLeft={`1px solid ${COLORS.GOLD_BASE}`} />
          <Box position="absolute" top="-1px" right="-1px" w="16px" h="16px" borderTop={`1px solid ${COLORS.GOLD_BASE}`} borderRight={`1px solid ${COLORS.GOLD_BASE}`} />
          <Box position="absolute" bottom="-1px" left="-1px" w="16px" h="16px" borderBottom={`1px solid ${COLORS.GOLD_BASE}`} borderLeft={`1px solid ${COLORS.GOLD_BASE}`} />
          <Box position="absolute" bottom="-1px" right="-1px" w="16px" h="16px" borderBottom={`1px solid ${COLORS.GOLD_BASE}`} borderRight={`1px solid ${COLORS.GOLD_BASE}`} />

          {/* ── STEP 0: NOMINATOR INFO ── */}
          {currentStep === 0 && (
            <VStack gap={6} align="stretch">
              <VStack align="start" gap={1}>
                <Heading
                  fontFamily="'Cormorant Garamond', serif"
                  color={COLORS.GOLD_BASE}
                  fontSize="xl"
                  fontWeight="400"
                  letterSpacing="1px"
                >
                  Your Information
                </Heading>
                <Text color={`${COLORS.GOLD_DIM}70`} fontSize="xs">
                  Filled once — attached to all your nominations.
                </Text>
              </VStack>

              <FormField label="Full Name *" error={errors.name}>
                <Input placeholder="e.g. Amara Okafor" value={nominator.name}
                  onChange={(e) => { setNominator({ ...nominator, name: e.target.value }); setErrors((p) => { const n = { ...p }; delete n.name; return n }) }}
                  {...inputStyles} />
              </FormField>

              <FormField label="Matric Number *" hint="Format: 2024/12345" error={errors.matricNumber}>
                <Input placeholder="2024/12345" value={nominator.matricNumber}
                  onChange={(e) => { setNominator({ ...nominator, matricNumber: e.target.value }); setErrors((p) => { const n = { ...p }; delete n.matricNumber; return n }) }}
                  {...inputStyles} />
              </FormField>

              <FormField label="Email Address *" error={errors.email}>
                <Input placeholder="you@bells.edu.ng" type="email" value={nominator.email}
                  onChange={(e) => { setNominator({ ...nominator, email: e.target.value }); setErrors((p) => { const n = { ...p }; delete n.email; return n }) }}
                  {...inputStyles} />
              </FormField>

              <FormField label="Phone Number (optional)">
                <Input placeholder="+234 800 000 0000" type="tel" value={nominator.phone}
                  onChange={(e) => setNominator({ ...nominator, phone: e.target.value })}
                  {...inputStyles} />
              </FormField>
            </VStack>
          )}

          {/* ── STEPS 1–N: CATEGORY NOMINATIONS ── */}
          {currentStep >= 1 && currentStep <= AWARD_GROUPS.length && (() => {
            const group = AWARD_GROUPS[currentStep - 1]
            const groupNominations = nominations[group.type] || []
            return (
              <VStack gap={6} align="stretch">
                <VStack align="start" gap={2}>
                  <HStack gap={3} align="center">
                    <Heading
                      fontFamily="'Cormorant Garamond', serif"
                      color={COLORS.GOLD_BASE}
                      fontSize="xl"
                      fontWeight="400"
                      letterSpacing="1px"
                    >
                      {group.name}
                    </Heading>
                    {group.badge && (
                      <Text
                        color={COLORS.GOLD_BASE}
                        fontSize="8px"
                        letterSpacing="1.5px"
                        textTransform="uppercase"
                        border={`1px solid ${COLORS.GOLD_DIM}50`}
                        px={2}
                        py={0.5}
                        borderRadius="2px"
                      >
                        {group.badge}
                      </Text>
                    )}
                  </HStack>
                  <Text color={`${COLORS.GOLD_DIM}70`} fontSize="xs">
                    Enter the nominee's name for each award below.
                  </Text>
                </VStack>

                {groupNominations.map((nom, i) => (
                  <Box
                    key={`${group.type}_${i}`}
                    borderLeft={`1px solid ${COLORS.GOLD_DIM}30`}
                    pl={4}
                    py={1}
                  >
                    <Text
                      color={COLORS.GOLD_DIM}
                      fontSize="xs"
                      textTransform="uppercase"
                      letterSpacing="1px"
                      mb={2}
                    >
                      {nom.categoryName}
                    </Text>
                    <FormField label="Nominee's Full Name *" error={errors[`${group.type}_${i}`]}>
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
                  color={COLORS.GOLD_BASE}
                  fontSize="xl"
                  fontWeight="400"
                  letterSpacing="1px"
                >
                  Review Your Nominations
                </Heading>
                <Text color={`${COLORS.GOLD_DIM}70`} fontSize="xs">
                  Use Back to make changes before submitting.
                </Text>
              </VStack>

              {/* Nominator */}
              <Box borderLeft={`1px solid ${COLORS.GOLD_DIM}40`} pl={4} py={1}>
                <Text color={COLORS.GOLD_DIM} fontSize="9px" letterSpacing="2px" textTransform="uppercase" mb={3}>
                  Your Details
                </Text>
                <VStack align="start" gap={1}>
                  {[
                    ["Name", nominator.name],
                    ["Matric", nominator.matricNumber],
                    ["Email", nominator.email],
                    ...(nominator.phone ? [["Phone", nominator.phone]] : []),
                  ].map(([label, value]) => (
                    <HStack key={label} gap={3}>
                      <Text color={`${COLORS.GOLD_DIM}70`} fontSize="xs" minW="48px">{label}</Text>
                      <Text color={COLORS.GOLD_BRIGHT} fontSize="xs">{value}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>

              {/* All nominations */}
              {AWARD_GROUPS.map((group) => (
                <Box key={group.type} borderLeft={`1px solid ${COLORS.GOLD_DIM}30`} pl={4} py={1}>
                  <HStack gap={3} mb={3} align="center">
                    <Text color={COLORS.GOLD_DIM} fontSize="9px" letterSpacing="2px" textTransform="uppercase">
                      {group.name}
                    </Text>
                    {group.badge && (
                      <Text
                        color={COLORS.GOLD_DIM}
                        fontSize="8px"
                        letterSpacing="1px"
                        textTransform="uppercase"
                        border={`1px solid ${COLORS.GOLD_DIM}30`}
                        px={1.5}
                        borderRadius="2px"
                      >
                        {group.badge}
                      </Text>
                    )}
                  </HStack>
                  <VStack gap={2} align="stretch">
                    {(nominations[group.type] || []).map((nom, i) => (
                      <HStack key={i} justify="space-between" align="start">
                        <Text color={`${COLORS.GOLD_DIM}70`} fontSize="xs" flex={1} pr={4}>{nom.categoryName}</Text>
                        <Text color={COLORS.GOLD_BRIGHT} fontSize="xs" fontWeight="500" textAlign="right">{nom.nomineeName}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        {/* Navigation */}
        <HStack justify="space-between" gap={4} mb={12}>
          <Button
            variant="ghost"
            color={COLORS.GOLD_DIM}
            onClick={handleBack}
            visibility={currentStep === 0 ? "hidden" : "visible"}
            fontSize="xs"
            letterSpacing="2px"
            textTransform="uppercase"
            _hover={{ color: COLORS.GOLD_BASE, bg: "transparent" }}
            px={0}
          >
            ← Back
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              bg="transparent"
              color={COLORS.GOLD_BASE}
              border={`1px solid ${COLORS.GOLD_DIM}50`}
              borderRadius="2px"
              onClick={handleNext}
              loading={isCheckingMatric}
              fontSize="xs"
              letterSpacing="3px"
              textTransform="uppercase"
              px={8}
              py={5}
              _hover={{ bg: `${COLORS.GOLD_GLOW}10`, borderColor: COLORS.GOLD_BASE }}
            >
              Continue
            </Button>
          ) : (
            <Button
              bg={`${COLORS.GOLD_GLOW}15`}
              color={COLORS.GOLD_BASE}
              border={`1px solid ${COLORS.GOLD_DIM}60`}
              borderRadius="2px"
              loading={isSubmitting}
              onClick={handleSubmit}
              fontSize="xs"
              letterSpacing="3px"
              textTransform="uppercase"
              px={8}
              py={5}
              _hover={{ bg: `${COLORS.GOLD_GLOW}25`, borderColor: COLORS.GOLD_BASE }}
            >
              Submit Nominations
            </Button>
          )}
        </HStack>
      </Container>

      {/* Footer */}
      <Box borderTop={`1px solid ${COLORS.GOLD_DIM}20`} py={5} textAlign="center">
        <Text color={`${COLORS.GOLD_GLOW}50`} fontSize="8px" letterSpacing="5px" textTransform="uppercase">
          BUILT TO COOK
        </Text>
      </Box>
    </Box>
  )
}
