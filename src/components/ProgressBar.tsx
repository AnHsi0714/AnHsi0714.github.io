import styles from './ProgressBar.module.scss'

interface ProgressBarProps {
  current?: number
  target?: number
  unit?: string
  progress?: number
  className?: string
}

export default function ProgressBar({ current, target, unit = '', progress, className }: ProgressBarProps) {
  const hasLabel = current !== undefined && target !== undefined
  const percent = hasLabel
    ? target! > 0
      ? Math.min(100, Math.max(0, (current! / target!) * 100))
      : 0
    : Math.min(100, Math.max(0, progress ?? 0))

  return (
    <div className={className ? [styles.wrapper, className].join(' ') : styles.wrapper}>
      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={hasLabel ? current : percent}
        aria-valuemin={0}
        aria-valuemax={hasLabel ? target : 100}
      >
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      {hasLabel && (
        <span className={styles.label}>
          {current}/{target}
          {unit}
        </span>
      )}
    </div>
  )
}
