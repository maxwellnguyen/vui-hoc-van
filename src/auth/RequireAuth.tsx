import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import type { Role } from '../lib/types'
import { Loading } from '../components/ui'

export function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { session, profile, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <Loading />
  if (!session) return <Navigate to="/login" state={{ from: loc.pathname }} replace />
  if (role && profile && profile.role !== role) return <Navigate to="/" replace />
  if (role && !profile) return <Loading />
  return <>{children}</>
}
