import { cn } from '@/shared/lib/cn'

const GUESSES = [1, 2, 3, 4, 5, 6] as const

export interface HexGuessGridProps {
  selected: number | null
  disabled?: boolean
  onSelect: (value: number) => void
}

export function HexGuessGrid({ selected, disabled, onSelect }: HexGuessGridProps) {
  return (
    <div className="grid grid-cols-3 justify-items-center gap-2 sm:gap-4 md:gap-6">
      {GUESSES.map((value) => {
        const isSelected = selected === value
        return (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(value)}
            aria-pressed={isSelected}
            className={cn(
              'hex-guess-button relative flex h-[4.25rem] w-[3.5rem] items-center justify-center sm:h-24 sm:w-20',
              isSelected
                ? 'z-20 scale-105 border-2 border-error cyber-glow-orange bg-surface'
                : 'border border-outline-variant/50 bg-surface-container hover:border-primary-container/50',
              disabled && 'pointer-events-none opacity-50',
            )}
          >
            {isSelected && (
              <div className="absolute inset-0 bg-error/10" aria-hidden />
            )}
            <div className="arena-scanline opacity-20" aria-hidden />
            <span
              className={cn(
                'relative z-10 font-display text-3xl font-extrabold sm:text-5xl',
                isSelected
                  ? 'text-error drop-shadow-[0_0_8px_rgba(255,180,171,0.8)]'
                  : 'text-on-surface-variant transition-colors hover:text-primary-container',
              )}
            >
              {value}
            </span>
          </button>
        )
      })}
    </div>
  )
}
