import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { Spinner } from './Spinner'

type HexVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type HexSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<HexVariant, string> = {
  primary:
    'bg-cyber-accent/15 text-cyber-accent border-cyber-accent/60 hover:bg-cyber-accent/25 hover:border-cyber-accent shadow-glow',
  secondary:
    'bg-cyber-surface text-cyber-text border-cyber-border hover:bg-cyber-surface-hover hover:border-cyber-border-glow',
  ghost:
    'bg-transparent text-cyber-text-muted border-transparent hover:text-cyber-text hover:bg-cyber-surface/60',
  danger:
    'bg-cyber-danger/10 text-cyber-danger border-cyber-danger/50 hover:bg-cyber-danger/20',
}

const sizeClasses: Record<HexSize, string> = {
  sm: 'min-h-9 px-4 text-sm gap-1.5',
  md: 'min-h-11 px-5 text-base gap-2',
  lg: 'min-h-12 px-6 text-lg gap-2.5',
}

export interface HexButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: HexVariant
  size?: HexSize
  fullWidth?: boolean
  isLoading?: boolean
  loadingText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export function HexButton({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  type = 'button',
  ...props
}: HexButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      aria-disabled={isDisabled || undefined}
      className={cn(
        'inline-flex items-center justify-center font-display font-semibold uppercase tracking-wider',
        'border-2 rounded-[var(--radius-hex)] transition-colors duration-200',
        'disabled:opacity-45 disabled:pointer-events-none disabled:shadow-none',
        'touch-manipulation select-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        <>
          {leftIcon}
          <span>{children}</span>
          {rightIcon}
        </>
      )}
    </button>
  )
}
