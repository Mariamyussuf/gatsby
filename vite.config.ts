import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
  },
  define: {
    // Allow secrets stored without VITE_ prefix (standard Replit naming)
    "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
      process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ""
    ),
    "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(
      process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
    ),
    "import.meta.env.VITE_SQUAD_PUBLIC_KEY": JSON.stringify(
      process.env.SQUAD_PUBLIC_KEY || process.env.VITE_SQUAD_PUBLIC_KEY || ""
    ),
  },
})
