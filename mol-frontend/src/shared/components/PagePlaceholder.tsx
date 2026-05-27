import { GlowText } from '@/shared/ui'

export interface PagePlaceholderProps {
  screen: 1 | 2 | 3 | 4
  title: string
  description?: string
}

/** Temporary shell until screen designs are implemented from screenshots. */
export function PagePlaceholder({
  screen,
  title,
  description = 'Screen layout will be added when designs are provided.',
}: PagePlaceholderProps) {
  return (
    <div className="flex min-h-[40dvh] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <GlowText variant="label" tone="neutral">
        Screen {screen}
      </GlowText>
      <GlowText as="h1" variant="display" tone="accent">
        {title}
      </GlowText>
      <p className="max-w-md text-cyber-text-muted">{description}</p>
    </div>
  )
}
