import type { ReactNode } from 'react'
import type { AsyncState } from '@/shared/types'
import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'

export interface ScreenStateProps<T> {
  state: AsyncState<T>
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: { label: string; onClick: () => void }
  loadingLabel?: string
  children: (data: T) => ReactNode
}

/**
 * Renders loading / error / empty / success from a single `AsyncState` value.
 */
export function ScreenState<T>({
  state,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  loadingLabel,
  children,
}: ScreenStateProps<T>) {
  switch (state.status) {
    case 'idle':
    case 'loading':
      return <LoadingState label={loadingLabel} fullScreen />
    case 'error':
      return <ErrorState message={state.error.error} onRetry={onRetry} />
    case 'empty':
      return (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyAction?.label}
          onAction={emptyAction?.onClick}
        />
      )
    case 'success':
      return <>{children(state.data)}</>
    default: {
      const _exhaustive: never = state
      return _exhaustive
    }
  }
}
