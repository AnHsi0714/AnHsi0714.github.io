import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaw } from '@fortawesome/free-solid-svg-icons'
import styles from './ProgressBar.module.scss'

type ProgressBarVariant = 'default' | 'segmented' | 'footprint'

interface ProgressBarProps {
  current?: number
  target?: number
  unit?: string
  progress?: number
  variant?: ProgressBarVariant
  steps?: number
  className?: string
}

const DEFAULT_SEGMENT_COUNT = 20
const DEFAULT_FOOTPRINT_COUNT = 8

export default function ProgressBar({
  current,
  target,
  unit = '',
  progress,
  variant = 'default',
  steps,
  className,
}: ProgressBarProps) {
  const hasLabel = current !== undefined && target !== undefined
  const percent = hasLabel
    ? target! > 0
      ? Math.min(100, Math.max(0, (current! / target!) * 100))
      : 0
    : Math.min(100, Math.max(0, progress ?? 0))

  const progressbarProps = {
    role: 'progressbar' as const,
    'aria-valuenow': hasLabel ? current : percent,
    'aria-valuemin': 0,
    'aria-valuemax': hasLabel ? target : 100,
  }

  const segmentCount = steps ?? DEFAULT_SEGMENT_COUNT
  const footprintCount = steps ?? DEFAULT_FOOTPRINT_COUNT

  return (
    <div className={className ? [styles.wrapper, className].join(' ') : styles.wrapper}>
      {variant === 'segmented' ? (
        <div className={styles.segments} {...progressbarProps}>
          {Array.from({ length: segmentCount }).map((_, i) => {
            const segmentFill = Math.min(1, Math.max(0, (percent / 100) * segmentCount - i))
            return (
              <span key={i} className={styles.segment}>
                <span className={styles.segmentFill} style={{ width: `${segmentFill * 100}%` }} />
              </span>
            )
          })}
        </div>
      ) : variant === 'footprint' ? (
        <div className={styles.footprints} {...progressbarProps}>
          {Array.from({ length: footprintCount }).map((_, i) => {
            const stepFill = Math.min(1, Math.max(0, (percent / 100) * footprintCount - i))
            return (
              <span key={i} className={styles.footprint} style={{ opacity: stepFill }}>
                <FontAwesomeIcon icon={faPaw} className={styles.footprintIcon} aria-hidden="true" />
              </span>
            )
          })}
        </div>
      ) : (
        <div className={styles.track} {...progressbarProps}>
          <div className={styles.fill} style={{ width: `${percent}%` }} />
        </div>
      )}
      {hasLabel && (
        <span className={styles.label}>
          {current}/{target}
          {unit}
        </span>
      )}
    </div>
  )
}
