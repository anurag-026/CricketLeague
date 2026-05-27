import { cn } from '@/shared/lib/cn'
import { GlowText } from './GlowText'
import { HexButton } from './HexButton'

export interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-12 text-center',
        className,
      )}
      aria-labelledby="error-state-title"
    >
      <GlowText as="h2" id="error-state-title" variant="title" tone="danger">
        {title}
      </GlowText>
      <p className="max-w-sm text-cyber-text-muted">{message}</p>
      {onRetry && (
        <HexButton onClick={onRetry} variant="secondary">
          {retryLabel}
        </HexButton>
      )}
    </section>
  )
}
