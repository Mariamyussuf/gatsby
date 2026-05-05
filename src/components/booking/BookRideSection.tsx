import { Box, VStack, Heading, Text, Button } from "@chakra-ui/react"
import { COLORS } from "@/config/constants"

export function BookRideSection() {
  const whatsappLink = "https://wa.me/message/GZ2SV7ZDLR37B1"

  return (
    <Box
      py={{ base: 8, md: 12 }}
      px={{ base: 4, md: 8 }}
      bg={COLORS.BG}
      borderTop={`1px solid ${COLORS.ACCENT}`}
    >
      <VStack spacing={6} maxW="800px" mx="auto" textAlign="center">
        <Heading
          as="h2"
          size="lg"
          color={COLORS.GOLD}
          fontFamily="'Georgia', serif"
          letterSpacing="2px"
        >
          BOOK A RIDE
        </Heading>

        <Text
          fontSize="md"
          color={COLORS.TEXT}
          lineHeight="1.6"
          maxW="600px"
        >
          Need transportation to the gala? Get in touch with us via WhatsApp to arrange your pickup and ensure a seamless arrival.
        </Text>

        <Button
          as="a"
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          bg={COLORS.GOLD}
          color={COLORS.BG}
          px={8}
          py={6}
          fontSize="md"
          fontWeight="600"
          _hover={{
            opacity: 0.9,
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
