import type { ReactNode } from 'react'
import { useMonsterColors } from './Loading'
import styles from './EmptyState.module.scss'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  const monsterColors = useMonsterColors()

  return (
    <div className={styles.wrapper}>
      <div className={styles.monster} style={monsterColors} aria-hidden="true">
        <div className={styles.eye}>
          <div className={styles.eyeball}></div>
        </div>
        <div className={styles.mouth}>
          <span className={styles.drop}></span>
        </div>
      </div>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
