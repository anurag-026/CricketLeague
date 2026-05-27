import { cn } from '@/shared/lib/cn'

export interface PlayerAvatarProps {
  name: string
  className?: string
}

function initials(name: string): string {
  return name
    .split(/[\s_]+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function PlayerAvatar({ name, className }: PlayerAvatarProps) {
  return (
    <div
      className={cn(
        'flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary-container/50 bg-surface-container-high',
        className,
      )}
      aria-hidden
    >
      <span className="font-mono text-[10px] font-bold text-primary-container">
        {initials(name)}
      </span>
    </div>
  )
}
