export interface BallRevealProps {
  batsmanPick: number | null
  bowlerPick: number | null
  batsmanMissed?: boolean
  bowlerMissed?: boolean
  wicket: boolean
  runs: number | null
}

function pickLabel(pick: number | null, missed?: boolean): string {
  if (missed) return 'M'
  if (pick == null) return '—'
  return String(pick)
}

export function BallReveal({
  batsmanPick,
  bowlerPick,
  batsmanMissed,
  bowlerMissed,
  wicket,
  runs,
}: BallRevealProps) {
  if (batsmanPick == null && bowlerPick == null && !batsmanMissed && !bowlerMissed) {
    return null
  }

  return (
    <div className="mt-2 flex w-full max-w-xs flex-col items-center gap-1 rounded-lg border border-outline-variant/40 bg-surface-container/60 px-4 py-2 backdrop-blur-md sm:mt-4 sm:max-w-none sm:gap-2 sm:rounded-xl sm:px-6 sm:py-3">
      <p className="text-[10px] font-medium tracking-widest text-on-surface-variant uppercase">
        Last ball
      </p>
      <div className="flex items-center gap-4 font-mono text-sm sm:gap-6 sm:text-lg">
        <span>
          BAT <strong className="text-primary-container">{pickLabel(batsmanPick, batsmanMissed)}</strong>
        </span>
        <span className="text-outline">vs</span>
        <span>
          BOWL <strong className="text-secondary">{pickLabel(bowlerPick, bowlerMissed)}</strong>
        </span>
      </div>
      <p className="text-xs text-on-surface-variant sm:text-sm">
        {wicket ? 'Wicket — roles swapped, play continues' : `${runs ?? 0} run(s) scored`}
      </p>
    </div>
  )
}
