import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card } from '../components/ui'
import { CATEGORIES } from '../data/categories'
import { GAMES } from '../data/games'
import { lessonsForCategory } from '../data/vocabulary'
import { sfx } from '../services/sfx'
import { useProgress } from '../state/ProgressProvider'

export function Games() {
  const nav = useNavigate()
  const [params, setParams] = useSearchParams()
  const picking = params.get('play') === 'find'

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold text-[#2B1F4A]">Games</h1>
      {(['mode', 'mini'] as const).map((kind) => (
        <section key={kind} aria-labelledby={`${kind}-h`}>
          <h2 id={`${kind}-h`} className="mb-3 font-display text-2xl font-bold text-[#2B1F4A]">{kind === 'mode' ? 'Learning modes' : 'Mini-games'}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {GAMES.filter((g) => g.kind === kind).map((g) => (
              <button key={g.id} type="button" disabled={!g.ready}
                onClick={() => { sfx.pop(); if (g.id === 'find') setParams({ play: 'find' }); else if (g.path) nav(g.path) }}
                className="relative rounded-[26px] p-4 text-left shadow-[0_6px_0_rgba(0,0,0,0.05)] transition-transform enabled:hover:-translate-y-1 disabled:cursor-not-allowed focus-visible:outline-4 focus-visible:outline-sky-400"
                style={{ background: g.bg }}>
                <span className={`emoji-3d text-5xl ${g.ready ? '' : 'opacity-50 grayscale'}`} aria-hidden>{g.emoji}</span>
                <p className="mt-2 font-display text-lg font-bold leading-tight text-[#2B1F4A]">{g.name}</p>
                <p className="text-sm text-[#6B5F86]">{g.description}</p>
                <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${g.ready ? 'bg-[#4CC26B] text-white' : 'bg-white/70 text-[#9A8FB3]'}`}>{g.ready ? 'Play' : 'Coming soon'}</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      <AnimatePresence>{picking && <LessonPicker onClose={() => setParams({})} />}</AnimatePresence>
    </div>
  )
}

/** Choose which lesson to play "Find the Object" with. Locked until its words are explored. */
function LessonPicker({ onClose }: { onClose: () => void }) {
  const nav = useNavigate()
  const { progress } = useProgress()
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-end bg-[#2B1F4A]/40 sm:place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      role="dialog" aria-modal="true" aria-label="Choose a lesson" onClick={onClose}>
      <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }} onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full overflow-y-auto rounded-t-[32px] bg-[#FFF9F0] p-5 sm:max-w-2xl sm:rounded-[32px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold text-[#2B1F4A]">🎯 Pick a lesson</h2>
          <Button size="sm" tone="white" onClick={onClose} aria-label="Close">✕</Button>
        </div>
        <Card className="mb-4 flex items-center gap-3 p-4">
          <span className="text-3xl" aria-hidden>🔁</span>
          <p className="flex-1 font-display font-semibold text-[#2B1F4A]">Revision: practise tricky words</p>
          <Button size="sm" tone="grape" onClick={() => nav('/play/find/review')}>Play</Button>
        </Card>
        <div className="space-y-2">
          {CATEGORIES.map((c) => lessonsForCategory(c.id).map((l) => {
            const explored = l.wordIds.filter((id) => progress.words[id]?.explored).length
            const open = explored === l.wordIds.length
            const res = progress.lessons[l.id]
            return (
              <div key={l.id} className="flex items-center gap-3 rounded-[20px] p-3" style={{ background: c.bg }}>
                <span className="emoji-3d text-3xl" aria-hidden>{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-[#2B1F4A]">{c.name} · Lesson {l.index + 1}</p>
                  <p className="text-sm text-[#6B5F86]">{open ? (res ? `Best ⭐ ${res.best}` : 'Ready to play') : `Explore ${l.wordIds.length - explored} more word${l.wordIds.length - explored === 1 ? '' : 's'} to unlock`}</p>
                </div>
                {open
                  ? <Button size="sm" tone="leaf" onClick={() => nav(`/play/find/${l.id}`)}>Play</Button>
                  : <Button size="sm" tone="white" onClick={() => nav(`/category/${c.id}`)}>🔒 Explore</Button>}
              </div>
            )
          }))}
        </div>
      </motion.div>
    </motion.div>
  )
}
