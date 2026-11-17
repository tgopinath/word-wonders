import type { Category, Lesson, VocabItem } from '../types'
import { CATEGORIES, categoryById } from './categories'
import { VOCABULARY, lessonsForCategory, wordById, wordsInCategory } from './vocabulary'

/**
 * Data access boundary. The first release reads the bundled JSON-like data;
 * a backend implementation can replace LocalVocabularyRepository later
 * without touching screens.
 */
export interface VocabularyRepository {
  listCategories(): Promise<Category[]>
  getCategory(id: string): Promise<Category | undefined>
  listWords(categoryId: string): Promise<VocabItem[]>
  listLessons(categoryId: string): Promise<Lesson[]>
  getWord(id: string): Promise<VocabItem | undefined>
  search(query: string, opts?: { categoryId?: string; letter?: string }): Promise<VocabItem[]>
}

class LocalVocabularyRepository implements VocabularyRepository {
  async listCategories() { return CATEGORIES }
  async getCategory(id: string) { return categoryById(id) }
  async listWords(categoryId: string) { return wordsInCategory(categoryId) }
  async listLessons(categoryId: string) { return lessonsForCategory(categoryId) }
  async getWord(id: string) { return wordById(id) }
  async search(query: string, opts: { categoryId?: string; letter?: string } = {}) {
    const q = query.trim().toLowerCase()
    return VOCABULARY.filter((w) => {
      if (opts.categoryId && w.categoryId !== opts.categoryId) return false
      if (opts.letter && !w.word.toUpperCase().startsWith(opts.letter)) return false
      if (!q) return true
      const cat = categoryById(w.categoryId)?.name.toLowerCase() ?? ''
      return w.word.toLowerCase().includes(q) || cat.includes(q)
    })
  }
}

export const vocabRepo: VocabularyRepository = new LocalVocabularyRepository()
