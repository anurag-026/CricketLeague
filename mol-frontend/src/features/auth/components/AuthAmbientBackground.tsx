export function AuthAmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-primary-container/10 blur-[120px]" />
      <div className="absolute right-1/4 bottom-1/4 size-[500px] rounded-full bg-secondary-container/10 blur-[150px]" />
      <div className="scanline-overlay absolute inset-0 z-0 opacity-30" />
    </div>
  )
}
