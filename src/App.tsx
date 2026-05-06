import { Routes, Route } from "react-router-dom"
import { Box } from "@chakra-ui/react"
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "@/components/ui/toaster"
import { COLORS } from "@/config/constants"
import HomePage from "@/pages/Home"
import AdminPage from "@/pages/Admin"
import ManageTicketPage from "@/pages/ManageTicket"
import PaymentCallbackPage from "@/pages/PaymentCallback"
import AwardsPage from "@/pages/Awards"

function App() {
  return (
    <Box
      minH="100vh"
      style={{ backgroundColor: COLORS.BG }}
    >
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/awards" element={<AwardsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/manage/:manageToken" element={<ManageTicketPage />} />
        <Route path="/payment/callback" element={<PaymentCallbackPage />} />
      </Routes>
      <Analytics />
    </Box>
  )
}

export default App
