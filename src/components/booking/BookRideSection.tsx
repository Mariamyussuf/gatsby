import { Box, VStack, Heading, Text, Button } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"

export function BookRideSection() {
  const whatsappLink = "https://wa.me/message/GZ2SV7ZDLR37B1"

  return (
    <Box
      py={{ base: 6, md: 12 }}
      px={{ base: 4, md: 8 }}
      bg={COLORS.BG}
      borderTop={`1px solid ${COLORS.ACCENT}`}
      width="100%"
    >
      <VStack spacing={{ base: 4, md: 6 }} maxW="800px" mx="auto" textAlign="center" w="100%">
        <Heading
          as="h2"
          size={{ base: "md", md: "lg" }}
          color={COLORS.GOLD_BASE}
          fontFamily="'Georgia', serif"
          letterSpacing="2px"
        >
          BOOK A RIDE
        </Heading>

        <Text
          fontSize={{ base: "sm", md: "md" }}
          color={COLORS.GOLD_PALE}
          lineHeight="1.6"
          maxW="600px"
          px={{ base: 2, md: 0 }}
        >
          Need transportation to the gala? Get in touch with us via WhatsApp to arrange your pickup and ensure a seamless arrival.
        </Text>

        <Button
          as="a"
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          bg={COLORS.GOLD_BASE}
          color={COLORS.BG}
          px={{ base: 6, md: 8 }}
          py={{ base: 4, md: 6 }}
          fontSize={{ base: "sm", md: "md" }}
          fontWeight="600"
          width={{ base: "100%", sm: "auto" }}
          _hover={{
            bg: COLORS.GOLD_BRIGHT,
            transform: "scale(1.05)",
          }}
          transition="all 0.3s ease"
        >
          Message us on WhatsApp
        </Button>
      </VStack>
    </Box>
  )
}
