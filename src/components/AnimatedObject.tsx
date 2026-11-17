import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { OBJECT_ANIMATIONS } from '../animations/objectAnimations'
import { AppleArt, BananaArt } from '../art/FruitArt'
import type { VocabItem } from '../types'

interface Props {
  item: VocabItem
  size?: number
  /** Increment to play the item's action animation */
  playKey?: number
  idle?: boolean
  onTap?: () => void
  label?: string
  className?: string
}

type Effect = 'roar' | 'spray' | 'sparkle' | 'bubbles' | 'drops' | null

function effectFor(item: VocabItem): Effect {
  if (item.id === 'animals-elephant') return 'spray'
  switch (item.animation) {
    case 'roar': return 'roar'
    case 'fly': case 'flap': return 'sparkle'
    case 'swim': return 'bubbles'
    case 'rain': return 'drops'
    default: return null
  }
}

/** The tappable vocabulary object: custom SVG when available, emoji/glyph otherwise. */
export function AnimatedObject({ item, size = 160, playKey = 0, idle = true, onTap, label, className = '' }: Props) {
  const controls = useAnimationControls()
  const reduce = useReducedMotion()
  const spec = OBJECT_ANIMATIONS[item.animation]
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (reduce || !idle) { controls.stop(); controls.set({ x: 0, y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1 }); return }
    void controls.start(spec.idle)
  }, [controls, spec, idle, reduce])

  useEffect(() => {
    if (!playKey) return
    let cancelled = false
    setActive(true)
    const run = reduce
      ? controls.start({ scale: [1, 1.12, 1], transition: { duration: 0.4 } })
      : controls.start(spec.action)
    void run.then(() => {
      if (cancelled) return
      setActive(false)
      controls.set({ x: 0, y: 0, rotate: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1 })
      if (idle && !reduce) void controls.start(spec.idle)
    })
    return () => { cancelled = true }
  }, [playKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const effect = active && !reduce ? effectFor(item) : null
  const isSplit = item.animation === 'split' && !item.asset

  const art = item.asset === 'apple' ? <AppleArt size={size} active={active} />
    : item.asset === 'banana' ? <BananaArt size={size} peeled={active} />
    : item.glyph ? (
      <span className="font-display font-bold leading-none select-none" style={{ fontSize: size * 0.8, color: 'var(--glyph, #C2410C)', textShadow: '0 6px 0 rgba(0,0,0,.12)' }}>{item.glyph}</span>
    ) : isSplit ? (
      <SplitEmoji emoji={item.emoji ?? '❓'} size={size} open={active} />
    ) : (
      <span className="emoji-3d select-none leading-none" style={{ fontSize: size * 0.78 }}>{item.emoji}</span>
    )

  const Wrapper = onTap ? motion.button : motion.div
  return (
    <Wrapper
      type={onTap ? 'button' : undefined}
      onClick={onTap}
      aria-label={label ?? item.word}
      whileHover={onTap && !reduce ? { scale: 1.05 } : undefined}
      whileTap={onTap ? { scale: 0.92 } : undefined}
      className={`relative grid place-items-center ${onTap ? 'cursor-pointer focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-400 rounded-[32px]' : ''} ${className}`}
      style={{ width: size * 1.15, height: size * 1.15 }}
    >
      <motion.div animate={controls} className="grid place-items-center" style={{ width: size, height: size }}>
        {art}
      </motion.div>
      <AnimatePresence>{effect && <EffectLayer key={playKey} effect={effect} size={size} />}</AnimatePresence>
    </Wrapper>
  )
}

function SplitEmoji({ emoji, size, open }: { emoji: string; size: number; open: boolean }) {
  const half = (side: 'l' | 'r') => (
    <motion.span
      className="emoji-3d absolute inset-0 grid place-items-center leading-none"
      style={{ fontSize: size * 0.78, clipPath: side === 'l' ? 'inset(0 50% 0 0)' : 'inset(0 0 0 50%)' }}
      animate={{ x: open ? (side === 'l' ? -size * 0.18 : size * 0.18) : 0, rotate: open ? (side === 'l' ? -12 : 12) : 0 }}
      transition={{ type: 'spring', stiffness: 140, damping: 12 }}
    >
      {emoji}
    </motion.span>
  )
  return <span className="relative block" style={{ width: size, height: size }}>{half('l')}{half('r')}</span>
}

function EffectLayer({ effect, size }: { effect: Exclude<Effect, null>; size: number }) {
  const n = effect === 'roar' ? 3 : 7
  return (
    <motion.div className="pointer-events-none absolute inset-0" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {Array.from({ length: n }).map((_, i) => {
        if (effect === 'roar') {
          return (
            <motion.span key={i} className="absolute left-1/2 top-1/2 rounded-full border-4 border-amber-400"
              style={{ width: size * 0.6, height: size * 0.6, marginLeft: -size * 0.3, marginTop: -size * 0.3 }}
              initial={{ scale: 0.6, opacity: 0.9 }} animate={{ scale: 1.8, opacity: 0 }}
              transition={{ duration: 1, delay: i * 0.25 }} />
          )
        }
        const glyph = effect === 'spray' || effect === 'drops' ? '💧' : effect === 'bubbles' ? '🫧' : '✨'
        const angle = (i / n) * Math.PI * 2
        const from = effect === 'spray' ? { x: -size * 0.3, y: -size * 0.1 } : { x: 0, y: 0 }
        const to = effect === 'spray'
          ? { x: -size * 0.6 - i * 6, y: -size * 0.5 + i * 18 }
          : effect === 'drops'
            ? { x: (i - 3) * 18, y: size * 0.6 }
            : effect === 'bubbles'
              ? { x: (i - 3) * 14, y: -size * 0.7 }
              : { x: Math.cos(angle) * size * 0.6, y: Math.sin(angle) * size * 0.6 }
        return (
          <motion.span key={i} className="absolute left-1/2 top-1/2 text-2xl"
            initial={{ ...from, opacity: 0, scale: 0.4 }}
            animate={{ ...to, opacity: [0, 1, 0], scale: 1 }}
            transition={{ duration: 1.1, delay: i * 0.07 }}>{glyph}</motion.span>
        )
      })}
    </motion.div>
  )
}
