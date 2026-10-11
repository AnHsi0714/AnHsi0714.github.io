import { useEffect, useRef, useState } from 'react'

// 元素是否在（或接近）視窗內。給 WebGL／canvas 這類持續吃資源的內容決定要不要繼續畫，
// rootMargin 預留一段緩衝，捲進來之前就開始畫，避免使用者看到一幀空白。
export function useInView<T extends Element>(rootMargin = '200px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin })
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin])

  return { ref, inView }
}
