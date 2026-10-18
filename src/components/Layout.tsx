import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { OceanBackground, SeaCreatures, Whale } from './ui'

export function Layout() {
  const { profile, signOut } = useAuth()
  const link = ({ isActive }: { isActive: boolean }) =>
    `rounded-xl px-3 py-2 font-display text-lg font-bold ${isActive ? 'bg-white text-ocean-deep' : 'text-white hover:bg-white/20'}`

  return (
    <div className="min-h-screen pb-32">
      <OceanBackground />
      <SeaCreatures />
      <header className="sticky top-0 z-20 bg-ocean-deep/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-2">
          <Link to="/" className="mr-2 flex items-center gap-1">
            <Whale className="h-10 w-10" />
            <span className="font-display text-2xl font-extrabold text-white">Vui học cùng bé</span>
          </Link>
          <nav className="flex flex-wrap gap-1">
            <NavLink to="/am" className={link}>Âm</NavLink>
            <NavLink to="/van" className={link}>Vần</NavLink>
            <NavLink to="/thanh" className={link}>Thanh</NavLink>
            <NavLink to="/bai" className={link}>Ôn tập</NavLink>
            <NavLink to="/tro-choi" className={link}>Trò chơi</NavLink>
            <NavLink to="/xep-hang" className={link}>Đua rank</NavLink>
            {profile?.role === 'teacher' && <NavLink to="/admin" className={link}>Giáo viên</NavLink>}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NavLink to="/me" className={link}>👤 {profile?.display_name ?? profile?.username}</NavLink>
            <button onClick={signOut} className="rounded-xl px-3 py-2 text-sm text-aqua hover:bg-white/10">Thoát</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
