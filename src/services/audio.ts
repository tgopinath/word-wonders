/**
 * Pronunciation service abstraction.
 * Today: browser speech synthesis. Later: recorded native-speaker clips —
 * RecordedFirstPronunciation already plays `audioSrc` when an item has one
 * and falls back to speech synthesis otherwise.
 */
export interface SpeakOptions {
  slow?: boolean
  /** Recorded clip to prefer over synthesis */
  src?: string
}

export interface PronunciationService {
  readonly available: boolean
  speak(text: string, opts?: SpeakOptions): Promise<void>
  stop(): void
  subscribe(fn: (speaking: string | null) => void): () => void
}

type Listener = (speaking: string | null) => void

class SpeechSynthesisPronunciation implements PronunciationService {
  available = typeof window !== 'undefined' && 'speechSynthesis' in window
  private listeners = new Set<Listener>()
  private voice: SpeechSynthesisVoice | null = null
  rate = 0.9

  constructor() {
    if (!this.available) return
    const pick = () => {
      const voices = speechSynthesis.getVoices()
      const prefer = ['Samantha', 'Google US English', 'Karen', 'Daniel', 'Microsoft Aria', 'Microsoft Jenny']
      this.voice =
        prefer.map((n) => voices.find((v) => v.name.includes(n))).find(Boolean) ??
        voices.find((v) => v.lang === 'en-US') ??
        voices.find((v) => v.lang.startsWith('en')) ??
        null
    }
    pick()
    speechSynthesis.addEventListener?.('voiceschanged', pick)
  }

  private emit(v: string | null) { this.listeners.forEach((l) => l(v)) }

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => { this.listeners.delete(fn) }
  }

  stop() {
    if (this.available) speechSynthesis.cancel()
    this.emit(null)
  }

  speak(text: string, opts: SpeakOptions = {}): Promise<void> {
    if (!this.available) return Promise.resolve()
    speechSynthesis.cancel()
    return new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'en-US'
      if (this.voice) u.voice = this.voice
      u.rate = opts.slow ? 0.55 : this.rate
      u.pitch = 1.1
      let done = false
      const finish = () => {
        if (done) return
        done = true
        this.emit(null)
        resolve()
      }
      u.onstart = () => this.emit(text)
      u.onend = finish
      u.onerror = finish
      this.emit(text)
      speechSynthesis.speak(u)
      // Safety net: some browsers never fire onend
      setTimeout(finish, 1500 + text.length * 160 * (opts.slow ? 1.8 : 1))
    })
  }
}

class RecordedFirstPronunciation implements PronunciationService {
  private tts: SpeechSynthesisPronunciation
  private audio: HTMLAudioElement | null = null
  constructor(tts: SpeechSynthesisPronunciation) { this.tts = tts }
  get available() { return this.tts.available }
  subscribe(fn: Listener) { return this.tts.subscribe(fn) }
  setRate(r: number) { this.tts.rate = r }
  stop() {
    this.audio?.pause()
    this.audio = null
    this.tts.stop()
  }
  async speak(text: string, opts: SpeakOptions = {}) {
    if (opts.src) {
      try {
        this.stop()
        const a = new Audio(opts.src)
        a.playbackRate = opts.slow ? 0.7 : 1
        this.audio = a
        await a.play()
        await new Promise<void>((r) => { a.onended = () => r() })
        return
      } catch {
        // fall through to synthesis when the clip is missing or blocked
      }
    }
    return this.tts.speak(text, opts)
  }
}

export const pronunciation = new RecordedFirstPronunciation(new SpeechSynthesisPronunciation())
