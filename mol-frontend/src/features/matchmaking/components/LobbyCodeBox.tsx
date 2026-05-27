import { useCallback, useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { copyToClipboard } from '@/shared/lib/copyToClipboard'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'

export interface LobbyCodeBoxProps {
  roomCode: string
}

export function LobbyCodeBox({ roomCode }: LobbyCodeBoxProps) {
  const [copied, setCopied] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const glitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    if (glitchTimerRef.current) clearTimeout(glitchTimerRef.current)
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  async function handleCopy() {
    const ok = await copyToClipboard(roomCode)
    if (!ok) return

    clearTimers()
    setCopied(true)
    setGlitch(true)

    toastTimerRef.current = setTimeout(() => setCopied(false), 2000)
    glitchTimerRef.current = setTimeout(() => setGlitch(false), 2000)
  }

  return (
    <div className="z-20 flex flex-col items-center gap-4">
      <h2 className="font-mono text-xs font-medium tracking-widest text-on-surface-variant uppercase opacity-80">
        Lobby Access Code
      </h2>

      <button
        type="button"
        onClick={handleCopy}
        className="copy-btn group cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label={`Copy lobby code ${roomCode}`}
      >
        <div className="lobby-glow-box flex items-center gap-4 rounded-lg px-8 py-4">
          <span
            className={cn(
              'font-display text-5xl font-black tracking-widest text-primary-container',
              glitch && 'animate-code-glitch',
            )}
          >
            {roomCode}
          </span>
          <div className="flex size-10 items-center justify-center rounded bg-primary-container/10 transition-colors group-hover:bg-primary-container/20">
            <MaterialIcon name="content_copy" className="text-primary-container fill" />
          </div>
        </div>
      </button>

      <p
        role="status"
        aria-live="polite"
        className={cn(
          'mt-2 rounded border border-secondary/30 bg-secondary-container/30 px-3 py-1 font-mono text-xs font-medium tracking-widest text-secondary uppercase transition-opacity duration-300',
          copied ? 'opacity-100' : 'opacity-0',
        )}
      >
        Copied to uplink
      </p>
    </div>
  )
}
