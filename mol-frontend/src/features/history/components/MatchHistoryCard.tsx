import { cn } from '@/shared/lib/cn'
import { formatPlayedAt } from '@/shared/lib/formatDate'
import type { MatchHistoryItem } from '@/shared/types/stats'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'

export interface MatchHistoryCardProps {
  match: MatchHistoryItem
}

export function MatchHistoryCard({ match }: MatchHistoryCardProps) {
  const { date, time } = formatPlayedAt(match.playedAt)
  const isDraw =
    match.winnerTeam == null || match.teamAScore === match.teamBScore
  const opponentName = match.opponentUsername ?? 'Opponent'
  const opponentRuns =
    match.playerTeam === 'TEAM_A' ? match.teamBScore : match.teamAScore

  return (
    <article
      className={cn(
        'glass-panel relative overflow-hidden rounded-xl border p-4 transition-colors',
        isDraw
          ? 'border-outline-variant/40'
          : match.won
            ? 'border-primary-container/35 shadow-[0_0_14px_rgba(0,229,255,0.08)]'
            : 'border-outline-variant/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest uppercase',
                isDraw
                  ? 'bg-surface-container-high text-on-surface-variant'
                  : match.won
                    ? 'bg-primary-container/15 text-primary-container'
                    : 'bg-error-container/40 text-error',
              )}
            >
              {isDraw ? 'Draw' : match.won ? 'Victory' : 'Defeat'}
            </span>
            {match.roomCode ? (
              <span className="font-mono text-[10px] tracking-widest text-outline uppercase">
                Room {match.roomCode}
              </span>
            ) : (
              <span className="font-mono text-[10px] tracking-widest text-outline uppercase">
                Quick match
              </span>
            )}
          </div>

          <p className="font-display text-lg font-bold text-on-surface">
            You scored <span className="text-primary-container">{match.runsScored}</span>
          </p>
          <p className="mt-0.5 font-mono text-xs text-on-surface-variant">
            vs {opponentName} · {match.runsScored} – {opponentRuns}
          </p>
          {match.winMargin ? (
            <p className="mt-1 font-mono text-[10px] tracking-wide text-secondary-fixed-dim">
              {match.winMargin}
            </p>
          ) : null}
        </div>

        <div className="shrink-0 text-right">
          <MaterialIcon
            name={isDraw ? 'balance' : match.won ? 'emoji_events' : 'close'}
            className={cn(
              'text-2xl fill',
              isDraw
                ? 'text-on-surface-variant'
                : match.won
                  ? 'text-primary-container'
                  : 'text-outline',
            )}
          />
          <p className="mt-2 font-mono text-[10px] tracking-wide text-outline">{date}</p>
          <p className="font-mono text-[10px] text-on-surface-variant">{time}</p>
        </div>
      </div>
    </article>
  )
}
