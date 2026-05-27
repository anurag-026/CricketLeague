import { cn } from '@/shared/lib/cn'

export interface PlayerCardProps {
  role: 'bowler' | 'batter'
  displayName: string
  statLabel: string
  statValue: string
  isActive?: boolean
  tilt?: 'left' | 'right'
  imageUrl?: string
}

export function PlayerCard({
  role,
  displayName,
  statLabel,
  statValue,
  isActive = false,
  tilt,
  imageUrl,
}: PlayerCardProps) {
  return (
    <div
      className={cn(
        'relative z-20',
        tilt === 'left' && 'sm:-skew-x-6',
        tilt === 'right' && 'sm:skew-x-6',
        !isActive && 'scale-95 opacity-70',
      )}
    >
      <div
        className={cn(
          'arena-glass-panel group relative flex h-36 w-[7.25rem] flex-col overflow-hidden rounded-lg border-2 sm:h-44 sm:w-32 sm:rounded-xl md:h-64 md:w-48',
          isActive
            ? 'border-primary-container cyber-glow-active'
            : 'border-outline-variant',
        )}
      >
        <div className="arena-scanline opacity-50" aria-hidden />

        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className={cn(
              'absolute inset-0 size-full object-cover mix-blend-luminosity transition-all duration-500',
              isActive && 'opacity-80 group-hover:mix-blend-normal',
            )}
          />
        ) : (
          <div
            className={cn(
              'absolute inset-0 bg-linear-to-br from-surface-container-high to-surface-container-lowest',
              isActive ? 'from-primary-container/20' : 'opacity-60',
            )}
            aria-hidden
          />
        )}

        <div className="absolute bottom-0 w-full bg-linear-to-t from-surface-container-lowest to-transparent p-2 pt-8 sm:p-3 sm:pt-12">
          <div
            className={cn(
              'mb-0.5 font-mono text-[10px] font-medium tracking-wider uppercase sm:mb-1 sm:text-xs',
              isActive ? 'text-primary-fixed' : 'text-outline',
            )}
          >
            {role}
          </div>
          <div
            className={cn(
              'truncate font-mono text-sm font-bold sm:text-xl',
              isActive ? 'text-on-surface' : 'text-on-surface-variant',
            )}
          >
            {displayName}
          </div>
          <div
            className={cn(
              'mt-1 inline-block rounded px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wider uppercase sm:mt-2 sm:px-2 sm:py-1 sm:text-[10px]',
              isActive
                ? 'bg-secondary-container text-white'
                : 'bg-surface-variant text-outline',
            )}
          >
            {statLabel}: {statValue}
          </div>
        </div>
      </div>
    </div>
  )
}
