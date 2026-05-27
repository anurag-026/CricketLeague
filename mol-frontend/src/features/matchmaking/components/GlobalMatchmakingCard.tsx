import { cn } from '@/shared/lib/cn'
import { formatWaitTime } from '@/shared/lib/formatWait'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'
import { Spinner } from '@/shared/ui/Spinner'

export interface GlobalMatchmakingCardProps {
  estimatedWaitSeconds?: number
  isLoading?: boolean
  onClick: () => void
}

export function GlobalMatchmakingCard({
  estimatedWaitSeconds = 45,
  isLoading = false,
  onClick,
}: GlobalMatchmakingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-busy={isLoading}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border border-outline-variant/50',
        'bg-surface-container-high text-left transition-all duration-300',
        'neon-orange-glow hover:border-error active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-60',
      )}
    >
      <div className="absolute inset-0 bg-linear-to-r from-error-container/20 to-transparent opacity-50 transition-opacity group-hover:opacity-100" />
      <div className="scanline-overlay-dashboard absolute inset-0 opacity-30" />

      <div className="relative flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center md:p-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <MaterialIcon name="public" className="text-[32px] text-error fill" />
            <h2 className="font-display text-2xl font-bold text-on-surface md:text-[2rem] md:leading-10">
              Global Matchmaking
            </h2>
          </div>
          <p className="max-w-md text-base text-on-surface-variant">
            Find opponents of similar skill worldwide. Ranked matches affect
            global leaderboard standing.
          </p>
        </div>

        <div className="flex items-center gap-4 self-start md:self-auto">
          <div className="hidden flex-col items-end md:flex">
            <span className="font-mono text-xs font-medium tracking-widest text-outline uppercase">
              Est. Wait
            </span>
            <span className="font-mono text-xl font-bold text-on-surface">
              {formatWaitTime(estimatedWaitSeconds)}
            </span>
          </div>
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-full border border-error/50 bg-error-container/30 text-error',
              'transition-colors group-hover:bg-error group-hover:text-surface',
            )}
          >
            {isLoading ? (
              <Spinner size="sm" label="Searching" />
            ) : (
              <MaterialIcon name="arrow_forward" className="fill" />
            )}
          </div>
        </div>
      </div>
    </button>
  )
}
