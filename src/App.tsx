import { Outlet } from 'react-router-dom'
import NavBar from './components/NavBar'

export default function App() {
  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <NavBar />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
