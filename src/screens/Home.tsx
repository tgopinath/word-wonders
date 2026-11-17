import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { BADGES } from '../data/badges'
import { CATEGORIES, categoryById } from '../data/categories'
import { VOCABULARY, lessonsForCategory, wordsInCategory } from '../data/vocabulary'
import { CategoryCard } from '../components/Cards'
import { Button, Card, ProgressBar, StarPill } from '../components/ui'
import { today } from '../services/progress'
import { useProgress } from '../state/ProgressProvider'
import { GAMES } from '../data/games'

/** Deterministic "word of the day" from beginner-level words. */
export function dailyWord() {
  const pool = VOCABULARY.filter((w) => w.level === 1 && w.emoji)
  const d = today()
  let h = 0
  for (const ch of d) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return pool[h % pool.length]
}

export function Home() {
  const { profile, progress } = useProgress()
  const nav = useNavigate()
  const explored = Object.values(progress.words).filter((w) => w.explored).length
  const total = VOCABULARY.length

  // Continue learning: last category, else Fruits
  const contCat = categoryById(progress.lastCategory ?? 'fruits') ?? CATEGORIES[0]
  const contWords = wordsInCategory(contCat.id)
  const contDone = contWords.filter((w) => progress.words[w.id]?.explored).length
  const nextWord = contWords.find((w) => !progress.words[w.id]?.explored)
  const nextLesson = lessonsForCategory(contCat.id).find((l) => !progress.lessons[l.id])

  const daily = dailyWord()
  const dailyDone = !!progress.dailyDone[today()]
  const earned = BADGES.filter((b) => progress.badges[b.id])

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center gap-4">
        <Link to="/parent" className="grid h-16 w-16 place-items-center rounded-full bg-white text-4xl shadow-md" aria-label="Profile">{profile.avatar}</Link>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-bold text-[#2B1F4A] sm:text-4xl">Hello, {profile.name}!</h1>
          <p className="text-[#6B5F86]">What shall we learn today?</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFE4D6] px-3 py-1.5 font-display font-bold text-[#C2410C]" title="Learning streak">
            <span aria-hidden>🔥</span>{progress.streak.count}<span className="sr-only"> day streak</span>
          </span>
          <StarPill count={progress.stars} />
        </div>
        <div className="w-full">
          <div className="mb-1 flex justify-between text-sm font-semibold text-[#6B5F86]"><span>Words explored</span><span>{explored} / {total}</span></div>
          <ProgressBar value={explored / total} color="#8C5CE6" />
        </div>
      </header>

      {/* Continue + Daily */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="relative overflow-hidden p-6" style={{ background: contCat.bg }}>
          <p className="font-display font-semibold" style={{ color: contCat.color }}>Continue learning</p>
          <div className="mt-2 flex items-center gap-4">
            <motion.span className="emoji-3d text-7xl" animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }} aria-hidden>{contCat.emoji}</motion.span>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl font-bold text-[#2B1F4A]">{contCat.name}</h2>
              <p className="text-sm text-[#6B5F86]">{contDone} of {contWords.length} words</p>
              <ProgressBar className="mt-2" value={contDone / contWords.length} color={contCat.color} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button tone="sun" onClick={() => nav(nextWord ? `/word/${nextWord.id}` : `/category/${contCat.id}`)}>
              {nextWord ? `Next: ${nextWord.word} ▶` : 'Open ▶'}
            </Button>
            {!nextWord && nextLesson && <Button tone="white" onClick={() => nav(`/play/find/${nextLesson.id}`)}>Play game</Button>}
          </div>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-[#E9E0FF] to-[#FFE3F1] p-6">
          <p className="font-display font-semibold text-[#8C5CE6]">Daily challenge</p>
          <div className="mt-2 flex items-center gap-4">
            <motion.span className="emoji-3d text-7xl" animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity }} aria-hidden>{daily.emoji}</motion.span>
            <div>
              <h2 className="font-display text-2xl font-bold text-[#2B1F4A]">Today’s word</h2>
              <p className="text-[#6B5F86]">{dailyDone ? `You learned “${daily.word}” today! ✓` : 'Meet a new word, win 3 ⭐'}</p>
            </div>
          </div>
          <Button className="mt-4" tone={dailyDone ? 'white' : 'grape'} onClick={() => nav(`/word/${daily.id}?daily=1`)}>
            {dailyDone ? 'See it again' : 'Start challenge'}
          </Button>
        </Card>
      </div>

      {/* Explore */}
      <section aria-labelledby="explore-h">
        <div className="mb-3 flex items-end justify-between">
          <h2 id="explore-h" className="font-display text-2xl font-bold text-[#2B1F4A]">Explore vocabulary</h2>
          <Link to="/explore" className="font-display font-semibold text-[#5B3CC4] underline-offset-4 hover:underline">Search words →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => <CategoryCard key={c.id} cat={c} index={i} />)}
        </div>
      </section>

      {/* Games */}
      <section aria-labelledby="games-h">
        <div className="mb-3 flex items-end justify-between">
          <h2 id="games-h" className="font-display text-2xl font-bold text-[#2B1F4A]">Learning games</h2>
          <Link to="/games" className="font-display font-semibold text-[#5B3CC4] underline-offset-4 hover:underline">All games →</Link>
        </div>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
          {GAMES.slice(0, 6).map((g) => (
            <Link key={g.id} to={g.ready && g.path ? g.path : '/games'} className="w-40 shrink-0 snap-start rounded-[24px] p-4 shadow-[0_6px_0_rgba(0,0,0,0.05)]" style={{ background: g.bg }}>
              <span className="emoji-3d text-4xl" aria-hidden>{g.emoji}</span>
              <p className="mt-2 font-display font-bold leading-tight text-[#2B1F4A]">{g.name}</p>
              <p className="text-xs font-semibold text-[#6B5F86]">{g.ready ? 'Play now' : 'Coming soon'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section aria-labelledby="ach-h">
        <div className="mb-3 flex items-end justify-between">
          <h2 id="ach-h" className="font-display text-2xl font-bold text-[#2B1F4A]">My achievements</h2>
          <Link to="/learning" className="font-display font-semibold text-[#5B3CC4] underline-offset-4 hover:underline">See all →</Link>
        </div>
        <Card className="flex flex-wrap items-center gap-6 p-5">
          <div className="text-center"><p className="font-display text-3xl font-bold text-[#8A5A00]">⭐ {progress.stars}</p><p className="text-sm text-[#6B5F86]">stars</p></div>
          <div className="text-center"><p className="font-display text-3xl font-bold text-[#5B3CC4]">{earned.length}/{BADGES.length}</p><p className="text-sm text-[#6B5F86]">badges</p></div>
          <div className="flex flex-1 flex-wrap gap-2">
            {earned.length === 0 && <p className="text-[#6B5F86]">Explore your first word to earn a badge! 🌱</p>}
            {earned.map((b) => <span key={b.id} title={b.name} className="emoji-3d grid h-12 w-12 place-items-center rounded-full bg-[#FFF3C4] text-2xl">{b.emoji}</span>)}
          </div>
        </Card>
      </section>
    </div>
  )
}
