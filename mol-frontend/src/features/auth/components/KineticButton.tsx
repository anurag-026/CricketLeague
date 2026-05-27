import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'
import { MaterialIcon } from '@/shared/ui/MaterialIcon'
import { Spinner } from '@/shared/ui/Spinner'

export interface KineticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: string
  isLoading?: boolean
  children: ReactNode
}

export function KineticButton({
  icon = 'bolt',
  isLoading = false,
  children,
  className,
  disabled,
  type = 'submit',
  ...props
}: KineticButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'kinetic-btn mt-4 flex w-full items-center justify-center gap-3',
        'rounded-lg border border-primary-container bg-surface-container-lowest py-4',
        'font-mono text-xl font-bold tracking-widest text-primary-container uppercase',
        'shadow-[0_0_15px_rgba(0,229,255,0.2)]',
        'transition-all duration-300',
        'hover:border-primary-container/80 hover:bg-linear-to-r hover:from-primary-container/10 hover:to-secondary-container/20 hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" label="Submitting" />
      ) : (
        <MaterialIcon
          name={icon}
          className="transition-transform group-hover:translate-x-0.5"
        />
      )}
      {children}
    </button>
  )
}
