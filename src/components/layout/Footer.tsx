import { Box, Text, VStack, HStack, Accordion } from "@chakra-ui/react"
import { COLORS, EVENT_SUBTITLE, EVENT_VENUE, CONTACT_EMAIL } from "@/config/constants"

const faqs = [
  {
    q: "What is the dress code?",
    a: "An elegant affair. Guests are invited to dress their finest and arrive prepared for a red carpet evening. Gentlemen in formal or traditional attire, and ladies in floor-length gowns or sophisticated evening wear.",
  },
  {
    q: "Is parking available at Marquee Hall?",
    a: "NO, Car Rides are available to be booked from your hostel to the Dinner. We recommend arriving early. VVIP guests will receive complimentary valet parking as part of their experience.",
  },
  {
    q: "What time does the evening begin?",
    a: "Doors open at 4:00PM for drinks and mingling. The formal programme begins at 4:00 PM sharp. Guests are encouraged to be seated by 3:55 PM.",
  },
  {
    q: "What should I expect on the evening?",
    a: "An unforgettable experience: a Gatsby-themed grand entrance, gourmet dinner, the BUSA Awards ceremony, live entertainment, and dancing. Every detail has been curated for opulence.The Dinner starts by 4PM and ends 7PM with an After Party at Marquee by 8PM curated specially to give you the best time",
  },
  {
    q: "How do I get my QR entry code?",
    a: "Your unique QR entry code will be emailed to you 3 days before the Gala. Each code is single-use and personal. Do not share it — it is your key to the evening.",
  },
  {
    q: "Can I transfer my ticket to someone else?",
    a: "Yes. Each ticket comes with a secure manage link. You may update the name on your ticket up to 24 hours before the event. After that, ticket transfers are locked.",
  },
]

export function Footer() {
  return (
    <Box
      as="footer"
      id="footer"
      pt="20"
      pb="10"
      px={{ base: "4", md: "8" }}
      style={{
        background: `linear-gradient(180deg, ${COLORS.BG} 0%, ${COLORS.PANEL_MID}80 50%, ${COLORS.PANEL} 100%)`,
        borderTop: `1px solid ${COLORS.GOLD_DIM}30`,
      }}
    >
      {/* FAQ Section */}
      <Box maxW="800px" mx="auto" mb="20">
        <VStack gap="2" mb="10" textAlign="center">
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.35em",
              color: COLORS.GOLD_DIM,
              textTransform: "uppercase",
            }}
          >
            ✦ Questions & Answers ✦
          </Text>
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.5rem",
              fontWeight: "700",
              color: COLORS.GOLD_BRIGHT,
            }}
          >
            Frequently Asked
          </Text>
        </VStack>

        <Accordion.Root>
          {faqs.map((faq, i) => (
            <Accordion.Item
              key={i}
              value={`faq-${i}`}
              style={{ borderBottom: `1px solid ${COLORS.GOLD_DIM}30` }}
            >
              <Accordion.ItemTrigger
                py="5"
                px="4"
                style={{ cursor: "pointer" }}
                _hover={{ background: `${COLORS.GOLD_GLOW}08` }}
              >
                <Text
                  flex="1"
                  textAlign="start"
                  style={{
                    fontFamily: "'Josefin Sans', sans-serif",
                    fontSize: "0.8rem",
                    fontWeight: "400",
                    letterSpacing: "0.1em",
                    color: COLORS.GOLD_BASE,
                  }}
                >
                  {faq.q}
                </Text>
                <Accordion.ItemIndicator
                  style={{ color: COLORS.GOLD_DIM }}
                />
              </Accordion.ItemTrigger>
              <Accordion.ItemContent>
                <Accordion.ItemBody px="4" pb="5">
                  <Text
                    style={{
                      fontFamily: "'Josefin Sans', sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: "300",
                      letterSpacing: "0.05em",
                      color: COLORS.GOLD_DIM,
                      lineHeight: "1.8",
                    }}
                  >
                    {faq.a}
                  </Text>
                </Accordion.ItemBody>
              </Accordion.ItemContent>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Box>

      {/* Bottom footer */}
      <Box
        maxW="1100px"
        mx="auto"
        pt="10"
        style={{ borderTop: `1px solid ${COLORS.GOLD_DIM}20` }}
      >
        <VStack gap="4" textAlign="center">
          {/* BUSA logo text */}
          <Text
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2rem",
              fontWeight: "700",
              letterSpacing: "0.5em",
              color: COLORS.GOLD_BRIGHT,
              textShadow: `0 0 20px ${COLORS.GOLD_GLOW}60`,
            }}
          >
            BUSA
          </Text>

          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.6rem",
              letterSpacing: "0.3em",
              color: COLORS.GOLD_DIM,
              textTransform: "uppercase",
            }}
          >
            {EVENT_SUBTITLE}
          </Text>

          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.55rem",
              letterSpacing: "0.2em",
              color: COLORS.GOLD_DIM,
              textTransform: "uppercase",
              opacity: 0.7,
            }}
          >
            {EVENT_VENUE} · Saturday, 23rd May 2026
          </Text>

          {/* Divider */}
          <Box w="60px">
            <div style={{ height: "1px", background: `linear-gradient(90deg, transparent, ${COLORS.GOLD_DIM}60, transparent)` }} />
          </Box>

          {/* Contact */}
          <HStack gap="2">
            <Text
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                color: COLORS.GOLD_DIM,
                opacity: 0.7,
              }}
            >
              Enquiries:
            </Text>
            <Text
              as="a"
              href={`mailto:${CONTACT_EMAIL}`}
              style={{
                fontFamily: "'Josefin Sans', sans-serif",
                fontSize: "0.6rem",
                letterSpacing: "0.1em",
                color: COLORS.GOLD_BASE,
                textDecoration: "none",
              }}
            >
              {CONTACT_EMAIL}
            </Text>
          </HStack>

          {/* Copyright */}
          <Text
            style={{
              fontFamily: "'Josefin Sans', sans-serif",
              fontSize: "0.5rem",
              letterSpacing: "0.15em",
              color: COLORS.GOLD_DIM,
              opacity: 0.4,
              textTransform: "uppercase",
            }}
          >
            © 2026 Bells University Student Association · Built to cook
          </Text>
        </VStack>
      </Box>
    </Box>
  )
}
