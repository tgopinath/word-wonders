import { useMemo, useState } from 'react'
import { Button, Card } from '../components/ui'
import { categoryById } from '../data/categories'
import { VOCABULARY, wordById } from '../data/vocabulary'
import { statusOf, today, type Profile } from '../services/progress'
import { useProgress } from '../state/ProgressProvider'

const AVATARS = ['🦊', '🐼', '🐯', '🐸', '🦄', '🐵', '🐧', '🐨', '🦁', '🐰']

/** Simple grown-up gate: a multiplication question young children can't easily answer. */
function Gate({ onPass }: { onPass: () => void }) {
  const q = useMemo(() => {
    const a = 3 + Math.floor(Math.random() * 6), b = 4 + Math.floor(Math.random() * 6)
    return { a, b }
  }, [])
  const [v, setV] = useState('')
  const [err, setErr] = useState(false)
  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <p className="text-6xl" aria-hidden>🔒</p>
      <h1 className="mt-3 font-display text-3xl font-bold text-[#2B1F4A]">For grown-ups</h1>
      <p className="mt-1 text-[#6B5F86]">Please answer to continue.</p>
      <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); if (Number(v) === q.a * q.b) onPass(); else { setErr(true); setV('') } }}>
        <label className="block font-display text-2xl font-bold text-[#2B1F4A]" htmlFor="gate">What is {q.a} × {q.b}?</label>
        <input id="gate" inputMode="numeric" value={v} onChange={(e) => { setV(e.target.value.replace(/\D/g, '')); setErr(false) }} autoFocus
          className="min-h-14 w-40 rounded-2xl bg-[#F6F2FF] text-center font-display text-2xl outline-none focus-visible:outline-4 focus-visible:outline-sky-400" />
        {err && <p className="font-semibold text-[#C2410C]" role="alert">That’s not right. Try again.</p>}
        <div><Button tone="grape" type="submit">Continue</Button></div>
      </form>
    </Card>
  )
}

export function Parent() {
  const [ok, setOk] = useState(false)
  if (!ok) return <Gate onPass={() => setOk(true)} />
  return <Dashboard />
}

function Dashboard() {
  const { state, profile, progress, updateProfile, addProfile, switchProfile, updateSettings, resetProgress } = useProgress()
  const [confirmReset, setConfirmReset] = useState(false)
  const [adding, setAdding] = useState(false)
  const s = state.settings

  const words = Object.entries(progress.words)
  const explored = words.filter(([, w]) => w.explored).length
  const mastered = words.filter(([, w]) => statusOf(w) === 'mastered').map(([id]) => wordById(id)).filter((w) => !!w)
  const difficult = words.filter(([, w]) => w.incorrect > 0).sort(([, a], [, b]) => b.incorrect - a.incorrect).slice(0, 12)
  const acc = progress.quiz.total ? Math.round((progress.quiz.correct / progress.quiz.total) * 100) : null
  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86_400_000)
    return { day: d.toLocaleDateString(undefined, { weekday: 'short' }), min: Math.round((progress.secondsByDay[today(d)] ?? 0) / 60) }
  })
  const maxMin = Math.max(5, ...last7.map((d) => d.min))

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold text-[#2B1F4A]">Parent dashboard</h1>

      {/* Profiles */}
      <Card className="p-5">
        <h2 className="font-display text-xl font-bold text-[#2B1F4A]">Child profiles</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {state.profiles.map((p) => (
            <button key={p.id} type="button" onClick={() => switchProfile(p.id)} aria-pressed={p.id === profile.id}
              className={`flex min-h-14 items-center gap-2 rounded-full px-4 font-display font-semibold focus-visible:outline-4 focus-visible:outline-sky-400 ${p.id === profile.id ? 'bg-[#8C5CE6] text-white' : 'bg-[#F6F2FF] text-[#3B2F55]'}`}>
              <span className="text-2xl" aria-hidden>{p.avatar}</span>{p.name}
            </button>
          ))}
          <Button size="sm" tone="white" onClick={() => setAdding(true)}>+ Add child</Button>
        </div>
        {adding && <NewProfile onDone={(p) => { if (p) addProfile(p); setAdding(false) }} />}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Active profile */}
        <Card className="space-y-4 p-5">
          <h2 className="font-display text-xl font-bold text-[#2B1F4A]">{profile.name}’s profile</h2>
          <ProfileFields value={profile} onChange={(patch) => updateProfile(profile.id, patch)} />
          <p className="text-sm text-[#9A8FB3]">Only a nickname is stored, on this device. Nothing is sent anywhere.</p>
        </Card>

        {/* Settings */}
        <Card className="space-y-4 p-5">
          <h2 className="font-display text-xl font-bold text-[#2B1F4A]">Learning preferences</h2>
          <Toggle label="Sound effects" checked={s.soundEffects} onChange={(v) => updateSettings({ soundEffects: v })} />
          <Toggle label="Slow pronunciation by default" checked={s.slowSpeech} onChange={(v) => updateSettings({ slowSpeech: v })} />
          <label className="flex items-center justify-between gap-3">
            <span className="font-semibold text-[#3B2F55]">Daily learning limit</span>
            <select value={s.dailyLimitMin} onChange={(e) => updateSettings({ dailyLimitMin: Number(e.target.value) })}
              className="min-h-12 rounded-xl bg-[#F6F2FF] px-3 font-semibold focus-visible:outline-4 focus-visible:outline-sky-400">
              {[0, 10, 15, 20, 30, 45, 60].map((m) => <option key={m} value={m}>{m === 0 ? 'No limit' : `${m} minutes`}</option>)}
            </select>
          </label>
          <div className="border-t border-[#F0EBF8] pt-4">
            {!confirmReset
              ? <Button size="sm" tone="white" onClick={() => setConfirmReset(true)}>Reset {profile.name}’s progress…</Button>
              : (
                <div className="flex flex-wrap items-center gap-3" role="alert">
                  <span className="font-semibold text-[#C2410C]">This erases stars, badges and words for {profile.name}. It can’t be undone.</span>
                  <Button size="sm" tone="berry" onClick={() => { resetProgress(); setConfirmReset(false) }}>Yes, reset</Button>
                  <Button size="sm" tone="white" onClick={() => setConfirmReset(false)}>Cancel</Button>
                </div>
              )}
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Words explored', `${explored}/${VOCABULARY.length}`],
          ['Mastered', mastered.length],
          ['Quiz accuracy', acc === null ? '—' : `${acc}%`],
          ['Lessons completed', Object.keys(progress.lessons).length],
        ].map(([l, v]) => (
          <Card key={l} className="p-4"><p className="font-display text-3xl font-bold text-[#2B1F4A]">{v}</p><p className="text-sm text-[#6B5F86]">{l}</p></Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-display text-xl font-bold text-[#2B1F4A]">Time spent (minutes)</h2>
          <div className="mt-4 flex h-40 items-end gap-3" role="img" aria-label={`Minutes per day: ${last7.map((d) => `${d.day} ${d.min}`).join(', ')}`}>
            {last7.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-[#6B5F86]">{d.min}</span>
                <div className="w-full rounded-t-lg bg-[#8C5CE6]" style={{ height: `${(d.min / maxMin) * 110 + 2}px` }} />
                <span className="text-xs text-[#9A8FB3]">{d.day}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-display text-xl font-bold text-[#2B1F4A]">Words that need practice</h2>
          {difficult.length === 0 ? <p className="mt-3 text-[#6B5F86]">No tricky words yet.</p> : (
            <ul className="mt-3 divide-y divide-[#F0EBF8]">
              {difficult.map(([id, w]) => {
                const item = wordById(id)
                if (!item) return null
                return (
                  <li key={id} className="flex items-center gap-3 py-2">
                    <span className="text-2xl" aria-hidden>{item.emoji ?? item.glyph}</span>
                    <span className="flex-1 font-semibold">{item.word} <span className="text-sm font-normal text-[#9A8FB3]">· {categoryById(item.categoryId)?.name}</span></span>
                    <span className="text-sm text-[#6B5F86]">✓ {w.correct} · ✗ {w.incorrect}</span>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-display text-xl font-bold text-[#2B1F4A]">Mastered words</h2>
        <p className="mt-2 text-[#3B2F55]">{mastered.length ? mastered.map((w) => w.word).join(', ') : 'Words answered correctly several times in a row will appear here.'}</p>
      </Card>
    </div>
  )
}

function ProfileFields({ value, onChange }: { value: Pick<Profile, 'name' | 'avatar' | 'ageGroup' | 'difficulty'>; onChange: (p: Partial<Profile>) => void }) {
  return (
    <>
      <label className="block">
        <span className="font-semibold text-[#3B2F55]">Nickname</span>
        <input value={value.name} maxLength={20} onChange={(e) => onChange({ name: e.target.value })}
          className="mt-1 min-h-12 w-full rounded-xl bg-[#F6F2FF] px-3 text-lg outline-none focus-visible:outline-4 focus-visible:outline-sky-400" />
      </label>
      <fieldset>
        <legend className="font-semibold text-[#3B2F55]">Avatar</legend>
        <div className="mt-1 flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button key={a} type="button" onClick={() => onChange({ avatar: a })} aria-pressed={value.avatar === a} aria-label={`Avatar ${a}`}
              className={`grid h-12 w-12 place-items-center rounded-full text-2xl focus-visible:outline-4 focus-visible:outline-sky-400 ${value.avatar === a ? 'bg-[#8C5CE6] ring-4 ring-[#D9CCFF]' : 'bg-[#F6F2FF]'}`}>{a}</button>
          ))}
        </div>
      </fieldset>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="font-semibold text-[#3B2F55]">Age group</span>
          <select value={value.ageGroup} onChange={(e) => onChange({ ageGroup: e.target.value as Profile['ageGroup'] })}
            className="mt-1 min-h-12 w-full rounded-xl bg-[#F6F2FF] px-3 focus-visible:outline-4 focus-visible:outline-sky-400">
            <option value="3-5">3–5 years</option><option value="6-8">6–8 years</option><option value="9-10">9–10 years</option>
          </select>
        </label>
        <label className="block">
          <span className="font-semibold text-[#3B2F55]">Difficulty</span>
          <select value={value.difficulty} onChange={(e) => onChange({ difficulty: Number(e.target.value) as Profile['difficulty'] })}
            className="mt-1 min-h-12 w-full rounded-xl bg-[#F6F2FF] px-3 focus-visible:outline-4 focus-visible:outline-sky-400">
            <option value={1}>Beginner</option><option value={2}>Intermediate</option><option value={3}>Advanced</option>
          </select>
        </label>
      </div>
    </>
  )
}

function NewProfile({ onDone }: { onDone: (p: Omit<Profile, 'id' | 'createdAt'> | null) => void }) {
  const [p, setP] = useState<Omit<Profile, 'id' | 'createdAt'>>({ name: '', avatar: '🐼', ageGroup: '3-5', difficulty: 1 })
  return (
    <div className="mt-4 space-y-4 rounded-2xl bg-[#FFF9F0] p-4">
      <ProfileFields value={p} onChange={(patch) => setP((x) => ({ ...x, ...patch }))} />
      <div className="flex gap-3">
        <Button size="sm" tone="leaf" disabled={!p.name.trim()} onClick={() => onDone({ ...p, name: p.name.trim() })}>Create profile</Button>
        <Button size="sm" tone="white" onClick={() => onDone(null)}>Cancel</Button>
      </div>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span className="font-semibold text-[#3B2F55]">{label}</span>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
        className={`relative h-9 w-16 rounded-full transition-colors focus-visible:outline-4 focus-visible:outline-sky-400 ${checked ? 'bg-[#4CC26B]' : 'bg-[#D8D2E6]'}`}>
        <span className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${checked ? 'left-8' : 'left-1'}`} />
      </button>
    </label>
  )
}
