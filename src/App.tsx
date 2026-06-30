import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'

export default function App() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8 pt-20">
        <Outlet />
      </main>
    </div>
  )
}
