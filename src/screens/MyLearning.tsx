import { useNavigate } from 'react-router-dom'
import { WordThumb } from '../components/Cards'
import { Button, Card, ProgressBar } from '../components/ui'
import { BADGES } from '../data/badges'
import { CATEGORIES, categoryById } from '../data/categories'
import { VOCABULARY, wordById, wordsInCategory } from '../data/vocabulary'
import { dueWords, statusOf, today } from '../services/progress'
import { useProgress } from '../state/ProgressProvider'

export function MyLearning() {
  const nav = useNavigate()
  const { progress } = useProgress()
  const explored = Object.values(progress.words).filter((w) => w.explored).length
  const mastered = Object.values(progress.words).filter((w) => statusOf(w) === 'mastered').length
  const catsDone = CATEGORIES.filter((c) => wordsInCategory(c.id).every((w) => progress.words[w.id]?.explored)).length
  const acc = progress.quiz.total ? Math.round((progress.quiz.correct / progress.quiz.total) * 100) : 0
  const mins = Math.round((progress.secondsByDay[today()] ?? 0) / 60)
  const due = dueWords(progress).map((id) => wordById(id)).filter((w) => !!w)

  const stats = [
    { label: 'Words learned', value: explored, icon: '📚' },
    { label: 'Mastered', value: mastered, icon: '🏅' },
    { label: 'Categories done', value: `${catsDone}/${CATEGORIES.length}`, icon: '🏆' },
    { label: 'Day streak', value: progress.streak.count, icon: '🔥' },
    { label: 'Stars', value: progress.stars, icon: '⭐' },
    { label: 'Quiz accuracy', value: progress.quiz.total ? `${acc}%` : '—', icon: '🎯' },
    { label: 'Minutes today', value: mins, icon: '⏱️' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold text-[#2B1F4A]">My Learning</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 text-center">
            <p className="text-3xl" aria-hidden>{s.icon}</p>
            <p className="font-display text-3xl font-bold text-[#2B1F4A]">{s.value}</p>
            <p className="text-sm text-[#6B5F86]">{s.label}</p>
          </Card>
        ))}
      </div>

      <section aria-labelledby="rev-h">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id="rev-h" className="font-display text-2xl font-bold text-[#2B1F4A]">Time to practise</h2>
          {due.length >= 2 && <Button tone="grape" onClick={() => nav('/play/find/review')}>🔁 Start revision</Button>}
        </div>
        {due.length === 0 ? (
          <Card className="p-6 text-center text-[#6B5F86]">Nothing to revise right now. Words you find tricky in games will show up here. 🌈</Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {due.map((w) => <WordThumb key={w.id} item={w} color={categoryById(w.categoryId)?.color ?? '#5B3CC4'} />)}
          </div>
        )}
      </section>

      <section aria-labelledby="badges-h">
        <h2 id="badges-h" className="mb-3 font-display text-2xl font-bold text-[#2B1F4A]">Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b) => {
            const got = !!progress.badges[b.id]
            return (
              <Card key={b.id} className={`p-4 text-center ${got ? '' : 'opacity-60'}`}>
                <p className={`emoji-3d text-5xl ${got ? '' : 'grayscale'}`} aria-hidden>{got ? b.emoji : '🔒'}</p>
                <p className="mt-1 font-display font-bold text-[#2B1F4A]">{b.name}</p>
                <p className="text-xs text-[#6B5F86]">{b.description}</p>
              </Card>
            )
          })}
        </div>
      </section>

      <section aria-labelledby="cat-h">
        <h2 id="cat-h" className="mb-3 font-display text-2xl font-bold text-[#2B1F4A]">Categories</h2>
        <Card className="divide-y divide-[#F0EBF8] p-2">
          {CATEGORIES.map((c) => {
            const ws = wordsInCategory(c.id)
            const n = ws.filter((w) => progress.words[w.id]?.explored).length
            return (
              <button key={c.id} type="button" onClick={() => nav(`/category/${c.id}`)} className="flex w-full items-center gap-3 p-3 text-left focus-visible:outline-4 focus-visible:outline-sky-400">
                <span className="emoji-3d text-3xl" aria-hidden>{c.emoji}</span>
                <span className="w-40 shrink-0 font-display font-bold text-[#2B1F4A]">{c.name}</span>
                <ProgressBar className="flex-1" value={n / ws.length} color={c.color} />
                <span className="w-14 text-right text-sm font-semibold text-[#6B5F86]">{n}/{ws.length}</span>
              </button>
            )
          })}
        </Card>
        <p className="mt-2 text-sm text-[#9A8FB3]">{VOCABULARY.length} words in total.</p>
      </section>
    </div>
  )
}
