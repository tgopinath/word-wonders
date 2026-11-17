import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { badgeById } from '../data/badges'
import { sfx } from '../services/sfx'
import { useProgress } from '../state/ProgressProvider'
import { Button } from './ui'

const COLORS = ['#FF6B6B', '#FFC83D', '#4CC26B', '#3BA7F5', '#8C5CE6', '#FF8FC7']

/** Confetti burst; render it conditionally. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {Array.from({ length: pieces }).map((_, i) => {
        const left = (i * 37) % 100
        const rot = (i * 73) % 360
        return (
          <motion.span key={i} className="absolute top-[-20px] block rounded-sm"
            style={{ left: `${left}%`, width: 10 + (i % 3) * 4, height: 14, background: COLORS[i % COLORS.length] }}
            initial={{ y: -20, rotate: rot, opacity: 1 }}
            animate={{ y: '105vh', rotate: rot + 540, x: [0, (i % 2 ? 1 : -1) * 40, 0] }}
            transition={{ duration: 2.2 + (i % 5) * 0.3, delay: (i % 8) * 0.05, ease: 'easeIn' }} />
        )
      })}
    </div>
  )
}

/** Global toast that celebrates newly earned badges. */
export function BadgeToast() {
  const { newBadges, ackBadges } = useProgress()
  const id = newBadges[0]
  // Wait a moment so the badge never interrupts the object's own animation and audio.
  const [ready, setReady] = useState<string | null>(null)
  useEffect(() => {
    if (!id) { setReady(null); return }
    const t = setTimeout(() => setReady(id), 2600)
    return () => clearTimeout(t)
  }, [id])
  const badge = ready ? badgeById(ready) : undefined
  useEffect(() => { if (badge) sfx.celebrate() }, [badge])
  return (
    <AnimatePresence>
      {badge && (
        <motion.div className="fixed inset-0 z-[60] grid place-items-center bg-[#2B1F4A]/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-label={`New badge: ${badge.name}`}>
          <Confetti />
          <motion.div initial={{ scale: 0.6, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 14 }}
            className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-2xl">
            <p className="font-display text-lg font-semibold text-[#8C5CE6]">New badge!</p>
            <motion.div className="my-4 text-8xl emoji-3d" animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: 2 }}>{badge.emoji}</motion.div>
            <h2 className="font-display text-3xl font-bold text-[#2B1F4A]">{badge.name}</h2>
            <p className="mt-2 text-lg text-[#6B5F86]">{badge.description}</p>
            <p className="mt-2 font-display font-semibold text-[#8A5A00]">+5 ⭐</p>
            <Button className="mt-6 w-full" tone="grape" onClick={ackBadges} autoFocus>Yay!</Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
