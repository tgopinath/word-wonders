import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { BADGES } from '../data/badges'
import {
  bumpStreak, emptyProgress, localProgressRepo, newWord, recordAnswer, today,
  type AppState, type ChildProgress, type Profile, type Settings,
} from '../services/progress'
import { setSfxEnabled } from '../services/sfx'

interface Ctx {
  state: AppState
  profile: Profile
  progress: ChildProgress
  /** Badges earned since last acknowledged — drives the celebration toast */
  newBadges: string[]
  ackBadges(): void
  markExplored(wordId: string, categoryId: string): void
  markHeard(wordId: string): void
  markRepeated(wordId: string): boolean
  toggleFavorite(wordId: string): void
  answer(wordId: string, ok: boolean): void
  addStars(n: number): void
  completeLesson(lessonId: string, stars: number): { bonus: number; firstTime: boolean }
  completeDaily(): boolean
  updateSettings(s: Partial<Settings>): void
  updateProfile(id: string, p: Partial<Profile>): void
  addProfile(p: Omit<Profile, 'id' | 'createdAt'>): void
  switchProfile(id: string): void
  resetProgress(): void
  secondsToday: number
}

const ProgressContext = createContext<Ctx | null>(null)

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => localProgressRepo.load())
  const [newBadges, setNewBadges] = useState<string[]>([])
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => { localProgressRepo.save(state) }, [state])
  useEffect(() => { setSfxEnabled(state.settings.soundEffects) }, [state.settings.soundEffects])

  const profile = state.profiles.find((p) => p.id === state.activeProfileId) ?? state.profiles[0]
  const progress = state.progress[profile.id] ?? emptyProgress()

  /** Apply a change to the active child's progress, then award any newly earned badges. */
  const update = useCallback((fn: (p: ChildProgress) => ChildProgress) => {
    setState((s) => {
      const pid = s.activeProfileId
      const before = s.progress[pid] ?? emptyProgress()
      let after = fn(before)
      const earned = BADGES.filter((b) => !after.badges[b.id] && b.earned(after)).map((b) => b.id)
      if (earned.length) {
        const badges = { ...after.badges }
        earned.forEach((id) => { badges[id] = Date.now() })
        after = { ...after, badges, stars: after.stars + earned.length * 5 }
        queueMicrotask(() => setNewBadges((q) => [...new Set([...q, ...earned])]))
      }
      return { ...s, progress: { ...s.progress, [pid]: after } }
    })
  }, [])

  // learning-time tracking (only while the tab is visible)
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState !== 'visible') return
      update((p) => {
        const d = today()
        return { ...p, secondsByDay: { ...p.secondsByDay, [d]: (p.secondsByDay[d] ?? 0) + 15 } }
      })
    }, 15_000)
    return () => clearInterval(t)
  }, [update])

  const word = (p: ChildProgress, id: string) => ({ ...(p.words[id] ?? newWord()) })

  const value = useMemo<Ctx>(() => ({
    state, profile, progress, newBadges,
    secondsToday: progress.secondsByDay[today()] ?? 0,
    ackBadges: () => setNewBadges([]),
    markExplored: (id, categoryId) => update((p0) => {
      const p = bumpStreak(p0)
      const w = word(p, id)
      w.explored = true
      w.lastSeen = Date.now()
      if (!w.due) w.due = Date.now() + 86_400_000
      return {
        ...p,
        words: { ...p.words, [id]: w },
        recent: [id, ...p.recent.filter((r) => r !== id)].slice(0, 24),
        lastCategory: categoryId,
      }
    }),
    markHeard: (id) => update((p) => {
      const w = word(p, id)
      w.heard++
      return { ...p, words: { ...p.words, [id]: w } }
    }),
    markRepeated: (id) => {
      const already = !!stateRef.current.progress[stateRef.current.activeProfileId]?.words[id]?.repeated
      if (already) return false
      update((p) => {
        const w = word(p, id)
        w.repeated = true
        return { ...p, stars: p.stars + 1, words: { ...p.words, [id]: w } }
      })
      return true
    },
    toggleFavorite: (id) => update((p) => ({
      ...p,
      favorites: p.favorites.includes(id) ? p.favorites.filter((f) => f !== id) : [id, ...p.favorites],
    })),
    answer: (id, ok) => update((p) => recordAnswer(bumpStreak(p), id, ok)),
    addStars: (n) => update((p) => ({ ...p, stars: p.stars + n })),
    completeLesson: (lessonId, stars) => {
      const prev = stateRef.current.progress[stateRef.current.activeProfileId]?.lessons[lessonId]
      const firstTime = !prev
      const bonus = firstTime ? 5 : 0
      update((p) => ({
        ...p,
        stars: p.stars + stars + bonus,
        lessons: {
          ...p.lessons,
          [lessonId]: { stars, best: Math.max(stars, prev?.best ?? 0), plays: (prev?.plays ?? 0) + 1, completedAt: Date.now() },
        },
      }))
      return { bonus, firstTime }
    },
    completeDaily: () => {
      const d = today()
      if (stateRef.current.progress[stateRef.current.activeProfileId]?.dailyDone[d]) return false
      update((p) => ({ ...p, stars: p.stars + 3, dailyDone: { ...p.dailyDone, [d]: true } }))
      return true
    },
    updateSettings: (s) => setState((st) => ({ ...st, settings: { ...st.settings, ...s } })),
    updateProfile: (id, patch) => setState((st) => ({
      ...st, profiles: st.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
    addProfile: (p) => setState((st) => {
      const id = 'p-' + Math.random().toString(36).slice(2, 8)
      return {
        ...st,
        profiles: [...st.profiles, { ...p, id, createdAt: Date.now() }],
        progress: { ...st.progress, [id]: emptyProgress() },
        activeProfileId: id,
      }
    }),
    switchProfile: (id) => setState((st) => ({ ...st, activeProfileId: id })),
    resetProgress: () => setState((st) => ({ ...st, progress: { ...st.progress, [st.activeProfileId]: emptyProgress() } })),
  }), [state, profile, progress, newBadges, update])

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}

export function useProgress() {
  const c = useContext(ProgressContext)
  if (!c) throw new Error('useProgress must be used inside ProgressProvider')
  return c
}
