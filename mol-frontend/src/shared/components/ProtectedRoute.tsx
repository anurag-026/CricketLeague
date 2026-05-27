import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppStore, selectIsAuthenticated } from '@/app/store'
import { LoadingState } from '@/shared/ui'

export function ProtectedRoute() {
  const location = useLocation()
  const isHydrated = useAppStore((s) => s.isHydrated)
  const isAuthenticated = useAppStore(selectIsAuthenticated)

  if (!isHydrated) {
    return <LoadingState label="Starting up" fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
