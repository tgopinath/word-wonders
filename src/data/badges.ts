import type { ChildProgress } from '../services/progress'
import { lessonsForCategory, wordsInCategory } from './vocabulary'

export interface Badge {
  id: string
  name: string
  emoji: string
  description: string
  earned: (p: ChildProgress) => boolean
}

const exploredCount = (p: ChildProgress) => Object.values(p.words).filter((w) => w.explored).length
const allExplored = (p: ChildProgress, cat: string) => wordsInCategory(cat).every((w) => p.words[w.id]?.explored)
const allLessonsDone = (p: ChildProgress, cat: string) => lessonsForCategory(cat).every((l) => p.lessons[l.id])

export const BADGES: Badge[] = [
  { id: 'first-word', name: 'First Word', emoji: '🌱', description: 'Explore your very first word', earned: (p) => exploredCount(p) >= 1 },
  { id: 'first-10', name: 'First 10 Words', emoji: '🔟', description: 'Explore 10 words', earned: (p) => exploredCount(p) >= 10 },
  { id: 'first-game', name: 'Game On!', emoji: '🎮', description: 'Finish your first game', earned: (p) => Object.keys(p.lessons).length >= 1 },
  { id: 'perfect', name: 'Perfect Round', emoji: '💎', description: 'Get every answer right on the first try', earned: (p) => Object.values(p.lessons).some((l) => l.best >= 10) },
  { id: 'fruit-expert', name: 'Fruit Expert', emoji: '🍉', description: 'Finish every Fruits lesson', earned: (p) => allLessonsDone(p, 'fruits') },
  { id: 'animal-explorer', name: 'Animal Explorer', emoji: '🦁', description: 'Explore all the animals', earned: (p) => allExplored(p, 'animals') },
  { id: 'listening-champ', name: 'Listening Champion', emoji: '🎧', description: 'Listen to 30 words', earned: (p) => Object.values(p.words).reduce((n, w) => n + w.heard, 0) >= 30 },
  { id: 'repeat-star', name: 'Super Speaker', emoji: '🎤', description: 'Say 10 words out loud', earned: (p) => Object.values(p.words).filter((w) => w.repeated).length >= 10 },
  { id: 'streak-3', name: '3-Day Streak', emoji: '🔥', description: 'Learn 3 days in a row', earned: (p) => p.streak.count >= 3 },
  { id: 'vocab-master', name: 'Vocabulary Master', emoji: '👑', description: 'Explore 100 words', earned: (p) => exploredCount(p) >= 100 },
]

export const badgeById = (id: string) => BADGES.find((b) => b.id === id)
