import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export function Input({
  className = '',
  error,
  id,
  label,
  ...props
}: InputProps) {
  const fieldId = id ?? props.name
  const classes = ['ui-input', className].filter(Boolean).join(' ')

  return (
    <label className="ui-field" htmlFor={fieldId}>
      {label ? <span className="ui-field__label">{label}</span> : null}
      <input className={classes} id={fieldId} {...props} />
      {error ? <span className="ui-field__error">{error}</span> : null}
    </label>
  )
}
