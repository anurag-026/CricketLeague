import { MaterialIcon } from '@/shared/ui/MaterialIcon'

export interface ShotClockProps {
  secondsLeft: number
  totalSegments: number
  filledSegments: number
}

export function ShotClock({
  secondsLeft,
  totalSegments,
  filledSegments,
}: ShotClockProps) {
  return (
    <div className="mb-2 flex items-center gap-2 sm:mb-4 md:mb-6">
      <MaterialIcon name="timer" className="text-lg text-outline" />
      <div className="flex h-2 flex-1 gap-1">
        {Array.from({ length: totalSegments }, (_, i) => (
          <div
            key={i}
            className={
              i < filledSegments
                ? 'cyber-glow-primary flex-1 rounded-full bg-primary-container'
                : 'flex-1 rounded-full bg-surface-variant'
            }
            aria-hidden
          />
        ))}
      </div>
      <span className="w-6 text-right font-mono text-xs font-medium tracking-widest text-primary-fixed-dim">
        {secondsLeft}s
      </span>
    </div>
  )
}
