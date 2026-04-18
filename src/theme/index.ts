import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  globalCss: {
    "html, body": {
      backgroundColor: "#1A0305",
      color: "#E8B84B",
      fontFamily: "'Josefin Sans', sans-serif",
    },
    "h1, h2, h3": {
      fontFamily: "'Cormorant Garamond', serif",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Cormorant Garamond', Georgia, serif" },
        body: { value: "'Josefin Sans', system-ui, sans-serif" },
        display: { value: "'Cormorant Garamond', Georgia, serif" },
        script: { value: "'Playfair Display', Georgia, serif" },
      },
      colors: {
        burgundy: {
          deep: { value: "#1A0305" },
          rich: { value: "#6B0F1A" },
          mid: { value: "#3D0810" },
          light: { value: "#8B1A28" },
        },
        gold: {
          glow: { value: "#8B6914" },
          dim: { value: "#C9962A" },
          base: { value: "#E8B84B" },
          bright: { value: "#F5D875" },
          pale: { value: "#FBE9A0" },
        },
        crimson: {
          accent: { value: "#C0272D" },
          deep: { value: "#8B0000" },
        },
      },
    },
    semanticTokens: {
      colors: {
        "gatsby-bg": { value: "{colors.burgundy.deep}" },
        "gatsby-panel": { value: "{colors.burgundy.rich}" },
        "gatsby-gold": { value: "{colors.gold.base}" },
        "gatsby-gold-bright": { value: "{colors.gold.bright}" },
        "gatsby-gold-dim": { value: "{colors.gold.dim}" },
        "gatsby-crimson": { value: "{colors.crimson.accent}" },
        "gatsby-fg": { value: "{colors.gold.pale}" },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
