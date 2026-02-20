import type { ReactNode } from 'react'

interface CardProps {
  actions?: ReactNode
  children?: ReactNode
  className?: string
  subtitle?: string
  title?: string
}

export function Card({
  actions,
  children,
  className = '',
  subtitle,
  title,
}: CardProps) {
  return (
    <section className={`ui-card ${className}`.trim()}>
      {title || subtitle || actions ? (
        <header className="ui-card__header">
          <div>
            {title ? <h2 className="ui-card__title">{title}</h2> : null}
            {subtitle ? <p className="ui-card__subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div>{actions}</div> : null}
        </header>
      ) : null}
      {children ? <div className="ui-card__body">{children}</div> : null}
    </section>
  )
}
