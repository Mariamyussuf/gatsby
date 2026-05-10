import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

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
    "__SUPABASE_URL__": JSON.stringify(process.env.SUPABASE_URL || ""),
    "__SUPABASE_ANON_KEY__": JSON.stringify(process.env.SUPABASE_ANON_KEY || ""),
    "__SQUAD_PUBLIC_KEY__": JSON.stringify(process.env.SQUAD_PUBLIC_KEY || ""),
  },
  build: {
    minify: false,
    terserOptions: undefined,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  esbuild: {
    minify: false,
    minifyIdentifiers: false,
    minifySyntax: false,
    minifyWhitespace: false,
  },
})
