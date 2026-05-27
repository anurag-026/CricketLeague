import { cn } from '@/shared/lib/cn'

export interface RadarScannerProps {
  statusText?: string
  className?: string
}

export function RadarScanner({
  statusText = 'Scanning for challenger...',
  className,
}: RadarScannerProps) {
  return (
    <div
      className={cn('relative mb-12 flex flex-col items-center justify-center', className)}
    >
      <div
        className="radar-container animate-pulse-glow"
        role="img"
        aria-label="Matchmaking radar scanning"
      >
        <div className="radar-grid" />
        <div className="radar-ring size-[100px]" />
        <div className="radar-ring size-[200px]" />
        <div className="radar-sweep" />
        <div className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-container shadow-[0_0_15px_rgba(0,229,255,1)]" />
      </div>

      <p
        className="mt-8 animate-pulse font-mono text-xs font-medium tracking-[0.2em] text-primary-fixed-dim uppercase"
        aria-live="polite"
      >
        {statusText}
      </p>
    </div>
  )
}
