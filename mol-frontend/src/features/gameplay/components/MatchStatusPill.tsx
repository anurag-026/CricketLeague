export interface MatchStatusPillProps {
  message: string
}

export function MatchStatusPill({ message }: MatchStatusPillProps) {
  return (
    <div className="relative z-30 mb-2 flex w-full justify-center px-2 sm:absolute sm:top-0 sm:mb-0">
      <div className="flex max-w-full animate-pulse items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary-container/20 px-3 py-1.5 backdrop-blur-md sm:gap-2 sm:px-6 sm:py-2">
        <span className="size-1.5 shrink-0 rounded-full bg-secondary sm:size-2" aria-hidden />
        <span className="truncate font-mono text-[10px] font-medium tracking-wide text-secondary-fixed uppercase sm:text-xs sm:tracking-widest">
          {message}
        </span>
      </div>
    </div>
  )
}
