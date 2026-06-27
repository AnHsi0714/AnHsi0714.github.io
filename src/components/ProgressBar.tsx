import styles from './ProgressBar.module.scss'

interface ProgressBarProps {
  current: number
  target: number
  unit?: string
}

export default function ProgressBar({ current, target, unit = '' }: ProgressBarProps) {
  const percent = target > 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0

  return (
    <div className={styles.wrapper}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={target}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <span className={styles.label}>
        {current}/{target}
        {unit}
      </span>
    </div>
  )
}
