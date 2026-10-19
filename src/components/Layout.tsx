import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { AmbientSound } from './AmbientSound'
import { OceanBackground, SeaCreatures, Whale } from './ui'

export function Layout() {
  const { profile, signOut } = useAuth()
  const link = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-xl px-2.5 py-2 font-display text-base font-bold xl:px-3 xl:text-lg ${isActive ? 'bg-white text-ocean-deep' : 'text-white hover:bg-white/20'}`
  const tab = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-14 min-w-16 flex-1 flex-col items-center justify-center rounded-2xl px-1 font-display text-sm font-bold ${isActive ? 'bg-white text-ocean-deep' : 'text-white active:bg-white/20'}`
  const items = [
    { to: '/am', label: 'Âm', icon: '🔤' },
    { to: '/van', label: 'Vần', icon: '🧩' },
    { to: '/thanh', label: 'Thanh', icon: '🎵' },
    { to: '/bai', label: 'Ôn tập', icon: '📚' },
    { to: '/tro-choi', label: 'Trò chơi', icon: '🎮' },
    { to: '/xep-hang', label: 'Đua rank', icon: '🏆' },
    ...(profile?.role === 'teacher' ? [{ to: '/admin', label: 'Giáo viên', icon: '🧑‍🏫' }] : []),
  ]

  return (
    <div className="min-h-screen pb-32">
      <OceanBackground />
      <SeaCreatures />
      <header className="sticky top-0 z-20 bg-ocean-deep/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2 sm:px-4">
          <Link to="/" className="mr-2 flex min-w-0 shrink-0 items-center gap-1 max-lg:shrink">
            <Whale className="h-8 w-8 shrink-0 sm:h-9 sm:w-9 lg:h-10 lg:w-10" />
            <span className="whitespace-nowrap font-display text-lg sm:text-xl font-extrabold text-white xl:text-2xl">Vui học cùng bé</span>
          </Link>
          <nav className="hidden flex-nowrap gap-0.5 lg:flex">
            {items.map((i) => <NavLink key={i.to} to={i.to} className={link}>{i.label}</NavLink>)}
          </nav>
          <div className="ml-auto flex shrink-0 items-center gap-0 sm:gap-1">
            <AmbientSound />
            <NavLink to="/me" className={link} aria-label="Hồ sơ">👤<span className="hidden xl:inline"> {profile?.display_name ?? profile?.username}</span></NavLink>
            <button onClick={signOut} aria-label="Thoát" className="min-h-11 min-w-11 rounded-xl px-2 py-2 text-sm text-aqua hover:bg-white/10"><span className="sm:hidden" aria-hidden>🚪</span><span className="hidden sm:inline">Thoát</span></button>
          </div>
        </div>
      </header>
      {/* Mobile: thanh điều hướng dưới đáy, vừa tầm ngón tay */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex gap-1 overflow-x-auto bg-ocean-deep/95 px-2 pt-2 backdrop-blur lg:hidden"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} className={tab}>
            <span className="text-xl leading-none" aria-hidden>{i.icon}</span>{i.label}
          </NavLink>
        ))}
      </nav>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
