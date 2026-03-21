export default function Logo({ height = 34 }) {
  // Aspect: ~360 wide x 64 tall
  const w = (360 / 64) * height
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 360 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ScrapYard"
    >
      {/* S */}
      <path d="M6 44c0 0 3 6 12 6s13-4 13-10c0-7-10-9-14-11S7 25 7 18c0-7 5-12 14-12s12 6 12 6"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* c */}
      <path d="M50 30c0 0-2-4-7-4c-6 0-10 5-10 12s4 12 10 12c5 0 7-4 7-4"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" fill="none"/>

      {/* r */}
      <path d="M58 50V30m0 6c0 0 2-6 8-6"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* a */}
      <path d="M87 50V34c0-5-4-8-9-8s-9 3-9 8"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M87 42c0 0-3 8-9 8s-9-3-9-8"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* p */}
      <path d="M97 62V26m0 12c0-6 4-12 10-12s10 6 10 12-4 12-10 12-10-6-10-12z"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* ========== Y as a TREE ========== */}
      {/* Tree canopy - layered leaf clusters sitting on top of the Y branches */}
      <ellipse cx="152" cy="8" rx="18" ry="10" fill="#16a34a" opacity="0.2"/>
      <ellipse cx="140" cy="12" rx="10" ry="8" fill="#16a34a" opacity="0.35"/>
      <ellipse cx="164" cy="12" rx="10" ry="8" fill="#16a34a" opacity="0.35"/>
      <circle cx="146" cy="9" r="7" fill="#16a34a" opacity="0.55"/>
      <circle cx="158" cy="9" r="7" fill="#16a34a" opacity="0.55"/>
      <circle cx="152" cy="5" r="7.5" fill="#15803d" opacity="0.75"/>
      <circle cx="148" cy="12" r="4.5" fill="#15803d" opacity="0.6"/>
      <circle cx="156" cy="12" r="4.5" fill="#15803d" opacity="0.6"/>
      {/* Tiny bright leaf dots */}
      <circle cx="143" cy="7" r="2" fill="#22c55e" opacity="0.9"/>
      <circle cx="161" cy="7" r="2" fill="#22c55e" opacity="0.9"/>
      <circle cx="152" cy="2" r="2.2" fill="#22c55e" opacity="0.8"/>

      {/* Y trunk (straight down) and two branches going up-left and up-right */}
      <path d="M152 52 L152 32"
        stroke="#15803d" strokeWidth="5" strokeLinecap="round"/>
      <path d="M152 32 L138 16"
        stroke="#15803d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M152 32 L166 16"
        stroke="#15803d" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Tiny roots */}
      <path d="M152 52 L147 56" stroke="#15803d" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
      <path d="M152 52 L157 56" stroke="#15803d" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>

      {/* a */}
      <path d="M190 50V34c0-5-4-8-9-8s-9 3-9 8"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M190 42c0 0-3 8-9 8s-9-3-9-8"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* r */}
      <path d="M199 50V30m0 6c0 0 2-6 8-6"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>

      {/* d */}
      <path d="M228 8v42m0-12c0-6-4-12-10-12s-10 6-10 12 4 12 10 12 10-6 10-12z"
        stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}
