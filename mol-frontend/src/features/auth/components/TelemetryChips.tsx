export function TelemetryChips() {
  return (
    <div
      className="pointer-events-none mt-4 flex gap-4 opacity-50"
      aria-hidden
    >
      <div className="flex items-center gap-2 rounded bg-secondary-container px-3 py-1 font-mono text-xs font-medium tracking-widest text-secondary uppercase">
        <span className="size-2 animate-pulse rounded-full bg-primary-container" />
        SYS: ONLINE
      </div>
      <div className="rounded bg-surface-variant px-3 py-1 font-mono text-xs font-medium tracking-widest text-on-surface-variant uppercase">
        PING: 14ms
      </div>
    </div>
  )
}
