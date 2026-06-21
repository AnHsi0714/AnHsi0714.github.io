import type { HTMLAttributes } from 'react'
import styles from './Alert.module.scss'

type AlertVariant = 'info' | 'success' | 'error'

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
}

export default function Alert({ variant = 'info', className, ...rest }: AlertProps) {
  const classNames = [styles.alert, styles[variant], className].filter(Boolean).join(' ')

  return <div role="alert" className={classNames} {...rest} />
}
