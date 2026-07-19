import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styles from './Modal.module.scss'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  ariaLabel?: string
  backdropClassName?: string
  panelClassName?: string
  /** 為 true 時點擊內容區塊本身也會關閉（僅內容裡明確 stopPropagation 的區塊除外），
   * 適合「整個彈窗都是可點擊關閉區」的用法（如 Friends 的作品詳情）。
   * 預設 false：點擊內容區塊不關閉，只有點背景或 Esc 才關閉（如 ExpandableCard）。 */
  closeOnContentClick?: boolean
}

export default function Modal({
  open,
  onClose,
  children,
  ariaLabel,
  backdropClassName,
  panelClassName,
  closeOnContentClick = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className={backdropClassName ? [styles.backdrop, backdropClassName].join(' ') : styles.backdrop}
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        className={panelClassName ? [styles.panel, panelClassName].join(' ') : styles.panel}
        onClick={closeOnContentClick ? undefined : (event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
