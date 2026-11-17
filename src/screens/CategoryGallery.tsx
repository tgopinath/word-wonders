import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { WordThumb } from '../components/Cards'
import { BackLink, Button, Card, ProgressBar } from '../components/ui'
import { vocabRepo } from '../data/repository'
import { useProgress } from '../state/ProgressProvider'
import type { Category, Lesson, VocabItem } from '../types'

export function CategoryGallery() {
  const { catId = '' } = useParams()
  const nav = useNavigate()
  const { progress } = useProgress()
  const [data, setData] = useState<{ cat?: Category; words: VocabItem[]; lessons: Lesson[] } | null>(null)

  useEffect(() => {
    let alive = true
    setData(null)
    Promise.all([vocabRepo.getCategory(catId), vocabRepo.listWords(catId), vocabRepo.listLessons(catId)])
      .then(([cat, words, lessons]) => { if (alive) setData({ cat, words, lessons }) })
    return () => { alive = false }
  }, [catId])

  if (!data) return <LoadingState />
  const { cat, words, lessons } = data
  if (!cat) {
    return (
      <Card className="p-10 text-center">
        <p className="text-6xl">🧐</p>
        <h1 className="mt-3 font-display text-2xl font-bold">We couldn’t find that category</h1>
        <Button className="mt-6" onClick={() => nav('/explore')}>Go to Explore</Button>
      </Card>
    )
  }
  const byId = new Map(words.map((w) => [w.id, w]))
  const explored = words.filter((w) => progress.words[w.id]?.explored).length

  return (
    <div className="space-y-6">
      <BackLink to="/explore" label="Explore" />
      <header className="relative overflow-hidden rounded-[32px] p-6 sm:p-8" style={{ background: cat.bg }}>
        <motion.span className="emoji-3d absolute -right-2 -top-2 text-[120px] opacity-90 sm:text-[160px]" animate={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 5, repeat: Infinity }} aria-hidden>{cat.emoji}</motion.span>
        <p className="font-display font-semibold" style={{ color: cat.color }}>Level {cat.level} · {words.length} words</p>
        <h1 className="font-display text-4xl font-bold text-[#2B1F4A] sm:text-5xl">{cat.name}</h1>
        <p className="mt-1 max-w-[60%] text-[#6B5F86]">Tap a picture to see it move and hear its name.</p>
        <ProgressBar className="mt-4 max-w-md" value={explored / words.length} color={cat.color} />
      </header>

      {lessons.map((lesson) => {
        const lw = lesson.wordIds.map((id) => byId.get(id)!).filter(Boolean)
        const done = lw.filter((w) => progress.words[w.id]?.explored).length
        const unlocked = done === lw.length
        const result = progress.lessons[lesson.id]
        return (
          <section key={lesson.id} aria-labelledby={`${lesson.id}-h`}>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <h2 id={`${lesson.id}-h`} className="font-display text-2xl font-bold text-[#2B1F4A]">Lesson {lesson.index + 1}</h2>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#6B5F86]">{done}/{lw.length} explored</span>
              {result && <span className="rounded-full bg-[#FFF3C4] px-3 py-1 text-sm font-bold text-[#8A5A00]">Best ⭐ {result.best}</span>}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {lw.map((w) => <WordThumb key={w.id} item={w} color={cat.color} />)}
            </div>
            <Card className="mt-3 flex flex-wrap items-center gap-4 p-4">
              <span className="emoji-3d text-4xl" aria-hidden>{unlocked ? '🎯' : '🔒'}</span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold text-[#2B1F4A]">Find the Object</p>
                <p className="text-sm text-[#6B5F86]">{unlocked ? 'You explored every word. Ready to play?' : `Explore all ${lw.length} words to unlock this game.`}</p>
              </div>
              {unlocked
                ? <Button tone="leaf" onClick={() => nav(`/play/find/${lesson.id}`)}>{result ? 'Play again' : 'Play'} ▶</Button>
                : <Link to={`/word/${lw.find((w) => !progress.words[w.id]?.explored)?.id}`} className="font-display font-semibold text-[#5B3CC4] underline underline-offset-4">Keep exploring →</Link>}
            </Card>
          </section>
        )
      })}
    </div>
  )
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status">
      <div className="text-center">
        <motion.div className="text-6xl" animate={{ rotate: 360 }} transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }} aria-hidden>🌀</motion.div>
        <p className="mt-3 font-display text-lg text-[#6B5F86]">{label}</p>
      </div>
    </div>
  )
}
