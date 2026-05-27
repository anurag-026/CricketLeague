import { cn } from '@/shared/lib/cn'

type SpinnerSize = 'sm' | 'md' | 'lg'

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'size-4 border-2',
  md: 'size-6 border-2',
  lg: 'size-10 border-[3px]',
}

export interface SpinnerProps {
  size?: SpinnerSize
  label?: string
  className?: string
}

export function Spinner({
  size = 'md',
  label = 'Loading',
  className,
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-block shrink-0', className)}
    >
      <span
        className={cn(
          'block animate-spin rounded-full border-primary-container/25 border-t-primary-container',
          sizeClasses[size],
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  )
}
