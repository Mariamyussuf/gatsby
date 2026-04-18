import { useState } from "react"
import { Box } from "@chakra-ui/react"
import { HeroSection } from "@/components/hero/HeroSection"
import { TicketTiers } from "@/components/tickets/TicketTiers"
import { BookingForm } from "@/components/booking/BookingForm"
import { Footer } from "@/components/layout/Footer"
import { COLORS } from "@/config/constants"
import type { TicketTier, GalaTable } from "@/lib/supabase"

export default function HomePage() {
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
  const [selectedTable, setSelectedTable] = useState<GalaTable | null>(null)
  const [tableFilledMessage, setTableFilledMessage] = useState<string | null>(null)

  const handleSelect = (tier: TicketTier, table: GalaTable) => {
    setSelectedTier(tier)
    setSelectedTable(table)
    setTableFilledMessage(null)
  }

  const handleTableFilled = () => {
    setSelectedTable(null)
    setTableFilledMessage("That table just filled up — please choose another.")
    document.getElementById("tickets")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <Box style={{ backgroundColor: COLORS.BG, minHeight: "100vh" }}>
      <HeroSection />
      <TicketTiers onSelect={handleSelect} />
      {selectedTier && selectedTable && (
        <BookingForm
          tier={selectedTier}
          table={selectedTable}
          onTableFilled={handleTableFilled}
        />
      )}
      <Footer />
    </Box>
  )
}
