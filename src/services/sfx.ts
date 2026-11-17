/** Tiny synthesized sound effects (no audio files needed). */
let ctx: AudioContext | null = null
let enabled = true

export const setSfxEnabled = (on: boolean) => { enabled = on }

function ac() {
  if (!ctx) {
    const C = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!C) return null
    ctx = new C()
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  const c = ac()
  if (!c) return
  const t = c.currentTime + start
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export const sfx = {
  tap() { if (enabled) tone(660, 0, 0.09, 'triangle', 0.12) },
  pop() { if (enabled) { tone(520, 0, 0.08, 'sine'); tone(880, 0.05, 0.1, 'sine') } },
  correct() { if (enabled) [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.08, 0.22, 'triangle')) },
  tryAgain() { if (enabled) { tone(392, 0, 0.16, 'sine', 0.12); tone(330, 0.14, 0.22, 'sine', 0.12) } },
  star() { if (enabled) { tone(1175, 0, 0.12, 'sine', 0.12); tone(1568, 0.08, 0.2, 'sine', 0.12) } },
  celebrate() {
    if (!enabled) return
    ;[523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25, 'triangle', 0.16))
  },
}
