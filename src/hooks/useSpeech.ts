import { useCallback, useEffect, useState } from 'react'
import { pronunciation } from '../services/audio'
import { useProgress } from '../state/ProgressProvider'

/** Speak text through the pronunciation service and expose what is being spoken. */
export function useSpeech() {
  const { state } = useProgress()
  const [speaking, setSpeaking] = useState<string | null>(null)

  useEffect(() => pronunciation.subscribe(setSpeaking), [])
  useEffect(() => () => pronunciation.stop(), [])

  const speak = useCallback(
    (text: string, opts: { slow?: boolean; src?: string } = {}) =>
      pronunciation.speak(text, { slow: opts.slow ?? state.settings.slowSpeech, src: opts.src }),
    [state.settings.slowSpeech],
  )

  return { speak, speaking, available: pronunciation.available, stop: () => pronunciation.stop() }
}
