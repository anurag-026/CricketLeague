import { PlayerCard, type PlayerCardProps } from './PlayerCard'

export interface PlayerDuelProps {
  left: PlayerCardProps
  right: PlayerCardProps
}

export function PlayerDuel({ left, right }: PlayerDuelProps) {
  return (
    <div className="relative mt-8 flex w-full max-w-2xl items-center justify-center gap-2 px-1 sm:mt-10 sm:justify-between sm:gap-4 sm:px-0 md:mt-12">
      <PlayerCard
        role={left.role}
        displayName={left.displayName}
        statLabel={left.statLabel}
        statValue={left.statValue}
        isActive={left.isActive}
        tilt="left"
        imageUrl={left.imageUrl}
      />

      <div className="absolute top-1/2 left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 rounded-full border border-outline-variant bg-surface-container-highest p-2 shadow-2xl sm:p-3">
        <span className="font-display text-lg font-black text-on-surface-variant italic tracking-tighter sm:text-2xl">
          VS
        </span>
      </div>

      <PlayerCard
        role={right.role}
        displayName={right.displayName}
        statLabel={right.statLabel}
        statValue={right.statValue}
        isActive={right.isActive}
        tilt="right"
        imageUrl={right.imageUrl}
      />
    </div>
  )
}
