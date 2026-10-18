import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { OceanBackground, Whale } from './ui'
import { hasVietnameseVoice, speechSupported } from '../lib/speech'
import { useEffect, useState } from 'react'

export function Layout() {
  const { profile, signOut } = useAuth()
  const [noVoice, setNoVoice] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setNoVoice(!speechSupported() || !hasVietnameseVoice()), 1500)
    return () => clearTimeout(t)
  }, [])

  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-xl px-3 py-2 font-display text-lg font-bold ${isActive ? 'bg-white text-ocean-deep' : 'text-white hover:bg-white/20'}`

  return (
    <div className="min-h-screen pb-32">
      <OceanBackground />
      <header className="sticky top-0 z-20 bg-ocean-deep/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2">
          <Link to="/" className="mr-2 flex items-center gap-1">
            <Whale className="h-10 w-10" />
            <span className="font-display text-2xl font-extrabold text-white">Biển Chữ</span>
          </Link>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/am" className={link}>Âm</NavLink>
            <NavLink to="/van" className={link}>Vần</NavLink>
            <NavLink to="/thanh" className={link}>Thanh</NavLink>
            <NavLink to="/bai" className={link}>Ôn tập</NavLink>
            {profile?.role === 'teacher' && <NavLink to="/admin" className={link}>Giáo viên</NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/me" className={link}>👤 {profile?.display_name ?? profile?.username}</NavLink>
            <button onClick={signOut} className="rounded-xl px-3 py-2 text-sm text-aqua hover:bg-white/10">Thoát</button>
          </div>
        </div>
      </header>
      {noVoice && (
        <div className="mx-auto mt-3 max-w-5xl px-4">
          <p className="rounded-xl bg-sand p-3 text-sm">
            ⚠️ Trình duyệt chưa có giọng đọc tiếng Việt nên phần “nghe” có thể không đúng giọng.
            Hãy dùng Chrome/Edge mới, hoặc cài giọng Tiếng Việt trong cài đặt hệ điều hành.
          </p>
        </div>
      )}
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
