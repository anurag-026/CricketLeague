import { useEffect, type ReactNode } from 'react'
import { useAppStore } from '@/app/store'
import { LoadingState } from '@/shared/ui'

interface AppBootstrapProps {
  children: ReactNode
}

/** Hydrates auth from sessionStorage before rendering routes. */
export function AppBootstrap({ children }: AppBootstrapProps) {
  const isHydrated = useAppStore((s) => s.isHydrated)
  const hydrateFromStorage = useAppStore((s) => s.hydrateFromStorage)

  useEffect(() => {
    hydrateFromStorage()
  }, [hydrateFromStorage])

  if (!isHydrated) {
    return <LoadingState label="Starting up" fullScreen />
  }

  return children
}
