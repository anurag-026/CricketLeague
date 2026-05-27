import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export interface CyberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: string
  error?: string
  leftAdornment?: ReactNode
  rightAdornment?: ReactNode
}

export const CyberInput = forwardRef<HTMLInputElement, CyberInputProps>(
  function CyberInput(
    {
      label,
      hint,
      error,
      leftAdornment,
      rightAdornment,
      className,
      id: idProp,
      disabled,
      required,
      ...props
    },
    ref,
  ) {
    const autoId = useId()
    const id = idProp ?? autoId
    const hintId = hint ? `${id}-hint` : undefined
    const errorId = error ? `${id}-error` : undefined
    const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

    return (
      <div className={cn('flex w-full flex-col gap-1.5', className)}>
        <label
          htmlFor={id}
          className="font-body text-sm font-semibold uppercase tracking-wider text-cyber-text-muted"
        >
          {label}
          {required && (
            <span className="text-cyber-danger ml-0.5" aria-hidden>
              *
            </span>
          )}
        </label>

        <div
          className={cn(
            'flex items-center gap-2 rounded-[var(--radius-hex)] border-2 bg-cyber-bg-elevated px-3',
            'transition-[border-color,box-shadow] duration-200',
            'focus-within:border-cyber-accent focus-within:shadow-glow',
            error
              ? 'border-cyber-danger'
              : 'border-cyber-border hover:border-cyber-border-glow',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          {leftAdornment}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            className={cn(
              'min-h-11 w-full flex-1 bg-transparent py-2 font-body text-cyber-text',
              'placeholder:text-cyber-text-dim outline-none',
              'disabled:cursor-not-allowed',
            )}
            {...props}
          />
          {rightAdornment}
        </div>

        {hint && !error && (
          <p id={hintId} className="text-xs text-cyber-text-dim">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-cyber-danger">
            {error}
          </p>
        )}
      </div>
    )
  },
)
