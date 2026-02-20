import type { HTMLAttributes } from 'react'

type BadgeVariant = 'danger' | 'neutral' | 'success' | 'warning'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({
  className = '',
  variant = 'neutral',
  ...props
}: BadgeProps) {
  const classes = ['ui-badge', `ui-badge--${variant}`, className]
    .filter(Boolean)
    .join(' ')

  return <span className={classes} {...props} />
}
