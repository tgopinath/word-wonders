import type { LearningStatus } from '../types'

/** Per-word learning record. `box` is a Leitner box (0–4) for spaced repetition. */
export interface WordProgress {
  explored: boolean
  heard: number
  correct: number
  incorrect: number
  box: number
  due: number // epoch ms when the word should come back for practice
  lastSeen: number
  repeated?: boolean
}

export interface LessonResult { stars: number; best: number; plays: number; completedAt: number }

export interface Profile {
  id: string
  name: string
  avatar: string
  ageGroup: '3-5' | '6-8' | '9-10'
  difficulty: 1 | 2 | 3
  createdAt: number
}

export interface ChildProgress {
  stars: number
  words: Record<string, WordProgress>
  favorites: string[]
  recent: string[]
  lessons: Record<string, LessonResult>
  badges: Record<string, number> // badge id -> earned at
  streak: { count: number; lastDay: string }
  secondsByDay: Record<string, number>
  quiz: { correct: number; total: number }
  lastCategory?: string
  dailyDone: Record<string, boolean>
}

export interface Settings {
  soundEffects: boolean
  slowSpeech: boolean
  dailyLimitMin: number // 0 = no limit
  parentPin: string // optional 4-digit; empty = math gate
}

export interface AppState {
  version: 1
  profiles: Profile[]
  activeProfileId: string
  progress: Record<string, ChildProgress>
  settings: Settings
}

export const today = (d = new Date()) => d.toISOString().slice(0, 10)
const DAY = 86_400_000
/** Leitner intervals in days for box 0..4 */
const INTERVALS = [0, 1, 2, 4, 8]

export const emptyProgress = (): ChildProgress => ({
  stars: 0, words: {}, favorites: [], recent: [], lessons: {}, badges: {},
  streak: { count: 0, lastDay: '' }, secondsByDay: {}, quiz: { correct: 0, total: 0 }, dailyDone: {},
})

export const newWord = (): WordProgress => ({ explored: false, heard: 0, correct: 0, incorrect: 0, box: 0, due: 0, lastSeen: 0 })

export function defaultState(): AppState {
  const id = 'p-' + Math.random().toString(36).slice(2, 8)
  return {
    version: 1,
    profiles: [{ id, name: 'Little Explorer', avatar: '🦊', ageGroup: '3-5', difficulty: 1, createdAt: Date.now() }],
    activeProfileId: id,
    progress: { [id]: emptyProgress() },
    settings: { soundEffects: true, slowSpeech: false, dailyLimitMin: 0, parentPin: '' },
  }
}

/** Storage boundary: swap for IndexedDB or a backend later. */
export interface ProgressRepository {
  load(): AppState
  save(s: AppState): void
}

const KEY = 'wordwonders:v1'
export const localProgressRepo: ProgressRepository = {
  load() {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        const s = JSON.parse(raw) as AppState
        if (s.version === 1 && s.profiles?.length) return s
      }
    } catch { /* corrupted or unavailable storage → start fresh */ }
    return defaultState()
  },
  save(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* storage full/blocked */ }
  },
}

// ---- pure helpers on ChildProgress ----

export function bumpStreak(p: ChildProgress): ChildProgress {
  const t = today()
  if (p.streak.lastDay === t) return p
  const y = today(new Date(Date.now() - DAY))
  return { ...p, streak: { count: p.streak.lastDay === y ? p.streak.count + 1 : 1, lastDay: t } }
}

export function recordAnswer(p: ChildProgress, wordId: string, ok: boolean): ChildProgress {
  const w = { ...(p.words[wordId] ?? newWord()) }
  if (ok) { w.correct++; w.box = Math.min(4, w.box + 1) } else { w.incorrect++; w.box = 0 }
  w.due = Date.now() + INTERVALS[w.box] * DAY
  w.lastSeen = Date.now()
  return {
    ...p,
    words: { ...p.words, [wordId]: w },
    quiz: { correct: p.quiz.correct + (ok ? 1 : 0), total: p.quiz.total + 1 },
  }
}

export function statusOf(w: WordProgress | undefined): LearningStatus {
  if (!w || (!w.explored && w.correct + w.incorrect === 0)) return 'new'
  if (w.incorrect > w.correct && w.incorrect > 0) return 'needs-revision'
  if (w.box >= 3) return 'mastered'
  if (w.correct + w.incorrect > 0) return 'learning'
  return 'explored'
}

/** Words that are due for revision, hardest first. */
export function dueWords(p: ChildProgress): string[] {
  const now = Date.now()
  return Object.entries(p.words)
    .filter(([, w]) => (w.correct + w.incorrect > 0 && w.due <= now) || w.incorrect > w.correct)
    .sort(([, a], [, b]) => a.box - b.box || b.incorrect - a.incorrect)
    .map(([id]) => id)
}
