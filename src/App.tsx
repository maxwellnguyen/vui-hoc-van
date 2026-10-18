import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { AuthPage } from './auth/LoginPage'
import { Layout } from './components/Layout'
import { OceanBackground } from './components/ui'
import { Home } from './pages/Home'
import { UnitsPage } from './pages/UnitsPage'
import { LessonPage, LessonsList, UnitPage } from './pages/PlayPage'
import { Profile } from './pages/Profile'
import { AdminLayout } from './admin/Admin'
import { GamePage, GamesHub } from './pages/Games'
import { Leaderboard } from './pages/Leaderboard'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<><OceanBackground /><AuthPage mode="login" /></>} />
          <Route path="/signup" element={<><OceanBackground /><AuthPage mode="signup" /></>} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Home />} />
            <Route path="am" element={<UnitsPage kind="am" />} />
            <Route path="van" element={<UnitsPage kind="van" />} />
            <Route path="thanh" element={<UnitsPage kind="thanh" />} />
            <Route path="unit/:id" element={<UnitPage />} />
            <Route path="bai" element={<LessonsList />} />
            <Route path="bai/:number" element={<LessonPage />} />
            <Route path="tro-choi" element={<GamesHub />} />
            <Route path="tro-choi/:id" element={<GamePage />} />
            <Route path="xep-hang" element={<Leaderboard />} />
            <Route path="me" element={<Profile />} />
            <Route path="admin/*" element={<RequireAuth role="teacher"><AdminLayout /></RequireAuth>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
