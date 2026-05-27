import { useEffect, useRef } from 'react'
import type { StompSubscription } from '@stomp/stompjs'
import { acquireStomp, releaseStomp, subscribe } from '@/shared/api/stompClient'
import type { MatchGameEvent } from '@/shared/types'

interface UseMatchTopicOptions {
  matchId: string
  enabled?: boolean
  onEvent: (event: MatchGameEvent) => void
  onConnectedChange?: (connected: boolean) => void
}

export function useMatchTopic({
  matchId,
  enabled = true,
  onEvent,
  onConnectedChange,
}: UseMatchTopicOptions) {
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (!enabled || !matchId) return

    let cancelled = false
    let subscription: StompSubscription | null = null

    void (async () => {
      try {
        await acquireStomp()
        if (cancelled) return
        onConnectedChange?.(true)
        subscription = subscribe(`/topic/match/${matchId}`, (message) => {
          try {
            const payload = JSON.parse(message.body) as MatchGameEvent
            onEventRef.current(payload)
          } catch {
            // ignore malformed frames
          }
        })
      } catch {
        if (!cancelled) onConnectedChange?.(false)
      }
    })()

    return () => {
      cancelled = true
      subscription?.unsubscribe()
      subscription = null
      onConnectedChange?.(false)
      releaseStomp()
    }
  }, [matchId, enabled, onConnectedChange])
}
