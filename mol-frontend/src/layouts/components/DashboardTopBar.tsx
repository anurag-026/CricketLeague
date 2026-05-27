import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/app/store'
import { usePlayerStats } from '@/features/stats/hooks/usePlayerStats'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'
import { PlayerAvatar } from '@/features/matchmaking/components/PlayerAvatar'

export function DashboardTopBar() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const clearAuth = useAppStore((s) => s.clearAuth)
  const displayName = user?.username ?? 'Agent'
  const stats = usePlayerStats()
  const winStreak = stats?.currentWinStreak ?? 0

  function handleLogout() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-outline-variant/30 bg-surface/80 shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-xl md:px-margin-desktop">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-margin-mobile">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-on-surface-variant transition-colors duration-75 hover:text-primary-container active:skew-x-6"
            aria-label="Open menu"
          >
            <MaterialIcon name="menu" className="text-2xl fill" />
          </button>
          <h1 className="font-display text-2xl font-black tracking-tighter text-primary-container italic md:text-[2rem] md:leading-10">
            MOL CRICKET
          </h1>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden items-center gap-2 rounded-full border border-outline-variant/50 bg-surface-variant/50 px-3 py-1 sm:flex">
            <span
              className="size-2 animate-pulse rounded-full bg-error"
              aria-hidden
            />
            <span className="font-mono text-xs font-medium tracking-widest text-error uppercase">
              Win Streak: {winStreak}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs font-medium tracking-widest text-on-surface uppercase md:block">
              {displayName}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="font-mono text-[10px] font-medium tracking-widest text-outline uppercase hover:text-error"
            >
              Logout
            </button>
            <PlayerAvatar name={displayName} />
          </div>
        </div>
      </div>
    </header>
  )
}
