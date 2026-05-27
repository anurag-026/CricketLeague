import { cn } from '@/shared/lib/cn'

export interface MaterialIconProps {
  name: string
  className?: string
  filled?: boolean
  /** Accessible label; omit when decorative (parent has text). */
  label?: string
}

export function MaterialIcon({
  name,
  className,
  filled = false,
  label,
}: MaterialIconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'fill', className)}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
    >
      {name}
    </span>
  )
}
