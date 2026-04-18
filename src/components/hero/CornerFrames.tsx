import { COLORS } from "@/config/constants"

function CornerFrame({ rotate }: { rotate: string }) {
  return (
    <svg
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: rotate }}
    >
      <defs>
        <linearGradient id={`corner-grad-${rotate}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.GOLD_BRIGHT} />
          <stop offset="100%" stopColor={COLORS.GOLD_DIM} />
        </linearGradient>
      </defs>
      {/* Outer L-shape */}
      <path
        d="M5 5 L5 100 L15 100 L15 15 L100 15 L100 5 Z"
        fill={`url(#corner-grad-${rotate})`}
        opacity="0.85"
      />
      {/* Inner decorative L */}
      <path
        d="M20 20 L20 90 L28 90 L28 28 L90 28 L90 20 Z"
        fill="none"
        stroke={COLORS.GOLD_BASE}
        strokeWidth="1.5"
        opacity="0.6"
      />
      {/* Corner ornament - lotus/fleur */}
      <circle cx="12" cy="12" r="7" fill={COLORS.GOLD_BRIGHT} opacity="0.9" />
      <circle cx="12" cy="12" r="4" fill={COLORS.GOLD_PALE} opacity="0.9" />
      {/* Dots along edges */}
      {[25, 40, 55, 70, 85].map((pos, i) => (
        <circle key={i} cx={pos} cy="10" r="2" fill={COLORS.GOLD_BASE} opacity="0.7" />
      ))}
      {[25, 40, 55, 70, 85].map((pos, i) => (
        <circle key={i} cx="10" cy={pos} r="2" fill={COLORS.GOLD_BASE} opacity="0.7" />
      ))}
      {/* Diamond at inner corner */}
      <polygon points="24,24 30,18 36,24 30,30" fill={COLORS.GOLD_BRIGHT} opacity="0.9" />
      {/* Scrollwork */}
      <path
        d="M15 35 Q22 30 18 20"
        fill="none"
        stroke={COLORS.GOLD_BASE}
        strokeWidth="1.5"
        opacity="0.6"
      />
      <path
        d="M35 15 Q30 22 20 18"
        fill="none"
        stroke={COLORS.GOLD_BASE}
        strokeWidth="1.5"
        opacity="0.6"
      />
    </svg>
  )
}

export function CornerFrames() {
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, zIndex: 5, pointerEvents: "none" }}>
        <CornerFrame rotate="rotate(0deg)" />
      </div>
      <div style={{ position: "absolute", top: 0, right: 0, zIndex: 5, pointerEvents: "none" }}>
        <CornerFrame rotate="rotate(90deg)" />
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, zIndex: 5, pointerEvents: "none" }}>
        <CornerFrame rotate="rotate(-90deg)" />
      </div>
      <div style={{ position: "absolute", bottom: 0, right: 0, zIndex: 5, pointerEvents: "none" }}>
        <CornerFrame rotate="rotate(180deg)" />
      </div>
    </>
  )
}
