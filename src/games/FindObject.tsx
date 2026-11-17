import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AnimatedObject } from '../components/AnimatedObject'
import { Confetti } from '../components/Celebration'
import { BackLink, Button, Card, ProgressBar, Waveform } from '../components/ui'
import { categoryById } from '../data/categories'
import { lessonById, lessonsForCategory, VOCABULARY, wordById, wordsInCategory } from '../data/vocabulary'
import { useSpeech } from '../hooks/useSpeech'
import { dueWords } from '../services/progress'
import { sfx } from '../services/sfx'
import { useProgress } from '../state/ProgressProvider'
import type { VocabItem } from '../types'
import { buildRounds, MAX_STARS_PER_ROUND, starsFor, type Round } from './findLogic'

type Phase = 'intro' | 'play' | 'results'

export function FindObjectGame() {
  const { lessonId = '' } = useParams()
  const { progress } = useProgress()

  // Resolve the word pool once per mount: a lesson, or the revision list.
  const setup = useMemo(() => {
    if (lessonId === 'review') {
      const ids = dueWords(progress)
      const fill = progress.recent.filter((id) => !ids.includes(id))
      const pool = [...ids, ...fill].map((id) => wordById(id)).filter((w): w is VocabItem => !!w).slice(0, 8)
      return { title: 'Revision time', pool, distractors: VOCABULARY, backTo: '/learning', backLabel: 'My Learning', color: '#8C5CE6', bg: '#EEE6FF', lessonKey: null as string | null }
    }
    const lesson = lessonById(lessonId)
    if (!lesson) return null
    const cat = categoryById(lesson.categoryId)!
    return {
      title: `${cat.name} · Lesson ${lesson.index + 1}`,
      pool: lesson.wordIds.map((id) => wordById(id)!),
      distractors: wordsInCategory(cat.id),
      backTo: `/category/${cat.id}`, backLabel: cat.name, color: cat.color, bg: cat.bg, lessonKey: lesson.id,
    }
  }, [lessonId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!setup) {
    return <Card className="p-10 text-center"><p className="text-6xl">🧐</p><p className="mt-3 font-display text-2xl font-bold">That game could not be found.</p><BackLink to="/games" label="Games" /></Card>
  }
  if (setup.pool.length < 2) {
    return (
      <div className="space-y-4">
        <BackLink to={setup.backTo} label={setup.backLabel} />
        <Card className="p-10 text-center">
          <p className="text-6xl" aria-hidden>🌱</p>
          <h1 className="mt-3 font-display text-2xl font-bold text-[#2B1F4A]">Nothing to practise yet</h1>
          <p className="mt-2 text-[#6B5F86]">Explore some words and play a game first. Words you find tricky will come back here.</p>
        </Card>
      </div>
    )
  }
  return <Game key={lessonId} {...setup} />
}

interface GameProps {
  title: string; pool: VocabItem[]; distractors: VocabItem[]
  backTo: string; backLabel: string; color: string; bg: string; lessonKey: string | null
}

function Game({ title, pool, distractors, backTo, backLabel, color, bg, lessonKey }: GameProps) {
  const nav = useNavigate()
  const { answer, completeLesson, addStars } = useProgress()
  const { speak, speaking } = useSpeech()
  const [phase, setPhase] = useState<Phase>('intro')
  const [rounds, setRounds] = useState<Round[]>(() => buildRounds(pool, distractors))
  const [i, setI] = useState(0)
  const [wrongs, setWrongs] = useState<string[]>([])
  const [solved, setSolved] = useState(false)
  const [playKey, setPlayKey] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [reward, setReward] = useState<{ bonus: number; firstTime: boolean } | null>(null)
  const savedRef = useRef(false)

  const round = rounds[i]
  const target = round?.target
  const question = target ? `Where is the ${target.word}?` : ''

  useEffect(() => {
    if (phase === 'play' && target) void speak(question)
  }, [phase, i]) // eslint-disable-line react-hooks/exhaustive-deps

  // Save the result exactly once when the results screen appears.
  useEffect(() => {
    if (phase !== 'results' || savedRef.current) return
    savedRef.current = true
    const total = scores.reduce((a, b) => a + b, 0)
    if (lessonKey) setReward(completeLesson(lessonKey, total))
    else { addStars(total); setReward({ bonus: 0, firstTime: false }) }
    sfx.celebrate()
    void speak(total >= rounds.length * MAX_STARS_PER_ROUND - 1 ? 'Amazing! You are a superstar!' : 'Well done! You did it!')
  }, [phase]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (w: VocabItem) => {
    if (solved || !target) return
    if (w.id === target.id) {
      sfx.correct()
      setSolved(true)
      setPlayKey((k) => k + 1)
      const s = starsFor(wrongs.length)
      setScores((sc) => [...sc, s])
      if (wrongs.length === 0) answer(target.id, true)
      setTimeout(() => sfx.star(), 350)
      void speak(`Excellent! You found the ${target.word}!`)
    } else {
      if (wrongs.includes(w.id)) return
      sfx.tryAgain()
      if (wrongs.length === 0) answer(target.id, false)
      setWrongs((ws) => [...ws, w.id])
      void speak(`That is the ${w.word}. ${target.hint} Try again!`)
    }
  }

  const nextRound = () => {
    if (i + 1 >= rounds.length) { setPhase('results'); return }
    setI(i + 1); setWrongs([]); setSolved(false); setPlayKey(0)
  }

  const replay = () => {
    setRounds(buildRounds(pool, distractors))
    setI(0); setWrongs([]); setSolved(false); setScores([]); setReward(null); setPlayKey(0)
    savedRef.current = false
    setPhase('play')
  }

  // ---------- Intro ----------
  if (phase === 'intro') {
    return (
      <div className="space-y-5">
        <BackLink to={backTo} label={backLabel} />
        <Card className="mx-auto max-w-xl p-8 text-center" style={{ background: bg }}>
          <motion.p className="emoji-3d text-8xl" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} aria-hidden>🎯</motion.p>
          <h1 className="mt-3 font-display text-4xl font-bold text-[#2B1F4A]">Find the Object</h1>
          <p className="font-display font-semibold" style={{ color }}>{title}</p>
          <ol className="mx-auto mt-5 max-w-sm space-y-2 text-left text-lg text-[#3B2F55]">
            <li>👂 Listen to the question.</li>
            <li>👆 Tap the right picture.</li>
            <li>⭐ Win 2 stars on the first try, 1 star after a hint.</li>
          </ol>
          <p className="mt-4 text-[#6B5F86]">{rounds.length} rounds · no rush, take your time!</p>
          <Button className="mt-6" size="lg" tone="leaf" onClick={() => setPhase('play')} autoFocus>Start ▶</Button>
        </Card>
      </div>
    )
  }

  // ---------- Results ----------
  if (phase === 'results') {
    const total = scores.reduce((a, b) => a + b, 0)
    const max = rounds.length * MAX_STARS_PER_ROUND
    const firstTry = scores.filter((s) => s === MAX_STARS_PER_ROUND).length
    const lesson = lessonKey ? lessonById(lessonKey) : undefined
    const nextLesson = lesson ? lessonsForCategory(lesson.categoryId)[lesson.index + 1] : undefined
    const trophies = total >= max ? 3 : total >= max * 0.6 ? 2 : 1
    return (
      <div className="space-y-5">
        <Confetti />
        <Card className="mx-auto max-w-xl p-8 text-center">
          <p className="font-display text-lg font-semibold" style={{ color }}>{title}</p>
          <h1 className="font-display text-4xl font-bold text-[#2B1F4A]">{trophies === 3 ? 'Perfect!' : trophies === 2 ? 'Great job!' : 'Well done!'}</h1>
          <div className="my-5 flex justify-center gap-2" aria-label={`${trophies} of 3 big stars`}>
            {[0, 1, 2].map((k) => (
              <motion.span key={k} className="text-6xl" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + k * 0.25, type: 'spring', stiffness: 220, damping: 10 }} style={{ filter: k < trophies ? undefined : 'grayscale(1) opacity(0.3)' }} aria-hidden>⭐</motion.span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Stars won" value={`+${total}`} />
            <Stat label="First try" value={`${firstTry}/${rounds.length}`} />
            <Stat label="Bonus" value={reward?.bonus ? `+${reward.bonus}` : '—'} />
          </div>
          {reward?.firstTime && <p className="mt-4 rounded-2xl bg-[#FFF3C4] p-3 font-display font-semibold text-[#8A5A00]">🏆 Lesson complete! You earned a 5-star bonus.</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button tone="sun" onClick={replay}>🔁 Play again</Button>
            {nextLesson && <Button tone="leaf" onClick={() => nav(`/word/${nextLesson.wordIds[0]}`)}>Next lesson →</Button>}
            <Button tone="white" onClick={() => nav(backTo)}>{backLabel}</Button>
          </div>
        </Card>
      </div>
    )
  }

  // ---------- Play ----------
  const showHelp = wrongs.length >= 2
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BackLink to={backTo} label="Quit" />
        <ProgressBar className="flex-1" value={(i + (solved ? 1 : 0)) / rounds.length} color={color} />
        <span className="font-display font-bold text-[#8A5A00]">⭐ {scores.reduce((a, b) => a + b, 0)}</span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-center">
        <h1 className="font-display text-3xl font-bold text-[#2B1F4A] sm:text-4xl">
          Where is the <span style={{ color }}>{target.word}</span>?
        </h1>
        <button type="button" onClick={() => void speak(question)} aria-label="Hear the question again"
          className="inline-flex min-h-12 items-center gap-2 rounded-full px-4 text-white shadow focus-visible:outline-4 focus-visible:outline-sky-400" style={{ background: color }}>
          🔊 <Waveform active={speaking === question} color="#fff" />
        </button>
      </div>

      <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:gap-6">
        {round.options.map((w) => {
          const isWrong = wrongs.includes(w.id)
          const isRight = solved && w.id === target.id
          const glow = showHelp && !solved && w.id === target.id
          return (
            <motion.div key={w.id}
              animate={isWrong ? { x: [0, -12, 12, -8, 8, 0], opacity: 0.55 } : glow ? { scale: [1, 1.05, 1] } : { opacity: solved && !isRight ? 0.4 : 1 }}
              transition={glow ? { duration: 1, repeat: Infinity } : { duration: 0.5 }}
              className={`grid place-items-center rounded-[32px] border-4 p-2 ${isRight ? 'border-[#4CC26B] bg-[#E6F8EA]' : glow ? 'border-[#FFC83D] bg-white' : 'border-transparent bg-white'} shadow-[0_8px_0_rgba(0,0,0,0.05)]`}>
              <AnimatedObject item={w} size={120} playKey={isRight ? playKey : 0} idle={!solved} onTap={() => pick(w)}
                label={`Option: ${w.glyph ?? 'picture'} ${isWrong ? '(not this one)' : ''}`} />
              <AnimatePresence>
                {(isWrong || isRight) && (
                  <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pb-2 font-display text-lg font-bold" style={{ color: isRight ? '#2B8A3E' : '#9A8FB3' }}>
                    {w.word}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      <div className="mx-auto min-h-24 max-w-3xl" aria-live="polite">
        <AnimatePresence mode="wait">
          {solved ? (
            <motion.div key="ok" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="flex flex-wrap items-center gap-4 rounded-[28px] bg-[#E6F8EA] p-5">
              <span className="text-5xl" aria-hidden>🎉</span>
              <div className="flex-1">
                <p className="font-display text-2xl font-bold text-[#2B8A3E]">Excellent! You found the {target.word}!</p>
                <p className="font-display font-semibold text-[#8A5A00]">+{scores[scores.length - 1]} ⭐</p>
              </div>
              <Button tone="leaf" onClick={nextRound} autoFocus>{i + 1 >= rounds.length ? 'See results' : 'Next'} →</Button>
            </motion.div>
          ) : wrongs.length > 0 ? (
            <motion.div key={`hint-${wrongs.length}`} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="flex items-center gap-4 rounded-[28px] bg-[#FFF8E1] p-5">
              <span className="text-4xl" aria-hidden>💡</span>
              <p className="font-display text-xl font-semibold text-[#8A5A00]">
                Good try! That’s the {wordById(wrongs[wrongs.length - 1])?.word}. Hint: {target.hint}
                {showHelp && ' Look for the glowing one!'}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#F6F2FF] p-3">
      <p className="font-display text-2xl font-bold text-[#2B1F4A]">{value}</p>
      <p className="text-sm text-[#6B5F86]">{label}</p>
    </div>
  )
}
