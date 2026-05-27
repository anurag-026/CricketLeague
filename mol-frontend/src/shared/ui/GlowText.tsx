import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type GlowVariant = 'display' | 'title' | 'label' | 'muted'
type GlowTone = 'accent' | 'magenta' | 'success' | 'danger' | 'neutral'

const variantClasses: Record<GlowVariant, string> = {
  display:
    'font-display text-3xl sm:text-4xl font-bold tracking-widest uppercase',
  title: 'font-display text-xl sm:text-2xl font-semibold tracking-wide',
  label: 'font-body text-sm font-semibold uppercase tracking-wider',
  muted: 'font-body text-sm text-cyber-text-muted',
}

const toneClasses: Record<GlowTone, string> = {
  accent: 'text-cyber-accent [text-shadow:0_0_24px_var(--color-cyber-accent-dim)]',
  magenta:
    'text-cyber-magenta [text-shadow:0_0_20px_rgba(255,0,170,0.35)]',
  success: 'text-cyber-success',
  danger: 'text-cyber-danger',
  neutral: 'text-cyber-text',
}

export interface GlowTextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  variant?: GlowVariant
  tone?: GlowTone
  children: ReactNode
}

export function GlowText({
  as: Component = 'span',
  variant = 'title',
  tone = 'accent',
  className,
  children,
  ...props
}: GlowTextProps) {
  return (
    <Component
      className={cn(variantClasses[variant], toneClasses[tone], className)}
      {...props}
    >
      {children}
    </Component>
  )
}
