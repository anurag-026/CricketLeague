import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LobbyLocationState, MatchGameEvent, TeamId } from '@/shared/types'
import { applyMatchEvent } from '@/features/gameplay/lib/matchEvents'
import { useGameplayStore } from '@/features/gameplay/store'
import { useMatchTopic } from '@/features/gameplay/hooks/useMatchTopic'

interface UseLobbyMatchOptions {
  matchId: string | undefined
  team?: TeamId
  roomCode?: string
  enabled?: boolean
}

export function useLobbyMatch({
  matchId,
  team,
  roomCode,
  enabled = true,
}: UseLobbyMatchOptions) {
  const navigate = useNavigate()

  const goToArena = useCallback(
    (id: string, state?: Partial<LobbyLocationState>) => {
      navigate(`/match/${id}`, {
        replace: true,
        state: { mode: state?.mode ?? 'host', team, roomCode, ...state },
      })
    },
    [navigate, team, roomCode],
  )

  const handleEvent = useCallback(
    (event: MatchGameEvent) => {
      if (event.eventType === 'MATCH_START' && matchId) {
        applyMatchEvent(event)
        const store = useGameplayStore.getState()
        if (team) store.setLocalTeamId(team)
        goToArena(matchId, { mode: 'host' })
      }
    },
    [goToArena, matchId, team],
  )

  useMatchTopic({
    matchId: matchId ?? '',
    enabled: enabled && Boolean(matchId),
    onEvent: handleEvent,
  })

  return { goToArena }
}
