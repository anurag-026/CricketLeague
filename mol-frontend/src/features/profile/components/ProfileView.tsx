import { usePlayerProfile } from '@/features/stats/hooks/usePlayerProfile'
import { PlayerAvatar } from '@/features/matchmaking/components/PlayerAvatar'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'
import { Spinner } from '@/shared/ui/Spinner'
import { StatTile } from './StatTile'

function winRate(wins: number, played: number): string {
  if (played === 0) return '—'
  return `${Math.round((wins / played) * 100)}%`
}

export function ProfileView() {
  const { profile, loading, error } = usePlayerProfile()

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner className="size-10 text-primary-container" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="glass-panel rounded-xl border border-error/30 p-8 text-center">
        <MaterialIcon name="error_outline" className="mb-2 text-3xl text-error" />
        <p className="font-mono text-sm text-on-surface-variant">{error ?? 'Profile unavailable'}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="font-mono text-xs font-medium tracking-[0.2em] text-primary-container uppercase">
          Player dossier
        </p>
        <h2 className="font-display text-3xl font-black tracking-tight text-on-surface italic">
          Profile
        </h2>
      </header>

      <section className="glass-panel relative overflow-hidden rounded-xl border border-primary-container/25 p-6">
        <div
          className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary-container/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
          <PlayerAvatar name={profile.username} className="size-20 text-2xl" />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <h3 className="font-display text-2xl font-bold text-primary-container">
              {profile.username}
            </h3>
            <p className="mt-1 truncate font-mono text-xs tracking-wide text-on-surface-variant">
              {profile.email}
            </p>
            <p className="mt-2 font-mono text-[10px] tracking-widest text-outline uppercase">
              ID · {profile.userId.slice(0, 8)}…
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-mono text-xs font-medium tracking-widest text-outline uppercase">
          Career stats
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTile label="Matches" value={profile.matchesPlayed} accent="cyan" />
          <StatTile label="Wins" value={profile.wins} accent="cyan" />
          <StatTile label="Losses" value={profile.losses} />
          <StatTile
            label="Win rate"
            value={winRate(profile.wins, profile.matchesPlayed)}
            accent="purple"
          />
          <StatTile label="Current streak" value={profile.currentWinStreak} accent="purple" />
          <StatTile label="Best streak" value={profile.bestWinStreak} accent="purple" />
        </div>
      </section>

      <section className="glass-panel rounded-xl border border-outline-variant/30 p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] font-medium tracking-widest text-outline uppercase">
              Total runs scored
            </span>
            <p className="font-display text-4xl font-black text-primary-fixed-dim">
              {profile.totalRunsScored}
            </p>
          </div>
          <MaterialIcon name="sports_cricket" className="text-4xl text-primary-container/40 fill" />
        </div>
      </section>
    </div>
  )
}
