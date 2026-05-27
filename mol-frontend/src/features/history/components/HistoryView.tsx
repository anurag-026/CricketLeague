import { useMemo } from 'react'
import { MatchHistoryCard } from '@/features/history/components/MatchHistoryCard'
import { useMatchHistory } from '@/features/stats/hooks/useMatchHistory'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'
import { Spinner } from '@/shared/ui/Spinner'

export function HistoryView() {
  const { matches, loading, error } = useMatchHistory(30)

  const summary = useMemo(() => {
    const wins = matches.filter((m) => m.won).length
    return { total: matches.length, wins, losses: matches.length - wins }
  }, [matches])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-10 text-primary-container" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-mono text-xs font-medium tracking-[0.2em] text-secondary-fixed-dim uppercase">
          Match archive
        </p>
        <h2 className="font-display text-3xl font-black tracking-tight text-on-surface italic">
          History
        </h2>
      </header>

      {error ? (
        <div className="glass-panel rounded-xl border border-error/30 p-6 text-center">
          <p className="font-mono text-sm text-on-surface-variant">{error}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-2">
        <div className="glass-panel rounded-lg border border-outline-variant/30 p-3 text-center">
          <p className="font-mono text-[10px] tracking-widest text-outline uppercase">Played</p>
          <p className="font-display text-xl font-bold text-on-surface">{summary.total}</p>
        </div>
        <div className="glass-panel rounded-lg border border-primary-container/25 p-3 text-center">
          <p className="font-mono text-[10px] tracking-widest text-outline uppercase">Wins</p>
          <p className="font-display text-xl font-bold text-primary-container">{summary.wins}</p>
        </div>
        <div className="glass-panel rounded-lg border border-outline-variant/30 p-3 text-center">
          <p className="font-mono text-[10px] tracking-widest text-outline uppercase">Losses</p>
          <p className="font-display text-xl font-bold text-error">{summary.losses}</p>
        </div>
      </div>

      {matches.length === 0 && !error ? (
        <div className="glass-panel flex flex-col items-center rounded-xl border border-dashed border-outline-variant/40 px-6 py-16 text-center">
          <MaterialIcon name="history" className="mb-3 text-4xl text-outline" />
          <p className="font-mono text-sm text-on-surface-variant">No matches yet</p>
          <p className="mt-1 max-w-xs font-mono text-[10px] tracking-wide text-outline">
            Play a duel from the Arena — results will appear here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3 pb-4">
          {matches.map((match) => (
            <li key={`${match.matchId}-${match.playedAt}`}>
              <MatchHistoryCard match={match} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
