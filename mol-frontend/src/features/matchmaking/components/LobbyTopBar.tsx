import { useNavigate } from 'react-router-dom'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'

export function LobbyTopBar() {
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant/30 bg-surface/80 px-margin-mobile shadow-[0_0_20px_rgba(0,229,255,0.1)] backdrop-blur-xl">
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="flex items-center justify-center rounded-full p-2 text-primary-container transition-colors duration-75 hover:bg-primary/10 active:skew-x-6"
        aria-label="Back to dashboard"
      >
        <MaterialIcon name="menu" className="fill" />
      </button>

      <h1 className="font-display text-2xl font-black tracking-tighter text-primary-container uppercase italic md:text-[2rem]">
        MOL CRICKET
      </h1>

      <div
        className="flex size-8 items-center justify-center overflow-hidden rounded-full border border-outline bg-surface-variant text-on-surface-variant"
        aria-hidden
      >
        <MaterialIcon name="person" className="text-xl fill" />
      </div>
    </header>
  )
}
