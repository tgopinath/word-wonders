import type { TargetAndTransition, Transition } from 'framer-motion'
import type { AnimType } from '../types'

/**
 * Animation configs for vocabulary objects.
 * `idle` loops gently while the object waits; `action` plays once when tapped.
 */
interface AnimSpec { idle: TargetAndTransition; action: TargetAndTransition }

const loop = (duration: number, extra: Transition = {}): Transition => ({ duration, repeat: Infinity, ease: 'easeInOut', ...extra })
const once = (duration: number, extra: Transition = {}): Transition => ({ duration, ease: 'easeInOut', ...extra })

const floatIdle: TargetAndTransition = { y: [0, -8, 0], transition: loop(3) }

export const OBJECT_ANIMATIONS: Record<AnimType, AnimSpec> = {
  bounce: { idle: floatIdle, action: { y: [0, -70, 0, -30, 0, -10, 0], rotate: [0, -10, 0, 360, 360], scale: [1, 1.15, 0.9, 1.08, 1], transition: once(1.3) } },
  rotate: { idle: { rotate: [-4, 4, -4], transition: loop(3.5) }, action: { rotate: [0, 360], scale: [1, 1.2, 1], transition: once(1.1) } },
  float: { idle: { y: [0, -12, 0], transition: loop(4) }, action: { y: [0, -60, -40, -70, 0], x: [0, 20, -20, 10, 0], transition: once(2) } },
  wiggle: { idle: { rotate: [0, -3, 3, 0], transition: loop(2.5) }, action: { rotate: [0, -18, 18, -14, 14, -8, 8, 0], scale: [1, 1.15, 1.15, 1], transition: once(1) } },
  fly: { idle: { y: [0, -10, 0], rotate: [-3, 3, -3], transition: loop(2.2) }, action: { x: [0, 90, 40, -90, -40, 0], y: [0, -60, -100, -50, -80, 0], rotate: [0, 12, -8, -12, 6, 0], transition: once(2.2) } },
  walk: { idle: { rotate: [-2, 2, -2], transition: loop(1.6) }, action: { x: [0, 60, 60, -60, -60, 0], scaleX: [1, 1, -1, -1, 1, 1], y: [0, -8, 0, -8, 0, -8, 0], transition: once(2.2) } },
  jump: { idle: floatIdle, action: { y: [0, 10, -110, 0, 6, 0], scaleY: [1, 0.75, 1.15, 0.85, 1.05, 1], transition: once(1.1) } },
  hop: { idle: { y: [0, -6, 0], transition: loop(1.4) }, action: { x: [0, 40, 80, 40, 0], y: [0, -70, 0, -70, 0], transition: once(1.5) } },
  open: { idle: floatIdle, action: { scaleX: [1, 1.35, 0.9, 1.1, 1], scaleY: [1, 0.85, 1.1, 0.95, 1], rotate: [0, -6, 6, 0], transition: once(1.2) } },
  grow: { idle: { scale: [1, 1.04, 1], transition: loop(2.8) }, action: { scale: [1, 0.6, 1.45, 0.9, 1.1, 1], transition: once(1.3) } },
  spin: { idle: { rotate: [0, 6, 0, -6, 0], transition: loop(3) }, action: { rotate: [0, 720], scale: [1, 1.25, 1], transition: once(1.2, { ease: 'easeOut' }) } },
  wave: { idle: { rotate: [-4, 4, -4], transition: loop(2) }, action: { rotate: [0, 22, -12, 22, -12, 18, 0], originX: 0.5, originY: 1, transition: once(1.4) } },
  path: { idle: floatIdle, action: { x: [0, 60, 0, -60, 0], y: [0, -40, -80, -40, 0], transition: once(2) } },
  swim: { idle: { x: [-6, 6, -6], rotate: [-3, 3, -3], transition: loop(2.6) }, action: { x: [0, 100, 100, -100, -100, 0], y: [0, -20, 10, -20, 10, 0], scaleX: [1, 1, -1, -1, 1, 1], transition: once(2.4) } },
  drive: { idle: { y: [0, -2, 0], transition: loop(0.5) }, action: { x: [0, -20, 160, -160, 0], opacity: [1, 1, 0, 0, 1], transition: once(1.8, { times: [0, 0.15, 0.5, 0.51, 1] }) } },
  roar: { idle: floatIdle, action: { scale: [1, 0.92, 1.35, 1.3, 1.35, 1], rotate: [0, 0, -4, 4, -4, 0], transition: once(1.4) } },
  swing: { idle: { rotate: [-6, 6, -6], originY: 0, transition: loop(2.4) }, action: { rotate: [0, 35, -35, 25, -25, 10, 0], originY: 0, transition: once(1.8) } },
  peel: { idle: { rotate: [-4, 4, -4], transition: loop(3) }, action: { rotate: [0, -8, 8, -4, 0], scale: [1, 1.15, 1.15, 1.15, 1], transition: once(2.6) } },
  split: { idle: floatIdle, action: { scale: [1, 1.2, 1.2, 1], rotate: [0, -8, 8, 0], transition: once(1.4) } },
  flap: { idle: { y: [0, -6, 0], transition: loop(1.2) }, action: { y: [0, -60, -40, -80, 0], scaleX: [1, 0.8, 1.1, 0.8, 1.1, 1], transition: once(1.6) } },
  shake: { idle: { rotate: [0, -2, 2, 0], transition: loop(2.2) }, action: { x: [0, -16, 16, -12, 12, -6, 6, 0], transition: once(0.9) } },
  pulse: { idle: { scale: [1, 1.05, 1], transition: loop(1.8) }, action: { scale: [1, 1.3, 1, 1.3, 1], transition: once(1.1) } },
  sway: { idle: { rotate: [-5, 5, -5], transition: loop(3.2) }, action: { rotate: [0, -20, 20, -14, 14, 0], x: [0, -20, 20, -10, 10, 0], transition: once(1.6) } },
  rain: { idle: floatIdle, action: { y: [0, -30, 0, -20, 0], scale: [1, 1.1, 1, 1.05, 1], transition: once(1.4) } },
}

export const ANIMATION_TYPES = Object.keys(OBJECT_ANIMATIONS) as AnimType[]
