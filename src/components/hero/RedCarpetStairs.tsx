import { COLORS } from "@/config/constants"

export function RedCarpetStairs() {
  const stairW = 700
  const stairH = 200
  const steps = 8
  const stepH = stairH / steps

  return (
    <div style={{ width: "100%", maxWidth: "700px", margin: "0 auto" }}>
      <svg
        width="100%"
        viewBox={`0 0 ${stairW} ${stairH}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="carpet-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS.CRIMSON} stopOpacity="0.9" />
            <stop offset="100%" stopColor={COLORS.CRIMSON_DEEP} stopOpacity="1" />
          </linearGradient>
          <linearGradient id="carpet-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#FF6B6B" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id="gold-edge" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.GOLD_DIM} />
            <stop offset="50%" stopColor={COLORS.GOLD_BRIGHT} />
            <stop offset="100%" stopColor={COLORS.GOLD_DIM} />
          </linearGradient>
          <linearGradient id="stone-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D1015" />
            <stop offset="100%" stopColor="#1A0305" />
          </linearGradient>
        </defs>

        {/* Steps from bottom to top, widening */}
        {Array.from({ length: steps }).map((_, i) => {
          const step = steps - 1 - i
          const margin = (step * 30)
          const y = i * stepH
          const x = margin
          const w = stairW - margin * 2
          return (
            <g key={i}>
              {/* Stone riser */}
              <rect x={x} y={y} width={w} height={stepH} fill="url(#stone-grad)" />
              {/* Red carpet face */}
              <rect x={x + 10} y={y + 2} width={w - 20} height={stepH - 4} fill="url(#carpet-grad)" />
              {/* Carpet highlight */}
              <rect x={x + 10} y={y + 2} width={w - 20} height={stepH - 4} fill="url(#carpet-highlight)" />
              {/* Gold edge trim */}
              <rect x={x + 10} y={y + 2} width={w - 20} height="2.5" fill="url(#gold-edge)" opacity="0.8" />
              <rect x={x + 10} y={y + stepH - 4} width={w - 20} height="2" fill="url(#gold-edge)" opacity="0.5" />
              {/* Side risers */}
              <rect x={x} y={y} width="10" height={stepH} fill={COLORS.GOLD_DIM} opacity="0.3" />
              <rect x={x + w - 10} y={y} width="10" height={stepH} fill={COLORS.GOLD_DIM} opacity="0.3" />
            </g>
          )
        })}

        {/* Shadow underneath bottom step */}
        <rect x="0" y={stairH - 4} width={stairW} height="4" fill="black" opacity="0.4" />
      </svg>
    </div>
  )
}
