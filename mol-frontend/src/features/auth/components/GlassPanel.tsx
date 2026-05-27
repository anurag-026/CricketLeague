import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export interface GlassPanelProps {
  children: ReactNode
  className?: string
}

function CornerAccent({ className }: { className: string }) {
  return (
    <span
      className={cn(
        'absolute m-2 size-4 border-primary-container/60',
        className,
      )}
      aria-hidden
    />
  )
}

export function GlassPanel({ children, className }: GlassPanelProps) {
  return (
    <div
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border border-primary-container/30',
        'bg-surface-container/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-3xl',
        className,
      )}
    >
      <CornerAccent className="top-0 left-0 border-t-2 border-l-2" />
      <CornerAccent className="top-0 right-0 border-t-2 border-r-2" />
      <CornerAccent className="bottom-0 left-0 border-b-2 border-l-2" />
      <CornerAccent className="bottom-0 right-0 border-r-2 border-b-2" />
      {children}
    </div>
  )
}
