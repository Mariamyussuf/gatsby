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
    awards: [
      "Next Rated",
    ],
  },
]

const inputStyles = {
  bg: "transparent" as const,
  borderColor: "rgba(212,175,55,0.3)",
  color: "#F5F0E8",
  _placeholder: { color: "rgba(245,240,232,0.3)" },
  _focus: { borderColor: "#D4AF37", boxShadow: "0 0 0 1px #D4AF37" },
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
      <Text color="rgba(245,240,232,0.7)" fontSize="xs" fontWeight="500" mb={1} letterSpacing="0.5px">
        {label}
      </Text>
      {hint && <Text color="rgba(245,240,232,0.4)" fontSize="xs" mb={1}>{hint}</Text>}
      {children}
      {error && <Text color="#FF6B6B" fontSize="xs" mt={1}>{error}</Text>}
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
      bg="#080808"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      position="relative"
      overflow="hidden"
      px={6}
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
        bg="radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)"
        pointerEvents="none"
      />

      {/* Horizontal rule top */}
      <Box
        position="absolute"
        top="48px"
        left="10%"
        right="10%"
        h="1px"
        bg="linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 1.2s ease 0.2s",
        }}
      />

      <VStack
        gap={8}
        textAlign="center"
        maxW="560px"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 1s ease 0.4s, transform 1s ease 0.4s",
        }}
      >
        <VStack gap={2}>
          <Text
            color="rgba(212,175,55,0.6)"
            fontSize="xs"
            letterSpacing="6px"
            textTransform="uppercase"
          >
            Bells University Student Association
          </Text>
          <Heading
            fontFamily="'Cormorant Garamond', serif"
            color="#D4AF37"
            fontSize={{ base: "4xl", md: "6xl" }}
            letterSpacing="4px"
            fontWeight="300"
            lineHeight="1.1"
          >
            BUSA AWARDS
          </Heading>
          <Text
            color="rgba(212,175,55,0.5)"
            fontSize="xs"
            letterSpacing="4px"
            textTransform="uppercase"
            mt={1}
          >
            2024 / 2025
          </Text>
        </VStack>

        <Box
          w="1px"
          h="48px"
          bg="linear-gradient(180deg, transparent, rgba(212,175,55,0.5), transparent)"
          mx="auto"
        />

        <Text
          color="rgba(245,240,232,0.5)"
          fontSize="sm"
          lineHeight="1.9"
          maxW="420px"
        >
          Six categories. One night. The people who moved, created, led, and inspired —
          it's time to put their names forward.
        </Text>

        {/* Award categories preview */}
        <VStack gap={2} width="100%">
          {AWARD_GROUPS.map((group, i) => (
            <Box
              key={group.type}
              width="100%"
              py={2}
              px={4}
              borderLeft="1px solid rgba(212,175,55,0.2)"
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity 0.6s ease ${0.8 + i * 0.1}s`,
              }}
            >
              <HStack justify="space-between">
                <Text color="rgba(245,240,232,0.5)" fontSize="xs" letterSpacing="1px" textTransform="uppercase">
                  {group.name}
                </Text>
                {group.badge && (
                  <Text
                    color="#D4AF37"
                    fontSize="9px"
                    letterSpacing="1.5px"
                    textTransform="uppercase"
                    border="1px solid rgba(212,175,55,0.4)"
                    px={2}
                    py={0.5}
                    borderRadius="2px"
                  >
                    {group.badge}
                  </Text>
                )}
                <Text color="rgba(212,175,55,0.4)" fontSize="xs">{group.awards.length} award{group.awards.length !== 1 ? "s" : ""}</Text>
              </HStack>
            </Box>
          ))}
        </VStack>

        <Button
          onClick={onBegin}
          bg="transparent"
          color="#D4AF37"
          border="1px solid rgba(212,175,55,0.5)"
          borderRadius="2px"
          px={10}
          py={6}
          fontSize="xs"
          letterSpacing="4px"
          textTransform="uppercase"
          _hover={{
            bg: "rgba(212,175,55,0.08)",
            borderColor: "#D4AF37",
          }}
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease 1.6s",
          }}
        >
          Begin Nominations
        </Button>
      </VStack>

      {/* Horizontal rule bottom */}
      <Box
        position="absolute"
        bottom="48px"
        left="10%"
        right="10%"
        h="1px"
        bg="linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)"
        style={{
          opacity: visible ? 1 : 0,
          transition: "opacity 1.2s ease 0.2s",
        }}
      />
      <Text
        position="absolute"
        bottom="24px"
        color="rgba(212,175,55,0.25)"
        fontSize="8px"
        letterSpacing="4px"
        textTransform="uppercase"
      >
        BUILT TO COOK
      </Text>
    </Box>
  )
}

export default function AwardsPage() {
  const [hasBegun, setHasBegun] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // currentStep: 0 = nominator info, 1..N = category groups, N+1 = review
  const [currentStep, setCurrentStep] = useState(0)
  const totalSteps = 1 + AWARD_GROUPS.length + 1

  const [nominator, setNominator] = useState<NominatorInfo>({
    name: "",
    matricNumber: "",
    email: "",
    phone: "",
  })

  // nominations[groupType][i] = { categoryId, categoryName, nomineeName }
  // Since we don't load from Supabase dynamically for the form structure,
  // we use static award names as categoryId keys and sync with DB categories on submit
  const [nominations, setNominations] = useState<Record<string, Nomination[]>>(() => {
    const init: Record<string, Nomination[]> = {}
    AWARD_GROUPS.forEach((group) => {
      init[group.type] = group.awards.map((award) => ({
        categoryId: "", // will be resolved on submit via DB lookup
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
    // Load DB categories in background for submit-time ID resolution
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

  const handleNext = () => {
    if (currentStep === 0) {
      if (!validateNominatorStep()) return
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
        // Match by name to DB category id
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

  // ── SUCCESS ───────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <Box
        minH="100vh"
        bg="#080808"
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
          bg="radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)"
          pointerEvents="none"
        />
        <VStack gap={8} textAlign="center" maxW="500px" position="relative">
          <VStack gap={3}>
            <Text color="rgba(212,175,55,0.5)" fontSize="xs" letterSpacing="4px" textTransform="uppercase">
              Nominations Received
            </Text>
            <Heading
              fontFamily="'Cormorant Garamond', serif"
              color="#D4AF37"
              fontSize="4xl"
              letterSpacing="2px"
              fontWeight="300"
            >
              Thank You, {nominator.name.split(" ")[0]}.
            </Heading>
            <Text color="rgba(245,240,232,0.5)" fontSize="sm" lineHeight="1.9" maxW="400px">
              Your nominations have been recorded. The people you believe in
              are one step closer to being celebrated.
            </Text>
          </VStack>

          <Box
            w="100%"
            border="1px solid rgba(212,175,55,0.25)"
            borderRadius="4px"
            p={6}
          >
            <VStack gap={4}>
              <Text color="rgba(245,240,232,0.6)" fontSize="sm" lineHeight="1.9">
                Now get your tickets and be part of the night it all goes down.
                <br />
                <Text as="span" color="#D4AF37">Don't hear about it — be a part of it.</Text>
              </Text>
              <Link href="https://busagreatgatbsy.vercel.app/" target="_blank" _hover={{ textDecoration: "none" }} width="100%">
                <Button
                  width="100%"
                  bg="transparent"
                  color="#D4AF37"
                  border="1px solid rgba(212,175,55,0.5)"
                  borderRadius="2px"
                  fontSize="xs"
                  letterSpacing="4px"
                  textTransform="uppercase"
                  py={6}
                  _hover={{ bg: "rgba(212,175,55,0.08)", borderColor: "#D4AF37" }}
                >
                  Get Your Tickets
                </Button>
              </Link>
            </VStack>
          </Box>

          <Text color="rgba(212,175,55,0.2)" fontSize="8px" letterSpacing="4px" textTransform="uppercase">
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
    <Box minH="100vh" bg="#080808" pt={10} pb={4} display="flex" flexDirection="column">
      <Container maxW="680px" flex={1}>

        {/* Header */}
        <VStack gap={1} mb={8} textAlign="center">
          <Text color="rgba(212,175,55,0.5)" fontSize="9px" letterSpacing="5px" textTransform="uppercase">
            Bells University Student Association
          </Text>
          <Heading
            fontFamily="'Cormorant Garamond', serif"
            color="#D4AF37"
            fontSize="3xl"
            letterSpacing="4px"
            fontWeight="300"
          >
            BUSA AWARDS
          </Heading>
        </VStack>

        {/* Progress */}
        <Box mb={8}>
          <HStack justify="space-between" mb={2}>
            <Text color="rgba(212,175,55,0.5)" fontSize="9px" letterSpacing="2px" textTransform="uppercase">
              {currentGroupLabel}
            </Text>
            <Text color="rgba(212,175,55,0.4)" fontSize="9px" letterSpacing="1px">
              {currentStep + 1} / {totalSteps}
            </Text>
          </HStack>
          <Box w="100%" h="1px" bg="rgba(212,175,55,0.1)" position="relative">
            <Box
              position="absolute"
              top={0}
              left={0}
              h="1px"
              bg="#D4AF37"
              width={`${progressPercent}%`}
              style={{ transition: "width 0.5s ease" }}
            />
          </Box>
        </Box>

        {/* Card */}
        <Box
          border="1px solid rgba(212,175,55,0.2)"
          borderRadius="4px"
          p={{ base: 5, md: 8 }}
          mb={6}
          position="relative"
          bg="rgba(255,255,255,0.01)"
        >
          {/* Corner accents */}
          <Box position="absolute" top="-1px" left="-1px" w="16px" h="16px" borderTop="1px solid #D4AF37" borderLeft="1px solid #D4AF37" />
          <Box position="absolute" top="-1px" right="-1px" w="16px" h="16px" borderTop="1px solid #D4AF37" borderRight="1px solid #D4AF37" />
          <Box position="absolute" bottom="-1px" left="-1px" w="16px" h="16px" borderBottom="1px solid #D4AF37" borderLeft="1px solid #D4AF37" />
          <Box position="absolute" bottom="-1px" right="-1px" w="16px" h="16px" borderBottom="1px solid #D4AF37" borderRight="1px solid #D4AF37" />

          {/* ── STEP 0: NOMINATOR INFO ── */}
          {currentStep === 0 && (
            <VStack gap={6} align="stretch">
              <VStack align="start" gap={1}>
                <Heading
                  fontFamily="'Cormorant Garamond', serif"
                  color="#D4AF37"
                  fontSize="xl"
                  fontWeight="400"
                  letterSpacing="1px"
                >
                  Your Information
                </Heading>
                <Text color="rgba(245,240,232,0.35)" fontSize="xs">
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
                      color="#D4AF37"
                      fontSize="xl"
                      fontWeight="400"
                      letterSpacing="1px"
                    >
                      {group.name}
                    </Heading>
                    {group.badge && (
                      <Text
                        color="#D4AF37"
                        fontSize="8px"
                        letterSpacing="1.5px"
                        textTransform="uppercase"
                        border="1px solid rgba(212,175,55,0.4)"
                        px={2}
                        py={0.5}
                        borderRadius="2px"
                      >
                        {group.badge}
                      </Text>
                    )}
                  </HStack>
                  <Text color="rgba(245,240,232,0.35)" fontSize="xs">
                    Enter the nominee's name for each award below.
                  </Text>
                </VStack>

                {groupNominations.map((nom, i) => (
                  <Box
                    key={`${group.type}_${i}`}
                    borderLeft="1px solid rgba(212,175,55,0.2)"
                    pl={4}
                    py={1}
                  >
                    <Text
                      color="rgba(212,175,55,0.7)"
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
                  color="#D4AF37"
                  fontSize="xl"
                  fontWeight="400"
                  letterSpacing="1px"
                >
                  Review Your Nominations
                </Heading>
                <Text color="rgba(245,240,232,0.35)" fontSize="xs">
                  Use Back to make changes before submitting.
                </Text>
              </VStack>

              {/* Nominator */}
              <Box borderLeft="1px solid rgba(212,175,55,0.3)" pl={4} py={1}>
                <Text color="rgba(212,175,55,0.5)" fontSize="9px" letterSpacing="2px" textTransform="uppercase" mb={3}>
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
                      <Text color="rgba(245,240,232,0.35)" fontSize="xs" minW="48px">{label}</Text>
                      <Text color="rgba(245,240,232,0.8)" fontSize="xs">{value}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>

              {/* All nominations */}
              {AWARD_GROUPS.map((group) => (
                <Box key={group.type} borderLeft="1px solid rgba(212,175,55,0.2)" pl={4} py={1}>
                  <HStack gap={3} mb={3} align="center">
                    <Text color="rgba(212,175,55,0.5)" fontSize="9px" letterSpacing="2px" textTransform="uppercase">
                      {group.name}
                    </Text>
                    {group.badge && (
                      <Text
                        color="rgba(212,175,55,0.5)"
                        fontSize="8px"
                        letterSpacing="1px"
                        textTransform="uppercase"
                        border="1px solid rgba(212,175,55,0.2)"
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
                        <Text color="rgba(245,240,232,0.35)" fontSize="xs" flex={1} pr={4}>{nom.categoryName}</Text>
                        <Text color="rgba(245,240,232,0.8)" fontSize="xs" fontWeight="500" textAlign="right">{nom.nomineeName}</Text>
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
            color="rgba(212,175,55,0.4)"
            onClick={handleBack}
            visibility={currentStep === 0 ? "hidden" : "visible"}
            fontSize="xs"
            letterSpacing="2px"
            textTransform="uppercase"
            _hover={{ color: "#D4AF37", bg: "transparent" }}
            px={0}
          >
            ← Back
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              bg="transparent"
              color="#D4AF37"
              border="1px solid rgba(212,175,55,0.4)"
              borderRadius="2px"
              onClick={handleNext}
              fontSize="xs"
              letterSpacing="3px"
              textTransform="uppercase"
              px={8}
              py={5}
              _hover={{ bg: "rgba(212,175,55,0.08)", borderColor: "#D4AF37" }}
            >
              Continue
            </Button>
          ) : (
            <Button
              bg="rgba(212,175,55,0.12)"
              color="#D4AF37"
              border="1px solid rgba(212,175,55,0.5)"
              borderRadius="2px"
              loading={isSubmitting}
              onClick={handleSubmit}
              fontSize="xs"
              letterSpacing="3px"
              textTransform="uppercase"
              px={8}
              py={5}
              _hover={{ bg: "rgba(212,175,55,0.18)", borderColor: "#D4AF37" }}
            >
              Submit Nominations
            </Button>
          )}
        </HStack>
      </Container>

      {/* Footer */}
      <Box borderTop="1px solid rgba(212,175,55,0.1)" py={5} textAlign="center">
        <Text color="rgba(212,175,55,0.2)" fontSize="8px" letterSpacing="5px" textTransform="uppercase">
          BUILT TO COOK
        </Text>
      </Box>
    </Box>
  )
}
