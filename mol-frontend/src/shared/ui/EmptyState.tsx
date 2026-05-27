import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { GlowText } from './GlowText'
import { HexButton } from './HexButton'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-12 text-center',
        className,
      )}
      aria-labelledby="empty-state-title"
    >
      {icon && (
        <div className="text-cyber-accent/80" aria-hidden>
          {icon}
        </div>
      )}
      <GlowText
        as="h2"
        id="empty-state-title"
        variant="title"
        tone="neutral"
      >
        {title}
      </GlowText>
      {description && (
        <p className="max-w-sm text-cyber-text-muted">{description}</p>
      )}
      {actionLabel && onAction && (
        <HexButton onClick={onAction} variant="secondary">
          {actionLabel}
        </HexButton>
      )}
    </section>
  )
}
