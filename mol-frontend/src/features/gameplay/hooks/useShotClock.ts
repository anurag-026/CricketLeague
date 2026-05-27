import { useEffect, useState } from 'react'

const BALL_SECONDS = 6

export interface UseShotClockOptions {
  deadlineEpochMs?: number | null
}

export function useShotClock({ deadlineEpochMs }: UseShotClockOptions = {}) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!deadlineEpochMs) return

    const sync = window.setTimeout(() => setNow(Date.now()), 0)
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => {
      window.clearTimeout(sync)
      window.clearInterval(id)
    }
  }, [deadlineEpochMs])

  const secondsLeft = !deadlineEpochMs
    ? BALL_SECONDS
    : Math.max(0, Math.min(BALL_SECONDS, Math.ceil((deadlineEpochMs - now) / 1000)))

  const filledSegments = Math.max(0, Math.min(BALL_SECONDS, secondsLeft))

  return {
    secondsLeft,
    totalSegments: BALL_SECONDS,
    filledSegments,
  }
}
