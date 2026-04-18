import { Routes, Route } from "react-router-dom"
import { Box } from "@chakra-ui/react"
import { Toaster } from "@/components/ui/toaster"
import { COLORS } from "@/config/constants"
import HomePage from "@/pages/Home"
import AdminPage from "@/pages/Admin"
import ManageTicketPage from "@/pages/ManageTicket"

function App() {
  return (
    <Box
      minH="100vh"
      style={{ backgroundColor: COLORS.BG }}
    >
      <Toaster />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/manage/:manageToken" element={<ManageTicketPage />} />
      </Routes>
    </Box>
  )
}

export default App
