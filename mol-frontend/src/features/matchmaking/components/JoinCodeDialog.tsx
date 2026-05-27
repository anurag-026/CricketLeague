import { useCallback, useEffect, useId, useState, type FormEvent } from 'react'
import { cn } from '@/shared/lib/cn'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'
import { Spinner } from '@/shared/ui/Spinner'

export interface JoinCodeDialogProps {
  isLoading?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (roomCode: string) => void
}

export function JoinCodeDialog({
  isLoading = false,
  error,
  onClose,
  onSubmit,
}: JoinCodeDialogProps) {
  const titleId = useId()
  const [code, setCode] = useState('')

  const handleClose = useCallback(() => {
    setCode('')
    onClose()
  }, [onClose])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') handleClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [handleClose])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
      role="presentation"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="glass-panel w-full max-w-md rounded-xl border border-secondary-container/40 p-6 shadow-[0_0_32px_rgba(82,3,213,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <MaterialIcon
              name="vpn_key"
              className="text-[28px] text-secondary-fixed fill"
            />
            <h2
              id={titleId}
              className="font-mono text-xl font-bold text-on-surface"
            >
              Secure Lobby Code
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-outline transition-colors hover:text-on-surface"
            aria-label="Close dialog"
          >
            <MaterialIcon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label
            htmlFor="room-code"
            className="font-mono text-xs font-medium tracking-widest text-on-surface-variant uppercase"
          >
            Enter Code
          </label>
          <input
            id="room-code"
            autoFocus
            name="roomCode"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            autoComplete="off"
            spellCheck={false}
            maxLength={12}
            className={cn(
              'glass-input w-full rounded-lg border border-outline-variant/50',
              'bg-surface-container-low/60 px-4 py-3 font-mono text-lg tracking-[0.3em] text-on-surface uppercase',
              'placeholder:tracking-normal placeholder:text-outline-variant/60 focus:outline-none',
            )}
          />
          {error && (
            <p role="alert" className="text-sm text-error">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isLoading || !code.trim()}
            className={cn(
              'flex items-center justify-center gap-2 rounded-lg border border-secondary-container py-3',
              'font-mono text-sm font-bold tracking-widest text-secondary-fixed uppercase',
              'transition-colors hover:bg-secondary-container/20 disabled:opacity-50',
            )}
          >
            {isLoading ? (
              <Spinner size="sm" label="Joining" />
            ) : (
              <MaterialIcon name="login" className="fill" />
            )}
            Join Lobby
          </button>
        </form>
      </div>
    </div>
  )
}
