import styles from './Loading.module.scss'

type LoadingSize = 'sm' | 'md' | 'lg'

interface LoadingProps {
  size?: LoadingSize
  label?: string
}

export default function Loading({ size = 'md', label }: LoadingProps) {
  return (
    <div className={styles.wrapper} role="status">
      <span className={[styles.spinner, styles[size]].join(' ')} aria-hidden="true" />
      {label && <span className={styles.label}>{label}</span>}
    </div>
  )
}
