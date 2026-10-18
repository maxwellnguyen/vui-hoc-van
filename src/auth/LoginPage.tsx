import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { Button, Whale } from '../components/ui'

export function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { session, signIn, signUp } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const err = mode === 'login'
      ? await signIn(username, password)
      : await signUp(username, displayName, password)
    setBusy(false)
    if (err) setError(err)
    else nav((loc.state as { from?: string } | null)?.from ?? '/', { replace: true })
  }

  const input = 'w-full rounded-2xl border-4 border-aqua bg-white px-4 py-3 text-xl outline-none focus:border-lagoon'

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[2rem] bg-white/90 p-6 shadow-xl backdrop-blur">
        <div className="mb-4 flex flex-col items-center">
          <Whale className="h-24 w-24 animate-bob" />
          <h1 className="font-display text-4xl font-extrabold text-ocean-deep">Biển Chữ</h1>
          <p className="text-ocean">{mode === 'login' ? 'Chào bé! Đăng nhập để học nhé' : 'Tạo tài khoản mới'}</p>
        </div>
        <label className="mb-3 block">
          <span className="mb-1 block font-bold text-ocean-deep">Tên đăng nhập</span>
          <input className={input} value={username} onChange={(e) => setUsername(e.target.value)}
            autoComplete="username" autoCapitalize="none" required placeholder="vd: be_an" />
        </label>
        {mode === 'signup' && (
          <label className="mb-3 block">
            <span className="mb-1 block font-bold text-ocean-deep">Tên của bé</span>
            <input className={input} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="vd: Bé An" />
          </label>
        )}
        <label className="mb-4 block">
          <span className="mb-1 block font-bold text-ocean-deep">Mật khẩu</span>
          <input className={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={6} />
        </label>
        {error && <p className="mb-3 rounded-xl bg-coral/15 p-3 font-bold text-coral">{error}</p>}
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Đang xử lý…' : mode === 'login' ? 'Vào học 🚀' : 'Tạo tài khoản'}
        </Button>
        <p className="mt-4 text-center text-ocean">
          {mode === 'login'
            ? <>Chưa có tài khoản? <Link className="font-bold underline" to="/signup">Đăng ký</Link></>
            : <>Đã có tài khoản? <Link className="font-bold underline" to="/login">Đăng nhập</Link></>}
        </p>
      </form>
    </div>
  )
}
