import { useEffect, useRef, useState, type HTMLAttributes } from 'react'
import styles from './Card.module.scss'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

export default function Card({ hoverable = false, className, ...rest }: CardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isCentered, setIsCentered] = useState(false)

  useEffect(() => {
    if (!hoverable) return
    // 只在沒有滑鼠 hover 的觸控裝置上啟用，桌機維持原本 :hover 行為
    if (!window.matchMedia('(hover: none) and (pointer: coarse)').matches) return
    const el = ref.current
    if (!el) return

    // rootMargin 把偵測範圍縮成畫面正中央的一條窄帶，卡片進入該帶即視為「置中」
    const observer = new IntersectionObserver(([entry]) => setIsCentered(entry.isIntersecting), {
      rootMargin: '-45% 0px -45% 0px',
      threshold: 0,
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [hoverable])

  const classNames = [styles.card, hoverable && styles.hoverable, isCentered && styles.centered, className]
    .filter(Boolean)
    .join(' ')

  return <div ref={ref} className={classNames} {...rest} />
}
