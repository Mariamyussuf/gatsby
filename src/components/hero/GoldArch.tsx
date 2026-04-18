import { COLORS } from "@/config/constants"

export function GoldArch() {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "900px",
        pointerEvents: "none",
        zIndex: 1,
      }}
    >
      <svg
        width="100%"
        viewBox="0 0 900 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="arch-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={COLORS.GOLD_DIM} stopOpacity="0.9" />
            <stop offset="50%" stopColor={COLORS.GOLD_BRIGHT} stopOpacity="1" />
            <stop offset="100%" stopColor={COLORS.GOLD_DIM} stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="arch-glow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={COLORS.GOLD_GLOW} stopOpacity="0.4" />
            <stop offset="100%" stopColor={COLORS.GOLD_GLOW} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background glow */}
        <ellipse cx="450" cy="300" rx="380" ry="280" fill="url(#arch-glow)" />

        {/* Main arch shape - outer */}
        <path
          d="M 60 700 L 60 300 Q 60 60 450 50 Q 840 60 840 300 L 840 700"
          fill="none"
          stroke="url(#arch-grad)"
          strokeWidth="4"
          opacity="0.8"
        />
        {/* Inner arch */}
        <path
          d="M 90 700 L 90 310 Q 90 95 450 85 Q 810 95 810 310 L 810 700"
          fill="none"
          stroke={COLORS.GOLD_DIM}
          strokeWidth="1.5"
          opacity="0.5"
        />

        {/* Keystone at top */}
        <path
          d="M 430 50 L 450 30 L 470 50 L 460 70 L 440 70 Z"
          fill={COLORS.GOLD_BRIGHT}
          opacity="0.9"
        />

        {/* Art deco column decorations */}
        {/* Left column */}
        <rect x="55" y="400" width="20" height="250" fill="url(#arch-grad)" opacity="0.3" />
        {[420, 460, 500, 540, 580].map((y, i) => (
          <rect key={i} x="50" y={y} width="30" height="6" fill={COLORS.GOLD_BASE} opacity="0.5" />
        ))}
        {/* Right column */}
        <rect x="825" y="400" width="20" height="250" fill="url(#arch-grad)" opacity="0.3" />
        {[420, 460, 500, 540, 580].map((y, i) => (
          <rect key={i} x="820" y={y} width="30" height="6" fill={COLORS.GOLD_BASE} opacity="0.5" />
        ))}

        {/* Fan/scallop detail at arch peak */}
        {[-40, -20, 0, 20, 40].map((x, i) => (
          <path
            key={i}
            d={`M ${450 + x} 95 Q ${450 + x} 75 ${450 + x + 10} 75`}
            fill="none"
            stroke={COLORS.GOLD_BASE}
            strokeWidth="1.5"
            opacity="0.5"
          />
        ))}

        {/* Dotted border on arch */}
        {Array.from({ length: 20 }).map((_, i) => {
          const t = i / 20
          const x = 60 + (t < 0.5
            ? 390 * Math.sin(Math.PI * t)
            : 390 * Math.sin(Math.PI * t))
          const y = 700 - t * 400
          return (
            <circle key={i} cx={x < 450 ? x : 900 - x + 60} cy={y} r="2" fill={COLORS.GOLD_BRIGHT} opacity="0.4" />
          )
        })}
      </svg>
    </div>
  )
}