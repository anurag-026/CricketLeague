import { cn } from '@/shared/lib/cn'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'
import { Spinner } from '@/shared/ui/Spinner'

type ActionCardAccent = 'cyan' | 'purple'

const accentClasses: Record<
  ActionCardAccent,
  { hoverBorder: string; hoverShadow: string; gradient: string; iconHover: string }
> = {
  cyan: {
    hoverBorder: 'hover:border-primary-container',
    hoverShadow: 'hover:shadow-[0_0_15px_rgba(0,229,255,0.2)]',
    gradient: 'from-primary-container/10',
    iconHover: 'group-hover:text-primary-container',
  },
  purple: {
    hoverBorder: 'hover:border-secondary-container',
    hoverShadow: 'hover:shadow-[0_0_15px_rgba(82,3,213,0.3)]',
    gradient: 'from-secondary-container/20',
    iconHover: 'group-hover:text-secondary-fixed',
  },
}

export interface ActionCardProps {
  title: string
  description: string
  icon: string
  accent?: ActionCardAccent
  isLoading?: boolean
  onClick: () => void
  iconClassName?: string
}

export function ActionCard({
  title,
  description,
  icon,
  accent = 'cyan',
  isLoading = false,
  onClick,
  iconClassName,
}: ActionCardProps) {
  const styles = accentClasses[accent]

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-busy={isLoading}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border border-outline-variant/30',
        'bg-surface-container-low text-left transition-all duration-300 active:scale-[0.98]',
        styles.hoverBorder,
        styles.hoverShadow,
        'disabled:pointer-events-none disabled:opacity-60',
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-linear-to-br to-transparent opacity-0 transition-opacity group-hover:opacity-100',
          styles.gradient,
          accent === 'purple' && 'bg-linear-to-bl',
        )}
      />
      <div className="relative flex flex-col gap-4 p-6">
        <div className="flex items-center justify-between">
          {isLoading ? (
            <Spinner size="sm" label="Loading" />
          ) : (
            <MaterialIcon
              name={icon}
              className={cn('text-[28px] fill', iconClassName)}
            />
          )}
          <MaterialIcon
            name="east"
            className={cn(
              'text-outline transition-transform group-hover:translate-x-0.5',
              styles.iconHover,
            )}
          />
        </div>
        <div>
          <h3 className="mb-1 font-mono text-xl font-bold text-on-surface">
            {title}
          </h3>
          <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
      </div>
    </button>
  )
}
