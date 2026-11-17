import { useEffect, useState } from 'react'
import { CategoryCard, WordThumb } from '../components/Cards'
import { Card } from '../components/ui'
import { CATEGORIES, categoryById } from '../data/categories'
import { vocabRepo } from '../data/repository'
import type { VocabItem } from '../types'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function Explore() {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('')
  const [letter, setLetter] = useState('')
  const [results, setResults] = useState<VocabItem[] | null>(null)
  const searching = !!(q.trim() || cat || letter)

  useEffect(() => {
    if (!searching) { setResults(null); return }
    let alive = true
    void vocabRepo.search(q, { categoryId: cat || undefined, letter: letter || undefined }).then((r) => { if (alive) setResults(r) })
    return () => { alive = false }
  }, [q, cat, letter, searching])

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold text-[#2B1F4A]">Explore</h1>
      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap gap-3">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#F6F2FF] px-4">
            <span aria-hidden className="text-xl">🔎</span>
            <span className="sr-only">Search words</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a word…"
              className="min-h-14 w-full min-w-0 bg-transparent font-display text-xl text-[#2B1F4A] outline-none placeholder:text-[#9A8FB3]" />
            {q && <button type="button" onClick={() => setQ('')} className="min-h-11 px-2 text-xl" aria-label="Clear search">✕</button>}
          </label>
          <label className="sr-only" htmlFor="cat-filter">Category</label>
          <select id="cat-filter" value={cat} onChange={(e) => setCat(e.target.value)}
            className="min-h-14 rounded-full bg-[#F6F2FF] px-4 font-display text-lg text-[#2B1F4A] focus-visible:outline-4 focus-visible:outline-sky-400">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="First letter">
          {LETTERS.map((l) => (
            <button key={l} type="button" onClick={() => setLetter(letter === l ? '' : l)} aria-pressed={letter === l}
              className={`h-11 w-11 rounded-xl font-display text-lg font-bold focus-visible:outline-4 focus-visible:outline-sky-400 ${letter === l ? 'bg-[#8C5CE6] text-white' : 'bg-[#F6F2FF] text-[#5B3CC4]'}`}>{l}</button>
          ))}
        </div>
      </Card>

      {!searching && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.map((c, i) => <CategoryCard key={c.id} cat={c} index={i} />)}
        </div>
      )}

      {searching && results && (
        results.length === 0 ? (
          <Card className="p-10 text-center">
            <p className="text-6xl" aria-hidden>🙈</p>
            <p className="mt-3 font-display text-2xl font-bold text-[#2B1F4A]">No words found</p>
            <p className="text-[#6B5F86]">Try another word or letter.</p>
          </Card>
        ) : (
          <>
            <p className="font-display font-semibold text-[#6B5F86]">{results.length} word{results.length === 1 ? '' : 's'}</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {results.map((w) => <WordThumb key={w.id} item={w} color={categoryById(w.categoryId)?.color ?? '#5B3CC4'} />)}
            </div>
          </>
        )
      )}
    </div>
  )
}
