import { useCallback } from 'react'
import { applyMatchEvent } from '../lib/matchEvents'
import { useGameplayStore } from '../store'
import { useMatchTopic } from './useMatchTopic'

interface UseGameSocketOptions {
  matchId: string
  enabled?: boolean
}

export function useGameSocket({ matchId, enabled = true }: UseGameSocketOptions) {
  const setConnected = useGameplayStore((s) => s.setConnected)

  const handleEvent = useCallback((event: Parameters<typeof applyMatchEvent>[0]) => {
    applyMatchEvent(event)
  }, [])

  const handleConnected = useCallback(
    (connected: boolean) => {
      setConnected(connected)
    },
    [setConnected],
  )

  useMatchTopic({
    matchId,
    enabled,
    onEvent: handleEvent,
    onConnectedChange: handleConnected,
  })
}
