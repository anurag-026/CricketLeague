import { useEffect, useState } from 'react'

const BALL_SECONDS = 6

export interface UseShotClockOptions {
  deadlineEpochMs?: number | null
}

export function useShotClock({ deadlineEpochMs }: UseShotClockOptions = {}) {
  const [secondsLeft, setSecondsLeft] = useState(BALL_SECONDS)

  useEffect(() => {
    if (!deadlineEpochMs) {
      setSecondsLeft(BALL_SECONDS)
      return
    }

    function tick() {
      const remaining = Math.ceil((deadlineEpochMs! - Date.now()) / 1000)
      setSecondsLeft(Math.max(0, Math.min(BALL_SECONDS, remaining)))
    }

    tick()
    const id = window.setInterval(tick, 200)
    return () => window.clearInterval(id)
  }, [deadlineEpochMs])

  const filledSegments = Math.max(0, Math.min(BALL_SECONDS, secondsLeft))

  return {
    secondsLeft,
    totalSegments: BALL_SECONDS,
    filledSegments,
  }
}
