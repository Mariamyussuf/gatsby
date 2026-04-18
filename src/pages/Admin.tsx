import { useState, useEffect } from "react"
import { AdminLogin } from "@/components/admin/AdminLogin"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("gatsby_admin") === "1") {
      setAuthed(true)
    }
  }, [])

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />
  }

  return <AdminDashboard />
}
