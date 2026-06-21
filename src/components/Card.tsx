import type { HTMLAttributes } from 'react'
import styles from './Card.module.scss'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export default function Card({ hoverable = false, className, ...rest }: CardProps) {
  const classNames = [styles.card, hoverable && styles.hoverable, className]
    .filter(Boolean)
    .join(' ')

  return <div className={classNames} {...rest} />
}
