export type AnimType =
  | 'bounce' | 'rotate' | 'float' | 'wiggle' | 'fly' | 'walk' | 'jump' | 'open'
  | 'grow' | 'spin' | 'wave' | 'path' | 'swim' | 'drive' | 'roar' | 'swing'
  | 'peel' | 'split' | 'flap' | 'shake' | 'pulse' | 'hop' | 'sway' | 'rain'

export type Level = 1 | 2 | 3

/** Optional translations, kept for future Tamil / Hindi support. Not required. */
export type Translations = Partial<Record<'ta' | 'hi', { word: string; sentence?: string }>>

export interface VocabItem {
  id: string
  word: string
  categoryId: string
  subcategory: string
  /** Emoji illustration (fallback art) */
  emoji?: string
  /** Large text glyph instead of emoji, e.g. letters */
  glyph?: string
  /** Key of a custom animated SVG asset, if one exists */
  asset?: string
  animation: AnimType
  pronunciation: string
  /** Recorded native-speaker audio. When absent, speech synthesis is used. */
  audioSrc?: string
  definition: string
  sentence: string
  hint: string
  /** Small emoji story that gives visual context, e.g. ['🧒','🍎','😋'] */
  scene: string[]
  level: Level
  related: string[]
  translations?: Translations
}

export interface Category {
  id: string
  name: string
  emoji: string
  /** strong accent colour */
  color: string
  /** pastel background */
  bg: string
  level: Level
  blurb: string
}

export interface Lesson {
  id: string
  categoryId: string
  index: number
  title: string
  wordIds: string[]
}

export type LearningStatus = 'new' | 'explored' | 'learning' | 'mastered' | 'needs-revision'
