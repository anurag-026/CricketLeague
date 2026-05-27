import { useState, type FormEvent } from 'react'
import { cn } from '@/shared/lib/cn'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'
import { Spinner } from '@/shared/ui/Spinner'

export interface HostRoomConfig {
  teamSize: number
  overs: number
}

export interface HostRoomDialogProps {
  open: boolean
  isLoading?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (config: HostRoomConfig) => void
}

export function HostRoomDialog({
  open,
  isLoading = false,
  error,
  onClose,
  onSubmit,
}: HostRoomDialogProps) {
  const [teamSize, setTeamSize] = useState(1)
  const [overs, setOvers] = useState(5)

  if (!open) return null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onSubmit({ teamSize, overs })
  }

  const playersRequired = teamSize * 2

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="host-room-title"
        className="glass-panel w-full max-w-md rounded-xl border border-primary-container/40 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <MaterialIcon name="stadium" className="text-[28px] text-primary-fixed fill" />
            <h2 id="host-room-title" className="font-mono text-xl font-bold text-on-surface">
              Host Custom Match
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-outline hover:text-on-surface"
            aria-label="Close"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="font-mono text-xs font-medium tracking-widest text-on-surface-variant uppercase">
              Format
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {([1, 2, 3] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTeamSize(size)}
                  className={cn(
                    'rounded-lg border px-3 py-2 font-mono text-sm transition-colors',
                    teamSize === size
                      ? 'border-primary-container bg-primary-container/10 text-primary-container'
                      : 'border-outline-variant/50 text-on-surface-variant hover:border-primary-container/50',
                  )}
                >
                  {size === 1 ? '1v1' : `${size}v${size}`}
                </button>
              ))}
            </div>
            <p className="text-xs text-on-surface-variant">
              {playersRequired} players required ({teamSize} per side)
            </p>
          </fieldset>

          <label className="flex flex-col gap-2">
            <span className="font-mono text-xs font-medium tracking-widest text-on-surface-variant uppercase">
              Overs
            </span>
            <input
              type="number"
              min={1}
              max={20}
              value={overs}
              onChange={(e) => setOvers(Number(e.target.value))}
              className="glass-input rounded-lg border border-outline-variant/50 bg-surface-container-low/60 px-4 py-3 font-mono text-on-surface focus:outline-none"
            />
          </label>

          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-lg border border-primary-container py-3 font-mono text-sm font-bold tracking-widest text-primary-container uppercase disabled:opacity-50"
          >
            {isLoading ? <Spinner size="sm" label="Creating" /> : null}
            Create Lobby
          </button>
        </form>
      </div>
    </div>
  )
}
