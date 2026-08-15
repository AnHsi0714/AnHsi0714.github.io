import { useEffect } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import NavBar from './components/NavBar'
import { useTrail } from './context/TrailContext'

// 文章／專案／知識點的詳情頁路徑，「軌跡」只在這三種頁面之間累積
const DETAIL_PATH_PATTERN = /^\/(articles|projects|knowledge)\/[^/]+$/

// history entry 的 key → 離開該頁時的捲動位置，讓瀏覽器「上一頁」返回（POP）時能還原。
// 路徑（pathname+search）→ 離開該頁時的捲動位置，讓「回列表」這類語意上等同上一頁、
// 但技術上是 PUSH 的連結（見 TextLink 的 restoreScroll）也能還原，而不只是真正的瀏覽器返回。
// 放在 module scope 是因為 App 只掛載一次，需要跨路由切換存活。
const scrollPositionsByKey = new Map<string, number>()
const scrollPositionsByPath = new Map<string, number>()

export default function App() {
  const { hash, pathname, search, key, state } = useLocation()
  const navigationType = useNavigationType()
  const restoreScroll = Boolean((state as { restoreScroll?: boolean } | null)?.restoreScroll)
  const { clearTrail } = useTrail()

  // 離開詳情頁（回列表、去別的分類、回首頁……）代表這次瀏覽流程結束，
  // 軌跡要歸零；停留在詳情頁之間串連時則不動它，讓 Trail 元件自己去 push
  useEffect(() => {
    if (!DETAIL_PATH_PATTERN.test(pathname)) {
      clearTrail()
    }
  }, [pathname, clearTrail])

  // React Router 不會自動捲到 hash 對應的元素、也不會在切換路由時重置捲動位置
  // （只有整頁重新載入時瀏覽器原生行為才會），SPA 內導覽（如 NavBar 的 CV、首頁的
  // 研究興趣連結、About 的「查看完整經歷」）都需要自己補這段。
  // 但兩種情況要還原離開時的捲動位置，而不是跳回最上面：
  // ① 瀏覽器「上一頁」返回（navigationType === 'POP'）
  // ② 語意上是「回列表」的連結（如知識點文章的「← 回知識列表」）——技術上仍是 PUSH，
  //    靠連結自己在 <Link state={{ restoreScroll: true }}> 標記意圖來還原對應路徑的位置。
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1)
      const el = document.getElementById(id)
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    if (navigationType === 'POP') {
      window.scrollTo(0, scrollPositionsByKey.get(key) ?? 0)
    } else if (restoreScroll) {
      window.scrollTo(0, scrollPositionsByPath.get(pathname + search) ?? 0)
    } else {
      window.scrollTo(0, 0)
    }
  }, [hash, pathname, search, key, navigationType, restoreScroll])

  // 持續記錄目前這頁的捲動位置，供之後返回這個 history entry／這個路徑時還原
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionsByKey.set(key, window.scrollY)
      scrollPositionsByPath.set(pathname + search, window.scrollY)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [key, pathname, search])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
