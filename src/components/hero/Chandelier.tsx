import { COLORS } from "@/config/constants"

export function Chandelier() {
  return (
    <div className="chandelier-sway" style={{ display: "flex", justifyContent: "center" }}>
      <svg
        width="260"
        height="320"
        viewBox="0 0 260 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="chand-glow" cx="50%" cy="60%" r="50%">
            <stop offset="0%" stopColor={COLORS.GOLD_BRIGHT} stopOpacity="0.9" />
            <stop offset="60%" stopColor={COLORS.GOLD_BASE} stopOpacity="0.6" />
            <stop offset="100%" stopColor={COLORS.GOLD_DIM} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="chain-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS.GOLD_BRIGHT} />
            <stop offset="100%" stopColor={COLORS.GOLD_DIM} />
          </linearGradient>
          <filter id="flame-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Glow halo behind chandelier */}
        <ellipse cx="130" cy="200" rx="110" ry="70" fill="url(#chand-glow)" opacity="0.3" className="glow-pulse" />

        {/* Main chain from top */}
        <rect x="128" y="0" width="4" height="35" fill="url(#chain-grad)" rx="2" />

        {/* Crown cap */}
        <path d="M110 35 L150 35 L145 50 L115 50 Z" fill={COLORS.GOLD_DIM} />
        <path d="M115 35 L120 25 L125 35" fill={COLORS.GOLD_BRIGHT} />
        <path d="M130 35 L135 22 L140 35" fill={COLORS.GOLD_BRIGHT} />
        <path d="M145 35 L148 28 L152 35" fill={COLORS.GOLD_BASE} />

        {/* Upper tier ring */}
        <ellipse cx="130" cy="55" rx="40" ry="8" fill="none" stroke={COLORS.GOLD_DIM} strokeWidth="3" />
        <ellipse cx="130" cy="55" rx="40" ry="8" fill={COLORS.GOLD_DIM} opacity="0.2" />

        {/* Upper chains to mid ring */}
        {[-35, -17, 0, 17, 35].map((x, i) => (
          <line key={i} x1={130 + x} y1="55" x2={130 + x * 1.5} y2="105" stroke={COLORS.GOLD_DIM} strokeWidth="1.5" opacity="0.8" />
        ))}

        {/* Mid tier ring */}
        <ellipse cx="130" cy="108" rx="65" ry="10" fill="none" stroke={COLORS.GOLD_BASE} strokeWidth="3" />
        <ellipse cx="130" cy="108" rx="65" ry="10" fill={COLORS.GOLD_BASE} opacity="0.15" />

        {/* Decorative diamonds on mid ring */}
        {[-55, -30, 0, 30, 55].map((x, i) => (
          <polygon key={i}
            points={`${130+x},${102} ${130+x+5},${108} ${130+x},${114} ${130+x-5},${108}`}
            fill={COLORS.GOLD_BRIGHT}
            opacity="0.9"
          />
        ))}

        {/* Mid chains to lower ring */}
        {[-55, -35, -15, 0, 15, 35, 55].map((x, i) => (
          <line key={i} x1={130 + x} y1="108" x2={130 + x * 1.2} y2="158" stroke={COLORS.GOLD_DIM} strokeWidth="1.5" opacity="0.8" />
        ))}

        {/* Lower tier ring */}
        <ellipse cx="130" cy="161" rx="80" ry="12" fill="none" stroke={COLORS.GOLD_BASE} strokeWidth="3.5" />
        <ellipse cx="130" cy="161" rx="80" ry="12" fill={COLORS.GOLD_BASE} opacity="0.1" />

        {/* Candle holders on lower ring */}
        {[-70, -42, -14, 14, 42, 70].map((x, i) => {
          const cx = 130 + x
          const flickerClass = i % 3 === 0 ? "flame-flicker" : i % 3 === 1 ? "flame-flicker-2" : "flame-flicker-3"
          return (
            <g key={i}>
              {/* Candle cup */}
              <rect x={cx - 5} y="161" width="10" height="18" fill={COLORS.GOLD_DIM} rx="1" />
              <rect x={cx - 4} y="163" width="8" height="5" fill={COLORS.GOLD_BRIGHT} opacity="0.4" />
              {/* Wick */}
              <rect x={cx - 0.5} y="155" width="1" height="8" fill={COLORS.GOLD_PALE} />
              {/* Flame */}
              <g className={flickerClass} filter="url(#flame-glow)">
                <ellipse cx={cx} cy="148" rx="4.5" ry="8" fill="#FFA500" opacity="0.9" />
                <ellipse cx={cx} cy="149" rx="2.5" ry="5" fill="#FFE066" opacity="0.95" />
                <ellipse cx={cx} cy="150" rx="1.2" ry="2.5" fill="white" opacity="0.8" />
              </g>
            </g>
          )
        })}

        {/* Centre pendant chains */}
        {[-8, 0, 8].map((x, i) => (
          <line key={i} x1={130 + x} y1="108" x2={130 + x} y2="175" stroke={COLORS.GOLD_BASE} strokeWidth="2" opacity="0.9" />
        ))}

        {/* Central pendant */}
        <polygon points="130,175 122,200 130,225 138,200" fill={COLORS.GOLD_BRIGHT} />
        <polygon points="130,185 126,200 130,215 134,200" fill={COLORS.GOLD_PALE} opacity="0.8" />
        <ellipse cx="130" cy="200" rx="6" ry="6" fill={COLORS.GOLD_BRIGHT} opacity="0.9" />

        {/* Pendant chains from lower ring */}
        {[-80, -55, -35, 35, 55, 80].map((x, i) => (
          <line key={i}
            x1={130 + x} y1="165"
            x2={130 + x * 0.7} y2="200"
            stroke={COLORS.GOLD_DIM} strokeWidth="1" opacity="0.6"
          />
        ))}
        {/* Crystal drops */}
        {[-56, -38.5, -24.5, 24.5, 38.5, 56].map((x, i) => (
          <g key={i}>
            <polygon
              points={`${130+x},${200} ${130+x-3},${210} ${130+x},${218} ${130+x+3},${210}`}
              fill={COLORS.GOLD_BRIGHT}
              opacity="0.7"
            />
          </g>
        ))}
      </svg>
    </div>
  )
}
