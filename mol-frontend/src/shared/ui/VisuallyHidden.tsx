import type { HTMLAttributes, ReactNode } from 'react'

/** Screen-reader-only text; keeps visible UI minimal while staying accessible. */
export function VisuallyHidden({
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
  return (
    <span className="sr-only" {...props}>
      {children}
    </span>
  )
}
