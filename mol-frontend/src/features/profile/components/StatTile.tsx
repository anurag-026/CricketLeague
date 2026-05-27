import { cn } from '@/shared/lib/cn'

export interface StatTileProps {
  label: string
  value: string | number
  accent?: 'cyan' | 'purple' | 'neutral'
}

const accentBorder: Record<NonNullable<StatTileProps['accent']>, string> = {
  cyan: 'border-primary-container/30 shadow-[0_0_12px_rgba(0,229,255,0.12)]',
  purple: 'border-secondary-container/40 shadow-[0_0_12px_rgba(82,3,213,0.15)]',
  neutral: 'border-outline-variant/30',
}

export function StatTile({ label, value, accent = 'neutral' }: StatTileProps) {
  return (
    <div
      className={cn(
        'glass-panel flex flex-col gap-1 rounded-xl border p-4',
        accentBorder[accent],
      )}
    >
      <span className="font-mono text-[10px] font-medium tracking-widest text-outline uppercase">
        {label}
      </span>
      <span className="font-display text-2xl font-bold text-on-surface">{value}</span>
    </div>
  )
}
