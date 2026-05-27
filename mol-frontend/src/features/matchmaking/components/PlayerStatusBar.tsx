import { usePlayerStats } from '@/features/stats/hooks/usePlayerStats'

export interface PlayerStatusBarProps {
  playerName: string
}

/** Mobile-only player strip below the top bar. */
export function PlayerStatusBar({ playerName }: PlayerStatusBarProps) {
  const stats = usePlayerStats()
  const winStreak = stats?.currentWinStreak ?? 0
  return (
    <div className="glass-panel flex items-center justify-between rounded-xl border border-outline-variant/30 p-4 sm:hidden">
      <span className="font-mono text-xs font-medium tracking-widest text-on-surface uppercase">
        {playerName}
      </span>
      <div className="flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-error" aria-hidden />
        <span className="font-mono text-xs font-medium tracking-widest text-error uppercase">
          Win Streak: {winStreak}
        </span>
      </div>
    </div>
  )
}
