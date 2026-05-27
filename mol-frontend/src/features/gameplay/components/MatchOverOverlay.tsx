import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGameplayStore } from '@/features/gameplay/store'
import { formatMatchOverScoreLine } from '@/features/gameplay/lib/matchOverScoreLine'
import { isMatchDraw } from '@/features/gameplay/lib/isMatchDraw'

import type { MatchOverEvent } from '@/shared/types'

export interface MatchOverOverlayProps {
  event: MatchOverEvent
  localTeamId: string | null
}

export function MatchOverOverlay({ event, localTeamId }: MatchOverOverlayProps) {
  const navigate = useNavigate()
  const config = useGameplayStore((s) => s.config)
  const myDuel = useGameplayStore((s) => s.myDuel)
  const localPlayerId = useGameplayStore((s) => s.localPlayerId)
  const playerUsernames = useGameplayStore((s) => s.playerUsernames)

  const isDraw = isMatchDraw(event)
  const won = !isDraw && localTeamId != null && event.winner === localTeamId

  const scoreLine = useMemo(
    () =>
      formatMatchOverScoreLine(event, {
        teamSize: config?.teamSize ?? 1,
        myDuel,
        localPlayerId,
        playerUsernames,
      }),
    [config?.teamSize, event, localPlayerId, myDuel, playerUsernames],
  )

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
      <div className="arena-glass-panel max-w-md rounded-xl p-8 text-center">
        <p className="font-mono text-xs font-medium tracking-widest text-primary-fixed-dim uppercase">
          Match complete
        </p>
        <h2 className="mt-2 font-display text-3xl font-bold text-on-surface">
          {isDraw ? 'Draw' : won ? 'Victory' : 'Defeat'}
        </h2>
        <p className="mt-2 text-on-surface-variant">{event.winMargin}</p>
        <p className="mt-4 font-mono text-sm text-on-surface">{scoreLine}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard', { replace: true })}
          className="mt-8 rounded-lg border border-primary-container px-6 py-3 font-mono text-sm font-bold tracking-widest text-primary-container uppercase"
        >
          Return to dashboard
        </button>
      </div>
    </div>
  )
}
