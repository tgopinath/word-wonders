import { motion } from 'framer-motion'
import { useId } from 'react'

/** Glossy 3D-style apple. `bites` (0–3) removes bites for the "eating" scene. */
export function AppleArt({ size = 200, bites = 0, active = false }: { size?: number; bites?: number; active?: boolean }) {
  const id = useId().replace(/:/g, '')
  const biteCircles = [
    { cx: 168, cy: 92, r: 26 },
    { cx: 176, cy: 130, r: 24 },
    { cx: 30, cy: 110, r: 26 },
  ].slice(0, bites)
  return (
    <svg viewBox="0 0 200 210" width={size} height={size * 1.05} role="img" aria-label="Apple">
      <defs>
        <radialGradient id={`ab${id}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FF8A80" />
          <stop offset="45%" stopColor="#F2453D" />
          <stop offset="100%" stopColor="#A3161A" />
        </radialGradient>
        <linearGradient id={`al${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8BE37A" />
          <stop offset="100%" stopColor="#2E9E3B" />
        </linearGradient>
        <mask id={`am${id}`}>
          <rect width="200" height="210" fill="white" />
          {biteCircles.map((c, i) => <circle key={i} {...c} fill="black" />)}
        </mask>
      </defs>
      <ellipse cx="100" cy="198" rx="62" ry="9" fill="#000" opacity="0.12" />
      <g mask={`url(#am${id})`}>
        <path
          d="M100 52 C 70 30, 18 42, 20 102 C 22 160, 62 196, 86 190 C 94 188, 106 188, 114 190 C 138 196, 178 160, 180 102 C 182 42, 130 30, 100 52 Z"
          fill={`url(#ab${id})`}
        />
        {biteCircles.map((c, i) => <circle key={i} cx={c.cx} cy={c.cy} r={c.r + 2} fill="none" stroke="#FFF4D6" strokeWidth="7" />)}
        <ellipse cx="62" cy="84" rx="16" ry="26" fill="#fff" opacity="0.45" transform="rotate(-25 62 84)" />
        <ellipse cx="74" cy="64" rx="6" ry="5" fill="#fff" opacity="0.7" />
      </g>
      <path d="M100 56 C 98 40, 102 26, 108 16" stroke="#6B3E1F" strokeWidth="8" strokeLinecap="round" fill="none" />
      <motion.path
        d="M106 30 C 120 10, 150 10, 158 20 C 148 40, 120 44, 106 30 Z"
        fill={`url(#al${id})`}
        style={{ originX: 0, originY: 1 }}
        animate={active ? { rotate: [0, -20, 10, 0] } : { rotate: [0, -4, 0] }}
        transition={active ? { duration: 0.8 } : { duration: 3, repeat: Infinity }}
      />
    </svg>
  )
}

/** Curved banana that becomes an upright peeled banana when `peeled`. */
export function BananaArt({ size = 200, peeled = false }: { size?: number; peeled?: boolean }) {
  const id = useId().replace(/:/g, '')
  const spring = { type: 'spring' as const, stiffness: 140, damping: 12 }
  // origin is relative to each flap's own bounding box (the hinge near its bottom edge)
  const flap = (rotate: number, d: string, originX: number) => (
    <motion.path d={d} fill={`url(#bp${id})`} stroke="#C99A06" strokeWidth="2" style={{ originX, originY: 1 }}
      initial={false} animate={{ rotate: peeled ? rotate : 0 }} transition={{ ...spring, delay: 0.15 }} />
  )
  return (
    <svg viewBox="0 0 200 220" width={size} height={size * 1.1} role="img" aria-label="Banana">
      <defs>
        <linearGradient id={`bp${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF07A" />
          <stop offset="55%" stopColor="#FFD21F" />
          <stop offset="100%" stopColor="#E0A800" />
        </linearGradient>
        <linearGradient id={`bf${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFBEA" />
          <stop offset="100%" stopColor="#F3E2A6" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="206" rx="60" ry="8" fill="#000" opacity="0.12" />
      {/* whole, curved banana */}
      <motion.g initial={false} animate={{ opacity: peeled ? 0 : 1, scale: peeled ? 0.8 : 1 }} transition={{ duration: 0.25 }} style={{ transformOrigin: '100px 120px' }}>
        <path d="M44 52 C 40 130, 92 196, 178 160 C 186 156, 184 144, 175 146 C 112 166, 70 118, 66 50 Z" fill={`url(#bp${id})`} stroke="#C99A06" strokeWidth="2" />
        <path d="M54 70 C 58 128, 96 168, 150 162" stroke="#fff" strokeOpacity="0.55" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M62 60 C 66 120, 104 156, 168 154" stroke="#C99A06" strokeOpacity="0.5" strokeWidth="2" fill="none" />
        <rect x="45" y="28" width="16" height="28" rx="5" fill="#7A5A1E" transform="rotate(-8 53 42)" />
        <circle cx="179" cy="153" r="6" fill="#5B3E14" />
      </motion.g>
      {/* peeled, upright banana */}
      <motion.g initial={false} animate={{ opacity: peeled ? 1 : 0, scale: peeled ? 1 : 0.8 }} transition={{ duration: 0.25 }} style={{ transformOrigin: '100px 120px' }}>
        <motion.path d="M84 76 C 80 40, 120 40, 116 76 L 114 150 C 112 170, 88 170, 86 150 Z" fill={`url(#bf${id})`}
          initial={false} animate={{ y: peeled ? -22 : 0 }} transition={spring} />
        <path d="M78 120 C 76 172, 124 172, 122 120 L 122 112 L 78 112 Z" fill={`url(#bp${id})`} stroke="#C99A06" strokeWidth="2" />
        {flap(-125, 'M78 114 C 70 84, 76 56, 92 40 L 98 114 Z', 0.25)}
        {flap(125, 'M122 114 C 130 84, 124 56, 108 40 L 102 114 Z', 0.75)}
        <rect x="93" y="166" width="14" height="22" rx="5" fill="#7A5A1E" />
        <ellipse cx="90" cy="140" rx="4" ry="14" fill="#fff" opacity="0.4" />
      </motion.g>
    </svg>
  )
}
