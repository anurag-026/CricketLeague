import { useState, type FormEvent } from 'react'
import { register } from '@/features/auth/api'
import { useAppStore } from '@/app/store'
import type { ApiError } from '@/shared/types'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'
import { AuthField } from './AuthField'
import { GlassPanel } from './GlassPanel'
import { KineticButton } from './KineticButton'

export interface RegisterFormProps {
  onSuccess: () => void
  onLoginClick: () => void
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const setAuth = useAppStore((s) => s.setAuth)

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string
    email?: string
    password?: string
  }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  function validate(): boolean {
    const next: typeof fieldErrors = {}
    if (!username.trim()) next.username = 'Callsign required'
    else if (username.trim().length < 3) next.username = 'Minimum 3 characters'
    if (!email.trim()) next.email = 'Identity required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Invalid email format'
    if (!password) next.password = 'Access code required'
    else if (password.length < 8) next.password = 'Minimum 8 characters'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(null)
    if (!validate()) return

    setIsLoading(true)
    try {
      const res = await register({
        username: username.trim(),
        email: email.trim(),
        password,
      })
      setAuth(res.token, {
        userId: res.userId,
        username: username.trim(),
        email: email.trim(),
      })
      onSuccess()
    } catch (err) {
      const apiErr = err as ApiError
      setFormError(apiErr.error ?? 'Registration failed')
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
          label="Callsign [Username]"
          icon="badge"
          name="username"
          type="text"
          autoComplete="username"
          placeholder="agent_alpha"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={fieldErrors.username}
          required
        />

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

        <AuthField
          label="Access Code [Password]"
          icon="lock"
          name="password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
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

        {formError && (
          <p role="alert" className="text-center text-sm text-error">
            {formError}
          </p>
        )}

        <KineticButton isLoading={isLoading} icon="person_add">
          Create Profile
        </KineticButton>
      </form>

      <p className="mt-8 text-center text-base text-on-surface-variant">
        Already registered?{' '}
        <button
          type="button"
          onClick={onLoginClick}
          className="ml-1 font-bold text-primary-container underline-offset-4 transition-colors hover:text-primary hover:underline"
        >
          Enter Arena
        </button>
      </p>
    </GlassPanel>
  )
}
