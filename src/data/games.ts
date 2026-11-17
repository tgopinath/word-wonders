export interface GameInfo {
  id: string
  name: string
  emoji: string
  bg: string
  kind: 'mode' | 'mini'
  description: string
  ready: boolean
  path?: string
}

/** The five core learning modes and ten mini-games. `ready` = playable in this build. */
export const GAMES: GameInfo[] = [
  { id: 'explore', name: 'Explore and Learn', emoji: '🔍', bg: '#DDF1FD', kind: 'mode', description: 'Tap objects, hear words, watch them move.', ready: true, path: '/explore' },
  { id: 'find', name: 'Find the Object', emoji: '🎯', bg: '#FFE4E1', kind: 'mode', description: 'Hear a word and tap the matching object.', ready: true, path: '/games?play=find' },
  { id: 'listen', name: 'Listen and Identify', emoji: '👂', bg: '#EEE6FF', kind: 'mode', description: 'Listen carefully and pick what you hear.', ready: false },
  { id: 'match', name: 'Match the Word', emoji: '🧩', bg: '#DDF5E2', kind: 'mode', description: 'Drag each word to its picture.', ready: false },
  { id: 'spell', name: 'Spell the Word', emoji: '🔤', bg: '#FFF3CC', kind: 'mode', description: 'Put the letters in the right order.', ready: false },
  { id: 'missing', name: 'Missing Object', emoji: '🫥', bg: '#D7F5F2', kind: 'mini', description: 'Which one disappeared?', ready: false },
  { id: 'odd', name: 'Odd One Out', emoji: '🤔', bg: '#FFEBD6', kind: 'mini', description: 'Find the one that does not belong.', ready: false },
  { id: 'puzzle', name: 'Word Puzzle', emoji: '🧠', bg: '#E2E6FF', kind: 'mini', description: 'Unscramble the letters.', ready: false },
  { id: 'picture', name: 'Picture Quiz', emoji: '🖼️', bg: '#FFE2F1', kind: 'mini', description: 'Choose the right name for the picture.', ready: false },
  { id: 'memory', name: 'Memory Match', emoji: '🃏', bg: '#DFEAFF', kind: 'mini', description: 'Flip cards and find pairs.', ready: false },
  { id: 'shadow', name: 'Shadow Matching', emoji: '👤', bg: '#F5E9DC', kind: 'mini', description: 'Which object makes this shadow?', ready: false },
  { id: 'sort', name: 'Word Sorting', emoji: '🗂️', bg: '#DFF6E3', kind: 'mini', description: 'Sort things into the right groups.', ready: false },
  { id: 'sentence', name: 'Sentence Builder', emoji: '📝', bg: '#FFF0D4', kind: 'mini', description: 'Put words in order to make a sentence.', ready: false },
  { id: 'sound', name: 'What’s the Sound?', emoji: '🔊', bg: '#DBF1FC', kind: 'mini', description: 'Guess who makes that sound.', ready: false },
  { id: 'speed', name: 'Speed Challenge', emoji: '⏱️', bg: '#FFE0EF', kind: 'mini', description: 'An optional race against the clock.', ready: false },
]
