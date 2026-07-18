import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar'

export default function App() {
  const { hash, pathname } = useLocation()

  // React Router 不會自動捲到 hash 對應的元素、也不會在切換路由時重置捲動位置
  // （只有整頁重新載入時瀏覽器原生行為才會），SPA 內導覽（如 NavBar 的 CV、首頁的
  // 研究興趣連結、About 的「查看完整經歷」）都需要自己補這段，否則會停留在上一頁的捲動位置。
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      window.scrollTo(0, 0)
    }
  }, [hash, pathname])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8 pt-20">
        <Outlet />
      </main>
    </div>
  )
}
