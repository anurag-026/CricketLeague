import { cn } from '@/shared/lib/cn'

export interface BallOverStripProps {
  marks: string[]
}

export function BallOverStrip({ marks }: BallOverStripProps) {
  const slots = [...marks]
  while (slots.length < 6) {
    slots.push('')
  }
  const display = slots.slice(0, 6)

  return (
    <div className="mt-1 flex gap-1" aria-label="Current over balls">
      {display.map((mark, index) => {
        const filled = mark.length > 0
        const isWicket = mark === 'W'
        const isMissed = mark === 'M'
        return (
          <div
            key={index}
            className={cn(
              'flex size-5 items-center justify-center rounded-full border font-mono text-[9px] font-bold sm:size-6 sm:text-[10px]',
              !filled && 'border-outline-variant/40 bg-surface-container-lowest/50 text-transparent',
              filled &&
                !isWicket &&
                !isMissed &&
                'border-primary-container/50 bg-primary-container/15 text-primary-container',
              isWicket && 'border-error/60 bg-error/20 text-error',
              isMissed && 'border-outline/60 bg-surface-variant/40 text-outline',
            )}
            aria-label={filled ? `Ball ${index + 1}: ${mark}` : `Ball ${index + 1}: pending`}
          >
            {filled ? mark : '·'}
          </div>
        )
      })}
    </div>
  )
}
