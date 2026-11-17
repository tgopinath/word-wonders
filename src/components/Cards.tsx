import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { wordsInCategory } from '../data/vocabulary'
import { sfx } from '../services/sfx'
import { useProgress } from '../state/ProgressProvider'
import type { Category, VocabItem } from '../types'
import { ProgressBar } from './ui'

export function CategoryCard({ cat, index = 0 }: { cat: Category; index?: number }) {
  const { progress } = useProgress()
  const reduce = useReducedMotion()
  const words = wordsInCategory(cat.id)
  const explored = words.filter((w) => progress.words[w.id]?.explored).length
  return (
    <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(index * 0.03, 0.5) }}>
      <Link to={`/category/${cat.id}`} onClick={() => sfx.pop()}
        className="group block rounded-[28px] p-4 shadow-[0_6px_0_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-1 active:translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
        style={{ background: cat.bg }} aria-label={`${cat.name}, ${explored} of ${words.length} words explored`}>
        <div className="flex items-start justify-between">
          <span className="emoji-3d text-5xl transition-transform group-hover:scale-110 group-hover:-rotate-6 sm:text-6xl" aria-hidden>{cat.emoji}</span>
          {explored === words.length && <span className="text-2xl" title="Completed" aria-hidden>🏆</span>}
        </div>
        <p className="mt-2 font-display text-lg font-bold leading-tight sm:text-xl" style={{ color: cat.color }}>{cat.name}</p>
        <p className="text-sm text-[#6B5F86]">{cat.blurb}</p>
        <ProgressBar className="mt-3 !h-2.5" value={explored / words.length} color={cat.color} />
      </Link>
    </motion.div>
  )
}

/** Small word thumbnail used in galleries, search and favorites. */
export function WordThumb({ item, color, to }: { item: VocabItem; color: string; to?: string }) {
  const { progress } = useProgress()
  const w = progress.words[item.id]
  const fav = progress.favorites.includes(item.id)
  return (
    <Link to={to ?? `/word/${item.id}`} onClick={() => sfx.pop()} aria-label={`${item.word}${w?.explored ? ', explored' : ''}${fav ? ', favorite' : ''}`}
      className="group relative flex flex-col items-center rounded-[26px] bg-white p-3 pb-4 shadow-[0_6px_0_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1 focus-visible:outline-4 focus-visible:outline-sky-400">
      {w?.explored && <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#4CC26B] text-sm text-white" aria-label="explored">✓</span>}
      {fav && <span className="absolute right-2 top-2 text-lg" aria-label="favorite">💖</span>}
      <span className="emoji-3d grid h-20 place-items-center text-6xl transition-transform group-hover:scale-110 group-hover:-rotate-6 sm:h-24 sm:text-7xl" aria-hidden>
        {item.glyph ? <span className="font-display font-bold" style={{ color }}>{item.glyph}</span> : item.emoji}
      </span>
      <span className="mt-1 text-center font-display text-lg font-bold leading-tight" style={{ color }}>{item.word}</span>
    </Link>
  )
}
