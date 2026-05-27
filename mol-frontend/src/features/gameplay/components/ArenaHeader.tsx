import { MaterialIcon } from '@/shared/ui/MaterialIcon'

export interface ArenaHeaderProps {
  pingMs?: number
  onLeave?: () => void
  onForfeit?: () => void
  leaving?: boolean
}

export function ArenaHeader({
  pingMs = 12,
  onLeave,
  onForfeit,
  leaving = false,
}: ArenaHeaderProps) {
  return (
    <header className="safe-top pointer-events-none fixed top-0 z-50 flex w-full items-start justify-between px-margin-mobile pt-2 sm:pt-4">
      <div className="pointer-events-auto flex gap-2">
        <button
          type="button"
          onClick={onLeave}
          disabled={leaving}
          className="rounded-full border border-outline-variant/30 bg-surface/50 p-2 text-on-surface-variant backdrop-blur-md transition-colors hover:text-primary-container disabled:opacity-50"
          aria-label="Leave match"
        >
          <MaterialIcon name="arrow_back" />
        </button>
        {onForfeit && (
          <button
            type="button"
            onClick={onForfeit}
            disabled={leaving}
            className="rounded-full border border-error/40 bg-error/10 px-3 py-2 text-xs font-medium tracking-wide text-error backdrop-blur-md transition-colors hover:bg-error/20 disabled:opacity-50"
          >
            Forfeit
          </button>
        )}
      </div>

      <div className="pointer-events-auto flex gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-outline-variant/30 bg-surface-container-high/80 px-3 py-1 backdrop-blur-md">
          <MaterialIcon
            name="signal_cellular_alt"
            className="text-base text-primary-container fill"
          />
          <span className="font-mono text-xs font-medium tracking-widest text-outline uppercase">
            {pingMs}ms
          </span>
        </div>
      </div>
    </header>
  )
}
