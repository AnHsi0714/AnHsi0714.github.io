import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavBar from './components/NavBar'

export default function App() {
  const { hash, pathname } = useLocation()

  // React Router 不會自動捲到 hash 對應的元素（只有整頁重新載入時瀏覽器原生行為才會），
  // SPA 內導覽（如 NavBar 的 CV、首頁的研究興趣連結）需要自己補這段。
  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
