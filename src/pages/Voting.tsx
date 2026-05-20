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
} from "@chakra-ui/react"
import { COLORS } from "@/config/constants"
import { VOTING_GROUPS } from "@/config/votingData"
import { supabase } from "@/lib/supabase"
import { toaster } from "@/components/ui/toaster"

const MATRIC_REGEX = /^\d{4}\/\d{4,5}$/

/* ── helper: title-case ── */
function toTitleCase(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(?:^|[\s\-'])\S/g, (ch) => ch.toUpperCase())
}

/* ── Nominee selection card ── */
function NomineeCard({
  name,
  selected,
  index,
  onSelect,
}: {
  name: string
  selected: boolean
  index: number
  onSelect: () => void
}) {
  return (
    <Box
      as="button"
      type="button"
      onClick={onSelect}
      w="100%"
      textAlign="left"
      cursor="pointer"
      position="relative"
      border={`1px solid ${selected ? COLORS.GOLD_BASE : COLORS.GOLD_DIM + "25"}`}
      borderRadius="4px"
      bg={selected ? `${COLORS.GOLD_GLOW}12` : `${COLORS.PANEL_DARK}30`}
      px={{ base: 4, md: 5 }}
      py={{ base: 3, md: 4 }}
      display="flex"
      alignItems="center"
      gap={3}
      style={{
        transition: "all 0.25s ease",
        animationDelay: `${index * 50}ms`,
      }}
      _hover={{
        borderColor: selected ? COLORS.GOLD_BASE : COLORS.GOLD_DIM,
        bg: selected ? `${COLORS.GOLD_GLOW}18` : `${COLORS.PANEL_DARK}50`,
        transform: "translateX(4px)",
      }}
    >
      {/* Radio indicator */}
      <Box
        w="18px"
        h="18px"
        minW="18px"
        borderRadius="full"
        border={`2px solid ${selected ? COLORS.GOLD_BASE : COLORS.GOLD_DIM + "50"}`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        style={{ transition: "all 0.2s ease" }}
      >
        <Box
          w="8px"
          h="8px"
          borderRadius="full"
          bg={selected ? COLORS.GOLD_BASE : "transparent"}
          style={{ transition: "all 0.2s ease", transform: selected ? "scale(1)" : "scale(0)" }}
        />
      </Box>

      {/* Name */}
      <Text
        color={selected ? COLORS.GOLD_BRIGHT : COLORS.GOLD_DIM}
        fontSize={{ base: "sm", md: "md" }}
        fontWeight={selected ? "500" : "400"}
        letterSpacing="0.5px"
        style={{ transition: "color 0.2s ease" }}
      >
        {name}
      </Text>

      {/* Selection glow */}
      {selected && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          borderRadius="4px"
          pointerEvents="none"
          boxShadow={`0 0 20px ${COLORS.GOLD_GLOW}15, inset 0 0 20px ${COLORS.GOLD_GLOW}08`}
        />
      )}
    </Box>
  )
}

/* ── Form field wrapper ── */
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

const inputStyles = {
  bg: `${COLORS.PANEL_DARK}40` as const,
  borderColor: `${COLORS.GOLD_DIM}50`,
  color: COLORS.GOLD_BRIGHT,
  _placeholder: { color: `${COLORS.GOLD_DIM}60` },
  _focus: { borderColor: COLORS.GOLD_BASE, boxShadow: `0 0 0 1px ${COLORS.GOLD_BASE}` },
  borderRadius: "2px",
}

/* ── Corner accent decorator ── */
function CornerAccents() {
  return (
    <>
      <Box position="absolute" top="-1px" left="-1px" w="14px" h="14px" borderTop={`1px solid ${COLORS.GOLD_BASE}`} borderLeft={`1px solid ${COLORS.GOLD_BASE}`} />
      <Box position="absolute" top="-1px" right="-1px" w="14px" h="14px" borderTop={`1px solid ${COLORS.GOLD_BASE}`} borderRight={`1px solid ${COLORS.GOLD_BASE}`} />
      <Box position="absolute" bottom="-1px" left="-1px" w="14px" h="14px" borderBottom={`1px solid ${COLORS.GOLD_BASE}`} borderLeft={`1px solid ${COLORS.GOLD_BASE}`} />
      <Box position="absolute" bottom="-1px" right="-1px" w="14px" h="14px" borderBottom={`1px solid ${COLORS.GOLD_BASE}`} borderRight={`1px solid ${COLORS.GOLD_BASE}`} />
    </>
  )
}

/* ═════════════════════════════════════════════════════════════
   LANDING SCREEN
   ═════════════════════════════════════════════════════════════ */
function VotingLanding({ onBegin }: { onBegin: () => void }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  const totalNominees = VOTING_GROUPS.reduce(
    (sum, g) => sum + g.categories.reduce((s, c) => s + c.nominees.length, 0),
    0
  )

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
      {/* Background glow */}
      <Box
        position="absolute"
        top="50%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="700px"
        h="700px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${COLORS.GOLD_GLOW}12 0%, transparent 70%)`}
        pointerEvents="none"
      />

      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <Box
          key={i}
          position="absolute"
          w="2px"
          h="2px"
          borderRadius="full"
          bg={COLORS.GOLD_DIM}
          opacity={0.3}
          style={{
            top: `${15 + i * 14}%`,
            left: `${10 + (i * 17) % 80}%`,
            animation: `float-particle ${3 + i * 0.7}s ease-in-out infinite alternate`,
          }}
        />
      ))}

      <VStack
        gap={7}
        textAlign="center"
        w="100%"
        maxW="520px"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
          transition: "opacity 1s ease 0.3s, transform 1s ease 0.3s",
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
            THE GREAT GATSBY GALA — VOTING
          </Text>
        </VStack>

        {/* Hero message */}
        <Box
          w="100%"
          border={`1px solid ${COLORS.GOLD_BASE}40`}
          borderRadius="4px"
          px={6}
          py={7}
          bg={`${COLORS.GOLD_GLOW}06`}
          position="relative"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.8s ease 0.8s",
          }}
        >
          <CornerAccents />
          <VStack gap={4}>
            <Text
              color={COLORS.GOLD_DIM}
              fontSize="8px"
              letterSpacing="4px"
              textTransform="uppercase"
            >
              ✦ &nbsp; We Heard You &nbsp; ✦
            </Text>
            <Text
              fontFamily="'Cormorant Garamond', serif"
              color={COLORS.GOLD_BRIGHT}
              fontSize={{ base: "lg", md: "xl" }}
              letterSpacing="1px"
              fontWeight="300"
              lineHeight="1.6"
              textAlign="center"
            >
              Your nominations are in. You chose these people — but there can only be one winner.
            </Text>
            <Text
              fontFamily="'Cormorant Garamond', serif"
              color={COLORS.GOLD_BASE}
              fontSize={{ base: "xl", md: "2xl" }}
              letterSpacing="2px"
              fontWeight="500"
              fontStyle="italic"
            >
              Pick yours now.
            </Text>
          </VStack>
        </Box>

        {/* Category previews */}
        <VStack gap={1} width="100%">
          {VOTING_GROUPS.map((group, i) => (
            <Box
              key={group.type}
              width="100%"
              py={1.5}
              px={3}
              borderLeft={`1px solid ${COLORS.GOLD_DIM}30`}
              style={{
                opacity: visible ? 1 : 0,
                transition: `opacity 0.5s ease ${1.2 + i * 0.1}s`,
              }}
            >
              <HStack justify="space-between">
                <Text color={COLORS.GOLD_DIM} fontSize="10px" letterSpacing="1px" textTransform="uppercase">
                  {group.emoji} &nbsp; {group.name}
                </Text>
                <Text color={`${COLORS.GOLD_DIM}70`} fontSize="10px">
                  {group.categories.length} award{group.categories.length !== 1 ? "s" : ""}
                </Text>
              </HStack>
            </Box>
          ))}
        </VStack>

        {/* Stats */}
        <HStack
          gap={6}
          justify="center"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease 2s",
          }}
        >
          <VStack gap={0}>
            <Text fontFamily="'Cormorant Garamond', serif" color={COLORS.GOLD_BRIGHT} fontSize="2xl" fontWeight="300">
              {VOTING_GROUPS.reduce((s, g) => s + g.categories.length, 0)}
            </Text>
            <Text color={COLORS.GOLD_DIM} fontSize="7px" letterSpacing="2px" textTransform="uppercase">
              Categories
            </Text>
          </VStack>
          <Box w="1px" h="30px" bg={`${COLORS.GOLD_DIM}30`} />
          <VStack gap={0}>
            <Text fontFamily="'Cormorant Garamond', serif" color={COLORS.GOLD_BRIGHT} fontSize="2xl" fontWeight="300">
              {totalNominees}
            </Text>
            <Text color={COLORS.GOLD_DIM} fontSize="7px" letterSpacing="2px" textTransform="uppercase">
              Nominees
            </Text>
          </VStack>
          <Box w="1px" h="30px" bg={`${COLORS.GOLD_DIM}30`} />
          <VStack gap={0}>
            <Text fontFamily="'Cormorant Garamond', serif" color={COLORS.GOLD_BRIGHT} fontSize="2xl" fontWeight="300">
              1
            </Text>
            <Text color={COLORS.GOLD_DIM} fontSize="7px" letterSpacing="2px" textTransform="uppercase">
              Winner Each
            </Text>
          </VStack>
        </HStack>

        {/* CTA */}
        <Button
          onClick={onBegin}
          bg="transparent"
          color={COLORS.GOLD_BASE}
          border={`1px solid ${COLORS.GOLD_DIM}60`}
          borderRadius="2px"
          width="100%"
          maxW="320px"
          py={6}
          fontSize="xs"
          letterSpacing="4px"
          textTransform="uppercase"
          position="relative"
          overflow="hidden"
          _hover={{
            bg: `${COLORS.GOLD_GLOW}12`,
            borderColor: COLORS.GOLD_BASE,
            transform: "translateY(-1px)",
            boxShadow: `0 4px 20px ${COLORS.GOLD_GLOW}20`,
          }}
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 0.6s ease 2.2s, background 0.3s, border-color 0.3s, transform 0.3s, box-shadow 0.3s",
          }}
        >
          Cast Your Votes
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

      {/* Floating particle animation */}
      <style>{`
        @keyframes float-particle {
          from { transform: translateY(0) translateX(0); opacity: 0.2; }
          to { transform: translateY(-20px) translateX(10px); opacity: 0.5; }
        }
      `}</style>
    </Box>
  )
}

/* ═════════════════════════════════════════════════════════════
   MAIN VOTING PAGE
   ═════════════════════════════════════════════════════════════ */
export default function VotingPage() {
  const [hasBegun, setHasBegun] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isCheckingMatric, setIsCheckingMatric] = useState(false)
  const [alreadyVoted, setAlreadyVoted] = useState(false)

  // Steps: 0 = voter info, 1..N = group steps, N+1 = review
  const totalSteps = 1 + VOTING_GROUPS.length + 1
  const [currentStep, setCurrentStep] = useState(0)

  const [voter, setVoter] = useState({
    name: "",
    matricNumber: "",
    email: "",
  })

  // { "categoryName": "nomineeName" }
  const [votes, setVotes] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const progressPercent = Math.round((currentStep / (totalSteps - 1)) * 100)

  /* ── validation ── */
  const validateVoterStep = () => {
    const e: Record<string, string> = {}
    if (!voter.name.trim()) e.name = "Name is required"
    if (!voter.matricNumber.trim()) {
      e.matricNumber = "Matric number is required"
    } else if (!MATRIC_REGEX.test(voter.matricNumber.trim())) {
      e.matricNumber = "Format: YYYY/NNNN or YYYY/NNNNN — e.g. 2021/9879"
    }
    if (!voter.email.trim()) {
      e.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(voter.email)) {
      e.email = "Enter a valid email"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateGroupStep = (groupIndex: number) => {
    const group = VOTING_GROUPS[groupIndex]
    const e: Record<string, string> = {}
    group.categories.forEach((cat) => {
      if (!votes[cat.name]) {
        e[cat.name] = "Please select a nominee"
      }
    })
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ── navigation ── */
  const handleNext = async () => {
    if (currentStep === 0) {
      if (!validateVoterStep()) return
      setIsCheckingMatric(true)
      try {
        const { data, error } = await supabase
          .from("award_votes")
          .select("id")
          .eq("voter_matric", voter.matricNumber.trim())
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
    } else if (currentStep >= 1 && currentStep <= VOTING_GROUPS.length) {
      if (!validateGroupStep(currentStep - 1)) return
    }
    setCurrentStep((s) => s + 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleBack = () => {
    setErrors({})
    setCurrentStep((s) => s - 1)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  /* ── submit ── */
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      const inserts = Object.entries(votes).map(([categoryName, nomineeName]) => ({
        award_category_name: categoryName,
        nominee_name: nomineeName,
        voter_name: toTitleCase(voter.name),
        voter_matric: voter.matricNumber.trim(),
        voter_email: voter.email.trim().toLowerCase(),
      }))

      const { error } = await supabase.from("award_votes").insert(inserts)
      if (error) throw error

      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      console.error("Vote submission error:", error)
      toaster.create({
        title: "Vote submission failed",
        description: "Please try again. If the issue persists, contact the BUSA team.",
        type: "error",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ── LANDING ── */
  if (!hasBegun) return <VotingLanding onBegin={() => setHasBegun(true)} />

  /* ── ALREADY VOTED ── */
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
              Already Voted
            </Heading>
          </VStack>
          <Box w="100%" border={`1px solid ${COLORS.GOLD_DIM}25`} borderRadius="4px" p={6} position="relative">
            <CornerAccents />
            <VStack gap={3}>
              <Text color={`${COLORS.GOLD_DIM}80`} fontSize="sm" lineHeight="1.9">
                Matric number{" "}
                <Text as="span" color={COLORS.GOLD_BASE} fontWeight="500">{voter.matricNumber}</Text>{" "}
                has already cast their votes.
              </Text>
              <Text color={`${COLORS.GOLD_DIM}60`} fontSize="xs" lineHeight="1.8">
                Each student may only vote once. If you believe this is an error, please contact the BUSA team.
              </Text>
            </VStack>
          </Box>
          <Button
            onClick={() => { setAlreadyVoted(false); setVoter((p) => ({ ...p, matricNumber: "" })) }}
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

  /* ── SUBMITTED ── */
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

        {/* Celebration particles */}
        {[...Array(8)].map((_, i) => (
          <Box
            key={i}
            position="absolute"
            w="3px"
            h="3px"
            borderRadius="full"
            bg={COLORS.GOLD_BASE}
            style={{
              top: `${20 + (i * 9) % 60}%`,
              left: `${5 + (i * 13) % 90}%`,
              animation: `celebrate ${2 + i * 0.3}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}

        <VStack gap={8} textAlign="center" maxW="500px" position="relative">
          <VStack gap={3}>
            <Text color={COLORS.GOLD_DIM} fontSize="xs" letterSpacing="4px" textTransform="uppercase">
              Votes Recorded
            </Text>
            <Heading
              fontFamily="'Cormorant Garamond', serif"
              color={COLORS.GOLD_BRIGHT}
              fontSize="4xl"
              letterSpacing="2px"
              fontWeight="300"
            >
              Thank You, {voter.name.split(" ")[0]}.
            </Heading>
            <Text color={COLORS.GOLD_DIM} fontSize="sm" lineHeight="1.9" maxW="400px">
              Your votes have been recorded. The results will be announced at the Great Gatsby Gala.
              May the best ones win.
            </Text>
          </VStack>

          <Box w="100%" border={`1px solid ${COLORS.GOLD_DIM}30`} borderRadius="4px" p={6} position="relative">
            <CornerAccents />
            <VStack gap={4}>
              <Text color={COLORS.GOLD_DIM} fontSize="sm" lineHeight="1.9">
                Now get your tickets and be part of the night it all goes down.
                <br />
                <Text as="span" color={COLORS.GOLD_BASE}>Don't hear about it — be a part of it.</Text>
              </Text>
              <Box as="a" href="/" width="100%" _hover={{ textDecoration: "none" }}>
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
              </Box>
            </VStack>
          </Box>

          <Text color={`${COLORS.GOLD_GLOW}50`} fontSize="8px" letterSpacing="4px" textTransform="uppercase">
            BUILT TO COOK
          </Text>
        </VStack>

        <style>{`
          @keyframes celebrate {
            from { transform: translateY(0) scale(1); opacity: 0.3; }
            to { transform: translateY(-15px) scale(1.5); opacity: 0.7; }
          }
        `}</style>
      </Box>
    )
  }

  /* ── STEP LABELS ── */
  const currentGroupLabel =
    currentStep === 0
      ? "Your Information"
      : currentStep <= VOTING_GROUPS.length
      ? VOTING_GROUPS[currentStep - 1].name
      : "Review & Submit"

  /* ── MAIN FORM ── */
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
            VOTE NOW
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
          <CornerAccents />

          {/* ── STEP 0: VOTER INFO ── */}
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
                  Filled once — attached to all your votes.
                </Text>
              </VStack>

              <FormField label="Full Name / Nickname *" error={errors.name}>
                <Input placeholder="e.g. Amara Okafor" value={voter.name}
                  onChange={(e) => { setVoter({ ...voter, name: e.target.value }); setErrors((p) => { const n = { ...p }; delete n.name; return n }) }}
                  {...inputStyles} />
              </FormField>

              <FormField label="Matric Number *" hint="e.g. 2024/12345 or 2021/9879" error={errors.matricNumber}>
                <Input placeholder="2024/12345" value={voter.matricNumber}
                  onChange={(e) => { setVoter({ ...voter, matricNumber: e.target.value }); setErrors((p) => { const n = { ...p }; delete n.matricNumber; return n }) }}
                  {...inputStyles} />
              </FormField>

              <FormField label="Email Address *" error={errors.email}>
                <Input placeholder="you@bells.edu.ng" type="email" value={voter.email}
                  onChange={(e) => { setVoter({ ...voter, email: e.target.value }); setErrors((p) => { const n = { ...p }; delete n.email; return n }) }}
                  {...inputStyles} />
              </FormField>
            </VStack>
          )}

          {/* ── STEPS 1–N: CATEGORY GROUP VOTING ── */}
          {currentStep >= 1 && currentStep <= VOTING_GROUPS.length && (() => {
            const group = VOTING_GROUPS[currentStep - 1]
            return (
              <VStack gap={8} align="stretch">
                <VStack align="start" gap={2}>
                  <HStack gap={3} align="center">
                    <Heading
                      fontFamily="'Cormorant Garamond', serif"
                      color={COLORS.GOLD_BASE}
                      fontSize="xl"
                      fontWeight="400"
                      letterSpacing="1px"
                    >
                      {group.emoji} {group.name}
                    </Heading>
                  </HStack>
                  <Text color={`${COLORS.GOLD_DIM}70`} fontSize="xs">
                    Select one nominee for each category below.
                  </Text>
                </VStack>

                {group.categories.map((category) => (
                  <Box key={category.name}>
                    {/* Category header */}
                    <Box
                      borderLeft={`2px solid ${votes[category.name] ? COLORS.GOLD_BASE : COLORS.GOLD_DIM + "30"}`}
                      pl={4}
                      mb={3}
                      style={{ transition: "border-color 0.3s ease" }}
                    >
                      <Text
                        color={votes[category.name] ? COLORS.GOLD_BASE : COLORS.GOLD_DIM}
                        fontSize="xs"
                        textTransform="uppercase"
                        letterSpacing="1.5px"
                        fontWeight="500"
                      >
                        {category.name}
                      </Text>
                      {votes[category.name] && (
                        <Text color={`${COLORS.GOLD_DIM}60`} fontSize="10px" mt={0.5}>
                          ✓ Selected: {votes[category.name]}
                        </Text>
                      )}
                    </Box>

                    {/* Nominee cards */}
                    <VStack gap={2} align="stretch">
                      {category.nominees.map((nominee, ni) => (
                        <NomineeCard
                          key={nominee.name}
                          name={nominee.name}
                          index={ni}
                          selected={votes[category.name] === nominee.name}
                          onSelect={() => {
                            setVotes((prev) => ({ ...prev, [category.name]: nominee.name }))
                            setErrors((prev) => { const n = { ...prev }; delete n[category.name]; return n })
                          }}
                        />
                      ))}
                    </VStack>

                    {/* Error */}
                    {errors[category.name] && (
                      <Text color={COLORS.CRIMSON} fontSize="xs" mt={2} pl={4}>
                        {errors[category.name]}
                      </Text>
                    )}

                    {/* Divider between categories */}
                    <Box w="100%" h="1px" bg={`${COLORS.GOLD_DIM}15`} mt={6} />
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
                  Review Your Votes
                </Heading>
                <Text color={`${COLORS.GOLD_DIM}70`} fontSize="xs">
                  Use Back to make changes before submitting.
                </Text>
              </VStack>

              {/* Voter info */}
              <Box borderLeft={`1px solid ${COLORS.GOLD_DIM}40`} pl={4} py={1}>
                <Text color={COLORS.GOLD_DIM} fontSize="9px" letterSpacing="2px" textTransform="uppercase" mb={3}>
                  Your Details
                </Text>
                <VStack align="start" gap={1}>
                  {[
                    ["Name", voter.name],
                    ["Matric", voter.matricNumber],
                    ["Email", voter.email],
                  ].map(([label, value]) => (
                    <HStack key={label} gap={3}>
                      <Text color={`${COLORS.GOLD_DIM}70`} fontSize="xs" minW="48px">{label}</Text>
                      <Text color={COLORS.GOLD_BRIGHT} fontSize="xs">{value}</Text>
                    </HStack>
                  ))}
                </VStack>
              </Box>

              {/* All votes by group */}
              {VOTING_GROUPS.map((group) => (
                <Box key={group.type} borderLeft={`1px solid ${COLORS.GOLD_DIM}30`} pl={4} py={1}>
                  <Text color={COLORS.GOLD_DIM} fontSize="9px" letterSpacing="2px" textTransform="uppercase" mb={3}>
                    {group.emoji} {group.name}
                  </Text>
                  <VStack gap={2} align="stretch">
                    {group.categories.map((cat) => (
                      <HStack key={cat.name} justify="space-between" align="start">
                        <Text color={`${COLORS.GOLD_DIM}70`} fontSize="xs" flex={1} pr={4}>{cat.name}</Text>
                        <Text
                          color={votes[cat.name] ? COLORS.GOLD_BRIGHT : COLORS.CRIMSON}
                          fontSize="xs"
                          fontWeight="500"
                          textAlign="right"
                        >
                          {votes[cat.name] || "—"}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              ))}

              {/* Total count */}
              <Box
                w="100%"
                bg={`${COLORS.GOLD_GLOW}08`}
                border={`1px solid ${COLORS.GOLD_DIM}20`}
                borderRadius="4px"
                py={3}
                textAlign="center"
              >
                <Text color={COLORS.GOLD_DIM} fontSize="xs">
                  Total votes: <Text as="span" color={COLORS.GOLD_BASE} fontWeight="500">{Object.keys(votes).length}</Text>
                  {" / "}
                  {VOTING_GROUPS.reduce((s, g) => s + g.categories.length, 0)} categories
                </Text>
              </Box>
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
              Submit Votes
            </Button>
          )}
        </HStack>
      </Container>

      <Box borderTop={`1px solid ${COLORS.GOLD_DIM}20`} py={5} textAlign="center">
        <Text color={`${COLORS.GOLD_GLOW}50`} fontSize="8px" letterSpacing="5px" textTransform="uppercase">
          BUILT TO COOK
        </Text>
      </Box>
    </Box>
  )
}
