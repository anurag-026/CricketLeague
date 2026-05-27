import { cn } from '@/shared/lib/cn'
import { GlowText } from './GlowText'
import { Spinner } from './Spinner'

export interface LoadingStateProps {
  label?: string
  description?: string
  fullScreen?: boolean
  className?: string
}

export function LoadingState({
  label = 'Loading',
  description,
  fullScreen = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-12 text-center',
        fullScreen && 'min-h-[50dvh] sm:min-h-[60dvh]',
        className,
      )}
    >
      <Spinner size="lg" label={label} />
      <GlowText variant="label" tone="neutral">
        {label}
      </GlowText>
      {description && (
        <p className="max-w-xs text-sm text-cyber-text-muted">{description}</p>
      )}
    </div>
  )
}
