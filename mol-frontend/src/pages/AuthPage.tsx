import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore, selectIsAuthenticated } from '@/app/store'
import {
  AuthAmbientBackground,
  AuthLogo,
  LoginForm,
  RegisterForm,
  TelemetryChips,
} from '@/features/auth/components'

type AuthMode = 'login' | 'register'

/** Screen 1 — Identity / access (login & register). */
export function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAppStore(selectIsAuthenticated)
  const [mode, setMode] = useState<AuthMode>('login')

  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? '/dashboard'

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  function handleSuccess() {
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background text-on-background antialiased">
      <AuthAmbientBackground />

      <main className="relative z-10 flex w-full max-w-md flex-col items-center px-margin-mobile md:px-margin-desktop">
        <AuthLogo />

        {mode === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onRegisterClick={() => setMode('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onLoginClick={() => setMode('login')}
          />
        )}

        <TelemetryChips />
      </main>
    </div>
  )
}
