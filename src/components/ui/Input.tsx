import { useId, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  helperText?: string
  label?: string
}

export function Input({
  'aria-describedby': ariaDescribedBy,
  className = '',
  error,
  helperText,
  id,
  label,
  ...props
}: InputProps) {
  const generatedId = useId()
  const fieldId = id ?? props.name ?? generatedId
  const classes = ['ui-input', className].filter(Boolean).join(' ')

  const helperId = helperText && fieldId ? `${fieldId}-helper` : undefined
  const errorId = error && fieldId ? `${fieldId}-error` : undefined
  const describedBy = [ariaDescribedBy, helperId, errorId]
    .filter(Boolean)
    .join(' ')

  return (
    <label className="ui-field" htmlFor={fieldId}>
      {label ? <span className="ui-field__label">{label}</span> : null}
      <input
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? 'true' : undefined}
        className={classes}
        id={fieldId}
        {...props}
      />
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
