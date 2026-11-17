import type { Lesson, VocabItem } from '../types'
import { CATEGORIES, categoryById } from './categories'
import { ALPHABET, WORDS } from './words'

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

/** Words that have a custom animated SVG instead of the emoji fallback. */
const CUSTOM_ASSETS: Record<string, string> = {
  'fruits-apple': 'apple',
  'fruits-banana': 'banana',
}

export const LESSON_SIZE = 6

function build(): VocabItem[] {
  const out: VocabItem[] = []
  for (const cat of CATEGORIES) {
    if (cat.id === 'alphabets') {
      ALPHABET.forEach(([letter, example, emoji], i) => {
        out.push({
          id: `alphabets-${letter.toLowerCase()}`,
          word: letter,
          categoryId: 'alphabets',
          subcategory: i < 13 ? 'A to M' : 'N to Z',
          glyph: letter,
          animation: (['bounce', 'jump', 'spin', 'wiggle'] as const)[i % 4],
          pronunciation: letter,
          definition: `The letter ${letter}. ${letter} is for ${example}.`,
          sentence: `${letter} is for ${example}.`,
          hint: `${letter} is for ${example} ${emoji}`,
          scene: [letter, '➡️', emoji],
          level: 1,
          related: [],
        })
      })
      continue
    }
    const rows = WORDS[cat.id] ?? []
    rows.forEach(([word, emoji, animation, definition, sentence, hint, scene]) => {
      const id = `${cat.id}-${slug(word)}`
      out.push({
        id,
        word,
        categoryId: cat.id,
        subcategory: cat.name,
        emoji,
        asset: CUSTOM_ASSETS[id],
        animation,
        pronunciation: word,
        definition,
        sentence,
        hint: hint ?? definition,
        scene: (scene ?? `${emoji}`).split(' '),
        level: cat.level,
        related: [],
      })
    })
  }
  // related words: neighbours in the same category
  const byCat = groupBy(out, (w) => w.categoryId)
  for (const list of Object.values(byCat)) {
    list.forEach((w, i) => {
      w.related = [list[(i + 1) % list.length], list[(i + 2) % list.length], list[(i + list.length - 1) % list.length]]
        .filter((r) => r.id !== w.id)
        .map((r) => r.id)
    })
  }
  return out
}

function groupBy<T>(arr: T[], key: (t: T) => string): Record<string, T[]> {
  const r: Record<string, T[]> = {}
  for (const x of arr) (r[key(x)] ??= []).push(x)
  return r
}

export const VOCABULARY: VocabItem[] = build()
const BY_ID = new Map(VOCABULARY.map((w) => [w.id, w]))

export const wordById = (id: string) => BY_ID.get(id)
export const wordsInCategory = (catId: string) => VOCABULARY.filter((w) => w.categoryId === catId)

export function lessonsForCategory(catId: string): Lesson[] {
  const words = wordsInCategory(catId)
  const cat = categoryById(catId)
  const lessons: Lesson[] = []
  for (let i = 0; i < words.length; i += LESSON_SIZE) {
    const index = lessons.length
    lessons.push({
      id: `${catId}-L${index + 1}`,
      categoryId: catId,
      index,
      title: `${cat?.name ?? ''} ${index + 1}`,
      wordIds: words.slice(i, i + LESSON_SIZE).map((w) => w.id),
    })
  }
  return lessons
}

export function lessonById(id: string): Lesson | undefined {
  const m = id.match(/^(.*)-L(\d+)$/)
  if (!m) return undefined
  return lessonsForCategory(m[1]).find((l) => l.id === id)
}
