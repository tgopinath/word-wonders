import { motion, useReducedMotion } from 'framer-motion'
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { sfx } from '../services/sfx'

type Tone = 'sun' | 'sky' | 'leaf' | 'berry' | 'grape' | 'white'
const TONES: Record<Tone, string> = {
  sun: 'bg-[#FFC83D] text-[#5A3B00] shadow-[0_6px_0_#D99A00]',
  sky: 'bg-[#3BA7F5] text-white shadow-[0_6px_0_#1F78BF]',
  leaf: 'bg-[#4CC26B] text-white shadow-[0_6px_0_#2E8E48]',
  berry: 'bg-[#F0524F] text-white shadow-[0_6px_0_#B5302D]',
  grape: 'bg-[#8C5CE6] text-white shadow-[0_6px_0_#6236B8]',
  white: 'bg-white text-[#3B2F55] shadow-[0_6px_0_#E3DCF0]',
}

/** Chunky, tactile 3D button. */
export function Button({ tone = 'sun', size = 'md', className = '', children, onClick, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'text-2xl px-8 py-4 min-h-16' : size === 'sm' ? 'text-base px-4 py-2 min-h-11' : 'text-xl px-6 py-3 min-h-14'
  return (
    <button
      {...rest}
      onClick={(e) => { sfx.tap(); onClick?.(e) }}
      className={`font-display font-semibold rounded-[22px] transition-transform active:translate-y-[4px] active:shadow-none disabled:opacity-50 disabled:active:translate-y-0 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-400 inline-flex items-center justify-center gap-2 ${TONES[tone]} ${sz} ${className}`}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={`rounded-[28px] bg-white ring-1 ring-[#ECE6F5] shadow-[0_8px_30px_rgba(80,60,140,0.08)] ${className}`} style={style}>{children}</div>
}

export function BackLink({ to, label = 'Back' }: { to: string; label?: string }) {
  return (
    <Link to={to} onClick={() => sfx.tap()} className="inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 font-display font-semibold text-[#3B2F55] ring-1 ring-[#ECE6F5] shadow-sm min-h-11 focus-visible:outline-4 focus-visible:outline-sky-400" aria-label={label}>
      <span aria-hidden className="text-xl">←</span> {label}
    </Link>
  )
}

export function ProgressBar({ value, color = '#4CC26B', className = '' }: { value: number; color?: string; className?: string }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  return (
    <div className={`h-4 rounded-full bg-black/8 overflow-hidden ${className}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <motion.div className="h-full rounded-full" style={{ background: color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 80, damping: 18 }} />
    </div>
  )
}

export function StarPill({ count }: { count: number }) {
  return (
    <motion.span key={count} initial={{ scale: 1.3 }} animate={{ scale: 1 }} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF3C4] px-3 py-1.5 font-display font-bold text-[#8A5A00]">
      <span aria-hidden>⭐</span>{count}<span className="sr-only"> stars</span>
    </motion.span>
  )
}

/** Animated waveform bars, shown while audio is playing. */
export function Waveform({ active, color = '#3BA7F5' }: { active: boolean; color?: string }) {
  const reduce = useReducedMotion()
  return (
    <span className="inline-flex items-end gap-1 h-8" aria-hidden>
      {[0.5, 0.9, 0.6, 1, 0.7, 0.4].map((h, i) => (
        <motion.span key={i} className="w-1.5 rounded-full" style={{ background: color, height: 32 }}
          animate={active && !reduce ? { scaleY: [0.3, h, 0.4, h * 0.8, 0.3] } : { scaleY: 0.25 }}
          transition={active ? { duration: 0.8, repeat: Infinity, delay: i * 0.08 } : { duration: 0.2 }} />
      ))}
    </span>
  )
}
