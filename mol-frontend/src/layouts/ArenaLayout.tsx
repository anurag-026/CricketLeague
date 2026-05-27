import { Outlet } from 'react-router-dom'

/** Fullscreen arena — no bottom nav (lobby + live match). */
export function ArenaLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Outlet />
    </div>
  )
}
