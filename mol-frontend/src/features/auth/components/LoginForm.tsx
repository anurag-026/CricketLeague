import { useState, type FormEvent } from 'react'
import { login } from '@/features/auth/api'
import { useAppStore } from '@/app/store'
import type { ApiError } from '@/shared/types'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'
import { AuthField } from './AuthField'
import { GlassPanel } from './GlassPanel'
import { KineticButton } from './KineticButton'

export interface LoginFormProps {
  onSuccess: () => void
  onRegisterClick: () => void
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const setAuth = useAppStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function validate(): boolean {
    const next: typeof fieldErrors = {}
    if (!email.trim()) next.email = 'Identity required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Invalid email format'
    if (!password) next.password = 'Access code required'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setIsLoading(true)
    try {
      const res = await login({ email: email.trim(), password })
      setAuth(res.token, {
        userId: res.userId,
        username: res.username,
        email: email.trim(),
      })
      onSuccess()
    } catch (err) {
      const apiErr = err as ApiError
      setFormError(apiErr.error ?? 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GlassPanel>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex w-full flex-col gap-6"
        noValidate
      >
        <AuthField
          label="Identity [Email]"
          icon="terminal"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="player@mol.arena"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />

        <div className="flex flex-col gap-2">
          <AuthField
            label="Access Code [Password]"
            icon="lock"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
            rightAdornment={
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-outline-variant transition-colors hover:text-primary-container"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <MaterialIcon
                  name={showPassword ? 'visibility' : 'visibility_off'}
                  className="text-xl"
                />
              </button>
            }
          />
          <div className="mt-1 flex justify-end">
            <button
              type="button"
              className="font-mono text-xs font-medium tracking-widest text-secondary-fixed-dim uppercase transition-colors hover:text-secondary-fixed"
              onClick={() =>
                setFormError('Password recovery is not available yet.')
              }
            >
              Bypass Code?
            </button>
          </div>
        </div>

        {formError && (
          <p role="alert" className="text-center text-sm text-error">
            {formError}
          </p>
        )}

        <KineticButton isLoading={isLoading}>Enter Arena</KineticButton>
      </form>

      <p className="mt-8 text-center text-base text-on-surface-variant">
        Unregistered Agent?{' '}
        <button
          type="button"
          onClick={onRegisterClick}
          className="ml-1 font-bold text-primary-container underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Create New Profile
        </button>
      </p>
    </GlassPanel>
  )
}
