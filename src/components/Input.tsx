import { useId } from 'react'
import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.scss'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, id, className, ...rest }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[styles.input, error && styles.inputError, className].filter(Boolean).join(' ')}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
