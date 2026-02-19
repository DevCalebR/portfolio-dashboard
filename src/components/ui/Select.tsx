import type { ReactNode, SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
  error?: string
  label?: string
}

export function Select({
  children,
  className = '',
  error,
  id,
  label,
  ...props
}: SelectProps) {
  const fieldId = id ?? props.name
  const classes = ['ui-select', className].filter(Boolean).join(' ')

  return (
    <label className="ui-field" htmlFor={fieldId}>
      {label ? <span className="ui-field__label">{label}</span> : null}
      <select className={classes} id={fieldId} {...props}>
        {children}
      </select>
      {error ? <span className="ui-field__error">{error}</span> : null}
    </label>
  )
}
