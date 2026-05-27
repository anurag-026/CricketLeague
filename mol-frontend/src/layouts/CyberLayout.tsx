import { Outlet } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { DashboardTopBar } from './components/DashboardTopBar'

/** Dashboard / squad / tactics shell with top bar and bottom navigation. */
export function CyberLayout() {
  return (
    <div className="flex min-h-dvh flex-col text-on-background">
      <DashboardTopBar />
      <main
        id="main-content"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-margin-mobile pt-24 pb-28 md:px-margin-desktop md:pt-32 md:pb-12"
      >
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
