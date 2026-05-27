import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'

export interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: string
  error?: string
  rightAdornment?: ReactNode
}

export const AuthField = forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField(
    { label, icon, error, rightAdornment, className, id: idProp, ...props },
    ref,
  ) {
    const autoId = useId()
    const id = idProp ?? autoId
    const errorId = error ? `${id}-error` : undefined

    return (
      <div className={cn('flex flex-col gap-2', className)}>
        <label
          htmlFor={id}
          className="flex items-center gap-2 font-mono text-xs font-medium tracking-widest text-on-surface-variant uppercase"
        >
          <MaterialIcon
            name={icon}
            className="text-base text-primary-container/70"
          />
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={errorId}
            className={cn(
              'glass-input w-full rounded-lg border border-outline-variant/50',
              'bg-surface-container-low/60 px-4 py-3 font-body text-base text-on-surface',
              'placeholder:text-outline-variant/60',
              'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
              rightAdornment ? 'pr-12' : undefined,
              error && 'border-error/60',
            )}
            {...props}
          />
          {rightAdornment}
        </div>
        {error && (
          <p id={errorId} role="alert" className="text-xs text-error">
            {error}
          </p>
        )}
      </div>
    )
  },
)
