import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode
  error?: string
  helperText?: string
  label?: string
}

export function Select({
  'aria-describedby': ariaDescribedBy,
  children,
  className = '',
  error,
  helperText,
  id,
  label,
  ...props
}: SelectProps) {
  const generatedId = useId()
  const fieldId = id ?? props.name ?? generatedId
  const classes = ['ui-select', className].filter(Boolean).join(' ')

  const helperId = helperText && fieldId ? `${fieldId}-helper` : undefined
  const errorId = error && fieldId ? `${fieldId}-error` : undefined
  const describedBy = [ariaDescribedBy, helperId, errorId]
    .filter(Boolean)
    .join(' ')

  return (
    <label className="ui-field" htmlFor={fieldId}>
      {label ? <span className="ui-field__label">{label}</span> : null}
      <select
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : undefined}
        className={classes}
        id={fieldId}
        {...props}
      >
        {children}
      </select>
      {helperText && helperId ? (
        <span className="ui-field__helper" id={helperId}>
          {helperText}
        </span>
      ) : null}
      {error && errorId ? (
        <span className="ui-field__error" id={errorId}>
          {error}
        </span>
      ) : null}
    </label>
  )
}
