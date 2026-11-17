import { Link } from 'react-router-dom'
import { WordThumb } from '../components/Cards'
import { Card } from '../components/ui'
import { categoryById } from '../data/categories'
import { wordById } from '../data/vocabulary'
import { useProgress } from '../state/ProgressProvider'
import type { VocabItem } from '../types'

export function Favorites() {
  const { progress } = useProgress()
  const favs = progress.favorites.map((id) => wordById(id)).filter((w): w is VocabItem => !!w)
  const recent = progress.recent.map((id) => wordById(id)).filter((w): w is VocabItem => !!w)
  const grid = (list: VocabItem[]) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
      {list.map((w) => <WordThumb key={w.id} item={w} color={categoryById(w.categoryId)?.color ?? '#5B3CC4'} />)}
    </div>
  )
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold text-[#2B1F4A]">Favorites</h1>
      {favs.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="text-6xl" aria-hidden>🤍</p>
          <p className="mt-3 font-display text-2xl font-bold text-[#2B1F4A]">No favorites yet</p>
          <p className="text-[#6B5F86]">Tap the heart on any word to keep it here.</p>
          <Link to="/explore" className="mt-4 inline-block font-display font-semibold text-[#5B3CC4] underline underline-offset-4">Find words to love →</Link>
        </Card>
      ) : grid(favs)}

      <section aria-labelledby="recent-h">
        <h2 id="recent-h" className="mb-3 font-display text-2xl font-bold text-[#2B1F4A]">Recently learned</h2>
        {recent.length === 0 ? <Card className="p-6 text-center text-[#6B5F86]">Words you explore will appear here.</Card> : grid(recent)}
      </section>
    </div>
  )
}
