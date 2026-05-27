import { formatOver } from '@/shared/lib/formatOver'
import type { DuelStateDto, MatchConfigDto, MatchStateSnapshot } from '@/shared/types'
import { BallOverStrip } from './BallOverStrip'

export interface ArenaScoreboardProps {
  snapshot: MatchStateSnapshot
  config: MatchConfigDto
  myDuel?: DuelStateDto | null
  teamALabel?: string
  teamBLabel?: string
}

export function ArenaScoreboard({
  snapshot,
  config,
  myDuel,
  teamALabel = 'Team A',
  teamBLabel = 'Team B',
}: ArenaScoreboardProps) {
  const overLabel = formatOver(config.totalOvers, snapshot.ballsRemainingInInnings)
  const teamAScore = myDuel?.scoreA ?? snapshot.teamAScore
  const teamBScore = myDuel?.scoreB ?? snapshot.teamBScore

  return (
    <div className="arena-glass-panel relative mb-3 flex w-full min-w-0 items-center justify-between gap-1 overflow-hidden rounded-lg p-2.5 sm:mb-6 sm:gap-2 sm:rounded-xl sm:p-4 md:mb-8">
      <div className="arena-scanline" aria-hidden />

      <div className="z-20 flex min-w-0 flex-1 flex-col items-start">
        <span className="mb-0.5 font-mono text-[10px] font-medium tracking-wider text-outline uppercase sm:mb-1 sm:text-xs sm:tracking-widest">
          {teamALabel}
        </span>
        <span className="font-mono text-base font-bold text-primary-container sm:text-xl">
          {teamAScore}/{snapshot.teamAWickets}
        </span>
        <BallOverStrip marks={snapshot.teamABallMarks ?? []} />
      </div>

      <div className="z-20 flex shrink-0 flex-col items-center rounded-md border border-outline-variant/50 bg-surface-container-lowest/80 px-2.5 py-1.5 shadow-inner sm:rounded-lg sm:px-4 sm:py-2">
        <span className="mb-0.5 font-mono text-[10px] font-medium tracking-wider text-on-surface-variant uppercase sm:mb-1 sm:text-xs sm:tracking-widest">
          Over
        </span>
        <span className="font-display text-lg font-bold text-primary-fixed-dim sm:text-2xl">
          {overLabel}
        </span>
      </div>

      <div className="z-20 flex min-w-0 flex-1 flex-col items-end">
        <span className="mb-0.5 font-mono text-[10px] font-medium tracking-wider text-outline uppercase sm:mb-1 sm:text-xs sm:tracking-widest">
          {teamBLabel}
        </span>
        <span className="font-mono text-base font-bold text-on-surface sm:text-xl">
          {teamBScore}/{snapshot.teamBWickets}
        </span>
        <BallOverStrip marks={snapshot.teamBBallMarks ?? []} />
      </div>
    </div>
  )
}
