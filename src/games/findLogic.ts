import type { VocabItem } from '../types'

/** Pure game logic for "Find the Object" — kept separate from UI for reuse and testing. */
export interface Round { target: VocabItem; options: VocabItem[] }

export const MAX_ROUNDS = 5
export const OPTIONS_PER_ROUND = 4
export const MAX_STARS_PER_ROUND = 2

export function shuffle<T>(arr: T[], rand = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Each round asks for one target from `pool`; the other options come from the pool
 * first, then from `distractors`, never repeating a word within a round.
 */
export function buildRounds(pool: VocabItem[], distractors: VocabItem[], rand = Math.random): Round[] {
  const targets = shuffle(pool, rand).slice(0, Math.min(MAX_ROUNDS, pool.length))
  return targets.map((target) => {
    const others = shuffle(pool.filter((w) => w.id !== target.id), rand)
    const extra = shuffle(distractors.filter((w) => w.id !== target.id && !others.some((o) => o.id === w.id) && w.word !== target.word), rand)
    const picks = [...others, ...extra].filter((w) => w.word !== target.word).slice(0, OPTIONS_PER_ROUND - 1)
    return { target, options: shuffle([target, ...picks], rand) }
  })
}

/** 2 stars on the first try, 1 star after any wrong attempt. */
export const starsFor = (wrongAttempts: number) => (wrongAttempts === 0 ? 2 : 1)
