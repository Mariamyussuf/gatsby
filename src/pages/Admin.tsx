import { useState, useEffect } from "react"
import { AdminLogin, type AdminRole } from "@/components/admin/AdminLogin"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

export default function AdminPage() {
  const [role, setRole] = useState<AdminRole | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem("gatsby_admin")
    if (stored === "admin") setRole("admin")
    else if (stored === "exco") setRole("exco")
    // legacy: treat old "1" value as full admin
    else if (stored === "1") setRole("admin")
  }, [])

  if (!role) {
    return (
      <AdminLogin
        onLogin={(r) => {
          setRole(r)
        }}
      />
    )
  }

  return <AdminDashboard role={role} />
}
