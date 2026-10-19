import { useNavigate } from 'react-router-dom'
import { Button, OceanBackground, Whale } from '../components/ui'

export function NotFound() {
  const nav = useNavigate()
  return (
    <>
      <OceanBackground />
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <Whale mood="sad" className="h-32 w-32 animate-bob" />
        <h1 className="font-display text-5xl font-extrabold text-ocean-deep">404</h1>
        <p className="text-xl font-bold text-ocean-deep">Ôi, bé đi lạc mất rồi! Trang này không có.</p>
        <Button onClick={() => nav('/')}>🏠 Về trang chủ</Button>
      </main>
    </>
  )
}
