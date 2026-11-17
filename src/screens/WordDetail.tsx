import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatedObject } from '../components/AnimatedObject'
import { Confetti } from '../components/Celebration'
import { BackLink, Button, Card, Waveform } from '../components/ui'
import { AppleArt } from '../art/FruitArt'
import { categoryById } from '../data/categories'
import { wordById, wordsInCategory } from '../data/vocabulary'
import { useSpeech } from '../hooks/useSpeech'
import { sfx } from '../services/sfx'
import { useProgress } from '../state/ProgressProvider'
import type { Category, VocabItem } from '../types'

export function WordDetail() {
  const { wordId = '' } = useParams()
  const item = wordById(wordId)
  const cat = item ? categoryById(item.categoryId) : undefined
  if (!item || !cat) {
    return (
      <Card className="p-10 text-center">
        <p className="text-6xl">🧐</p>
        <h1 className="mt-3 font-display text-2xl font-bold">We couldn’t find that word</h1>
        <Link to="/explore" className="mt-6 inline-block font-display font-semibold text-[#5B3CC4] underline">Go to Explore</Link>
      </Card>
    )
  }
  // key resets all local state when moving between words
  return <WordView key={item.id} item={item} cat={cat} />
}

function WordView({ item, cat }: { item: VocabItem; cat: Category }) {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const { progress, markExplored, markHeard, toggleFavorite, completeDaily } = useProgress()
  const { speak, speaking, available } = useSpeech()
  const [playKey, setPlayKey] = useState(0)
  const [revealed, setRevealed] = useState(!!progress.words[item.id]?.explored)
  const [slow, setSlow] = useState(false)
  const [dailyToast, setDailyToast] = useState(false)

  const list = wordsInCategory(item.categoryId)
  const idx = list.findIndex((w) => w.id === item.id)
  const prev = list[idx - 1]
  const next = list[idx + 1]
  const fav = progress.favorites.includes(item.id)

  const sayWord = (s = slow) => { markHeard(item.id); return speak(item.pronunciation, { slow: s, src: item.audioSrc }) }

  const onTapObject = () => {
    sfx.pop()
    setPlayKey((k) => k + 1)
    setRevealed(true)
    markExplored(item.id, item.categoryId)
    void sayWord()
    if (params.get('daily') && completeDaily()) setDailyToast(true)
  }

  const speakingWord = speaking === item.pronunciation
  const speakingSentence = speaking === item.sentence

  return (
    <div className="space-y-5" style={{ ['--glyph' as string]: cat.color }}>
      <div className="flex flex-wrap items-center gap-3">
        <BackLink to={`/category/${cat.id}`} label={cat.name} />
        <span className="font-display font-semibold text-[#6B5F86]">{idx + 1} / {list.length}</span>
        <div className="flex-1" />
        <motion.button type="button" whileTap={{ scale: 0.8 }} onClick={() => { sfx.pop(); toggleFavorite(item.id) }}
          aria-pressed={fav} aria-label={fav ? 'Remove from favorites' : 'Add to favorites'}
          className="grid h-14 w-14 place-items-center rounded-full bg-white text-3xl shadow-md focus-visible:outline-4 focus-visible:outline-sky-400">
          <motion.span key={String(fav)} initial={{ scale: 0.4 }} animate={{ scale: 1 }}>{fav ? '💖' : '🤍'}</motion.span>
        </motion.button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        {/* Stage */}
        <div className="relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden rounded-[36px] p-6 sm:min-h-[460px] lg:sticky lg:top-6 lg:self-start"
          style={{ background: `radial-gradient(circle at 50% 40%, #ffffff 0%, ${cat.bg} 65%)` }}>
          <div className="absolute inset-x-0 bottom-0 h-24 rounded-t-[50%] opacity-60" style={{ background: cat.bg }} aria-hidden />
          <AnimatedObject item={item} size={230} playKey={playKey} onTap={onTapObject} label={`Tap the ${revealed ? item.word : 'object'}`} />
          <AnimatePresence>
            {!revealed && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: [0, -6, 0] }} exit={{ opacity: 0 }} transition={{ y: { repeat: Infinity, duration: 1.6 } }}
                className="relative mt-2 rounded-full bg-white px-5 py-2 font-display text-xl font-semibold text-[#5B3CC4] shadow">
                👆 Tap me!
              </motion.p>
            )}
          </AnimatePresence>
          <div className="relative mt-4 flex w-full justify-between">
            <NavArrow to={prev && `/word/${prev.id}`} dir="prev" label={prev?.word} />
            <NavArrow to={next && `/word/${next.id}`} dir="next" label={next?.word} />
          </div>
        </div>

        {/* Learning panel */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {!revealed ? (
              <motion.div key="hidden" exit={{ opacity: 0 }}>
                <Card className="p-8 text-center">
                  <p className="text-5xl" aria-hidden>❓</p>
                  <p className="mt-3 font-display text-2xl font-bold text-[#2B1F4A]">What is this?</p>
                  <p className="mt-1 text-[#6B5F86]">Tap the picture to find out!</p>
                </Card>
              </motion.div>
            ) : (
              <motion.div key="shown" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card className="p-6">
                  <WordLetters word={item.word} color={cat.color} active={speakingWord} />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <motion.button type="button" onClick={() => { void sayWord() }} whileTap={{ scale: 0.9 }}
                      className="grid h-20 w-20 place-items-center rounded-full text-4xl text-white shadow-[0_6px_0_rgba(0,0,0,0.15)] focus-visible:outline-4 focus-visible:outline-sky-400"
                      style={{ background: cat.color }} aria-label={`Hear ${item.word}`}>
                      🔊
                    </motion.button>
                    <div className="flex flex-col gap-1">
                      <Waveform active={speakingWord} color={cat.color} />
                      <span className="text-sm font-semibold text-[#6B5F86]" aria-live="polite">
                        {!available ? 'Sound is not available on this device' : speakingWord ? 'Listening…' : 'Tap to hear it again'}
                      </span>
                    </div>
                    <div className="flex-1" />
                    <button type="button" onClick={() => { sfx.tap(); setSlow((s) => !s) }} aria-pressed={slow}
                      className={`min-h-12 rounded-full px-4 font-display font-semibold focus-visible:outline-4 focus-visible:outline-sky-400 ${slow ? 'bg-[#DDF5E2] text-[#2B8A3E]' : 'bg-[#F3EFFA] text-[#6B5F86]'}`}>
                      🐢 Slow {slow ? 'on' : 'off'}
                    </button>
                    <button type="button" onClick={() => { void sayWord(true) }}
                      className="min-h-12 rounded-full bg-[#F3EFFA] px-4 font-display font-semibold text-[#6B5F86] focus-visible:outline-4 focus-visible:outline-sky-400">
                      🔁 Replay slowly
                    </button>
                  </div>
                </Card>

                <Card className="p-6">
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-[#9A8FB3]">What it means</p>
                  <p className="mt-1 text-xl text-[#2B1F4A]">{item.definition}</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display text-sm font-semibold uppercase tracking-wide text-[#9A8FB3]">Example sentence</p>
                    <button type="button" onClick={() => void speak(item.sentence, { slow })} aria-label="Hear the sentence"
                      className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 font-display font-semibold text-white focus-visible:outline-4 focus-visible:outline-sky-400" style={{ background: cat.color }}>
                      🔊 <Waveform active={speakingSentence} color="#fff" />
                    </button>
                  </div>
                  <Sentence text={item.sentence} word={item.word} color={cat.color} active={speakingSentence} />
                  <Scene item={item} cat={cat} />
                </Card>

                <ListenRepeat item={item} color={cat.color} sayWord={() => sayWord()} />
                <QuickCheck item={item} cat={cat} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {revealed && next && (
        <div className="flex justify-end">
          <Button tone="leaf" size="lg" onClick={() => nav(`/word/${next.id}`)}>Next: {next.word} →</Button>
        </div>
      )}
      {revealed && !next && (
        <Card className="flex flex-wrap items-center gap-4 p-5">
          <span className="text-4xl" aria-hidden>🎉</span>
          <p className="flex-1 font-display text-xl font-bold text-[#2B1F4A]">That’s the last {cat.name.toLowerCase()} word!</p>
          <Button tone="leaf" onClick={() => nav(`/category/${cat.id}`)}>Back to {cat.name}</Button>
        </Card>
      )}

      <AnimatePresence>
        {dailyToast && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="fixed inset-x-4 bottom-28 z-50 mx-auto flex max-w-md items-center gap-3 rounded-[24px] bg-[#2B1F4A] p-4 text-white shadow-xl" role="status">
            <Confetti pieces={24} />
            <span className="text-3xl" aria-hidden>🏅</span>
            <p className="flex-1 font-display font-semibold">Daily challenge done! +3 ⭐</p>
            <button className="min-h-11 rounded-full bg-white/15 px-4 font-semibold" onClick={() => setDailyToast(false)}>OK</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function NavArrow({ to, dir, label }: { to?: string; dir: 'prev' | 'next'; label?: string }) {
  if (!to) return <span />
  return (
    <Link to={to} onClick={() => sfx.tap()} aria-label={`${dir === 'prev' ? 'Previous' : 'Next'} word: ${label}`}
      className="grid h-14 w-14 place-items-center rounded-full bg-white text-2xl font-bold text-[#5B3CC4] shadow-md focus-visible:outline-4 focus-visible:outline-sky-400">
      {dir === 'prev' ? '‹' : '›'}
    </Link>
  )
}

/** Big word with letters that bounce while it is being spoken. */
function WordLetters({ word, color, active }: { word: string; color: string; active: boolean }) {
  const reduce = useReducedMotion()
  return (
    <h1 className="flex flex-wrap font-display text-6xl font-bold tracking-wide sm:text-7xl" style={{ color }} aria-label={word}>
      {word.toUpperCase().split('').map((ch, i) => (
        <motion.span key={i} aria-hidden className="inline-block" style={{ textShadow: '0 5px 0 rgba(0,0,0,0.08)' }}
          initial={reduce ? false : { y: 30, opacity: 0 }}
          animate={active && !reduce ? { y: [0, -16, 0], scale: [1, 1.2, 1], opacity: 1 } : { y: 0, opacity: 1 }}
          transition={{ delay: i * 0.06, duration: 0.45 }}>
          {ch === ' ' ? ' ' : ch}
        </motion.span>
      ))}
    </h1>
  )
}

function Sentence({ text, word, color, active }: { text: string; word: string; color: string; active: boolean }) {
  const key = word.toLowerCase().split(' ')[0]
  return (
    <p className={`mt-2 text-2xl leading-relaxed transition-colors sm:text-3xl ${active ? 'text-[#2B1F4A]' : 'text-[#3B2F55]'}`}>
      {text.split(' ').map((t, i) => {
        const hit = t.toLowerCase().replace(/[^a-z]/g, '').startsWith(key)
        return (
          <span key={i}>
            {hit ? <mark className="rounded-lg px-1 font-bold" style={{ background: `${color}22`, color }}>{t}</mark> : t}{' '}
          </span>
        )
      })}
    </p>
  )
}

/** Visual context: a little animated emoji story (custom "eating" scene for Apple). */
function Scene({ item, cat }: { item: VocabItem; cat: Category }) {
  const reduce = useReducedMotion()
  const [bites, setBites] = useState(0)
  useEffect(() => {
    if (item.asset !== 'apple' || reduce) return
    const t = setInterval(() => setBites((b) => (b + 1) % 4), 900)
    return () => clearInterval(t)
  }, [item.asset, reduce])

  return (
    <div className="mt-4 flex items-center justify-center gap-3 rounded-[24px] p-4" style={{ background: cat.bg }} aria-label="Picture story">
      {item.asset === 'apple' ? (
        <>
          <motion.span className="emoji-3d text-6xl" animate={reduce ? undefined : { rotate: [0, -6, 0] }} transition={{ duration: 0.9, repeat: Infinity }} aria-hidden>🧒</motion.span>
          <AppleArt size={80} bites={bites} />
          <span className="emoji-3d text-5xl" aria-hidden>{bites === 3 ? '😋' : '🤤'}</span>
        </>
      ) : (
        item.scene.map((s, i) => (
          <motion.span key={i} className="emoji-3d text-5xl" aria-hidden
            initial={reduce ? false : { scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.25, type: 'spring', stiffness: 220, damping: 12 }}>{s}</motion.span>
        ))
      )}
    </div>
  )
}

type RepeatStep = 'idle' | 'listen' | 'turn' | 'done'
function ListenRepeat({ item, color, sayWord }: { item: VocabItem; color: string; sayWord: () => Promise<void> }) {
  const { markRepeated } = useProgress()
  const [step, setStep] = useState<RepeatStep>('idle')
  const [gotStar, setGotStar] = useState(false)
  const start = async () => {
    setStep('listen')
    await sayWord()
    setStep('turn')
  }
  const said = () => {
    sfx.correct()
    setGotStar(markRepeated(item.id))
    setStep('done')
  }
  return (
    <Card className="p-6">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-[#9A8FB3]">Listen and repeat</p>
      <div className="mt-3 flex flex-wrap items-center gap-4" aria-live="polite">
        {step === 'idle' && <Button tone="sky" onClick={() => void start()}>👂 Listen, then say it</Button>}
        {step === 'listen' && <p className="flex items-center gap-3 font-display text-xl font-semibold text-[#2B1F4A]"><Waveform active color={color} /> Listen…</p>}
        {step === 'turn' && (
          <>
            <motion.span className="grid h-16 w-16 place-items-center rounded-full text-3xl" style={{ background: `${color}22` }}
              animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1, repeat: Infinity }} aria-hidden>🎤</motion.span>
            <p className="font-display text-xl font-semibold text-[#2B1F4A]">Your turn! Say “{item.word}”</p>
            <Button tone="leaf" onClick={said}>I said it! 🎉</Button>
          </>
        )}
        {step === 'done' && (
          <>
            <p className="font-display text-xl font-semibold text-[#2B8A3E]">Great speaking! {gotStar ? '+1 ⭐' : '👏'}</p>
            <Button tone="white" size="sm" onClick={() => void start()}>Again</Button>
          </>
        )}
      </div>
    </Card>
  )
}

/** Small reinforcement activity: pick the right picture out of two. */
function QuickCheck({ item, cat }: { item: VocabItem; cat: Category }) {
  const { answer } = useProgress()
  const { speak } = useSpeech()
  const options = useMemo(() => {
    const others = wordsInCategory(item.categoryId).filter((w) => w.id !== item.id)
    const other = others[Math.floor(Math.random() * others.length)]
    return Math.random() < 0.5 ? [item, other] : [other, item]
  }, [item])
  const [picked, setPicked] = useState<string | null>(null)
  const [tries, setTries] = useState(0)
  const solved = picked === item.id

  const choose = (w: VocabItem) => {
    if (solved) return
    setPicked(w.id)
    if (tries === 0) answer(item.id, w.id === item.id)
    setTries((t) => t + 1)
    if (w.id === item.id) { sfx.correct(); void speak(`Yes! That is the ${item.word}!`) }
    else { sfx.tryAgain(); void speak(`That is the ${w.word}. Try again!`) }
  }

  return (
    <Card className="p-6">
      <p className="font-display text-sm font-semibold uppercase tracking-wide text-[#9A8FB3]">Quick check</p>
      <p className="mt-1 font-display text-2xl font-bold text-[#2B1F4A]">Tap the {item.word}!</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {options.map((w) => {
          const state = picked === w.id ? (w.id === item.id ? 'right' : 'wrong') : 'none'
          return (
            <motion.button key={w.id} type="button" onClick={() => choose(w)}
              animate={state === 'wrong' ? { x: [0, -10, 10, -6, 6, 0] } : state === 'right' ? { scale: [1, 1.1, 1] } : {}}
              className={`grid h-32 place-items-center rounded-[24px] border-4 text-7xl transition-colors focus-visible:outline-4 focus-visible:outline-sky-400 ${state === 'right' ? 'border-[#4CC26B] bg-[#E6F8EA]' : state === 'wrong' ? 'border-[#FFC83D] bg-[#FFF8E1]' : 'border-transparent'}`}
              style={state === 'none' ? { background: cat.bg } : undefined}
              aria-label={w.glyph ?? 'picture option'}>
              <span className="emoji-3d" aria-hidden>{w.glyph ? <span className="font-display font-bold" style={{ color: cat.color }}>{w.glyph}</span> : w.emoji}</span>
            </motion.button>
          )
        })}
      </div>
      <p className="mt-3 min-h-7 font-display text-lg font-semibold" aria-live="polite">
        {solved ? <span className="text-[#2B8A3E]">Yes! You found it! 🎉</span>
          : picked ? <span className="text-[#B07A00]">Almost! Hint: {item.hint}</span> : null}
      </p>
    </Card>
  )
}
