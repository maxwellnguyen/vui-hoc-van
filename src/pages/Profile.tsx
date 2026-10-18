import { bestStars, fetchMyAttempts, useAsync } from '../lib/api'
import { useAuth } from '../auth/AuthProvider'
import { Card, Loading, StarRating, Whale } from '../components/ui'

const BADGES = [
  { need: 1, emoji: '🐠', name: 'Cá con' },
  { need: 10, emoji: '🐢', name: 'Rùa chăm chỉ' },
  { need: 30, emoji: '🐬', name: 'Cá heo thông minh' },
  { need: 60, emoji: '🐳', name: 'Cá voi xanh' },
  { need: 100, emoji: '👑', name: 'Vua biển chữ' },
]

export function Profile() {
  const { profile } = useAuth()
  const { data, loading } = useAsync(fetchMyAttempts, [])
  if (loading) return <Loading />
  const attempts = data ?? []
  const best = bestStars(attempts)
  const total = [...best.values()].reduce((a, b) => a + b, 0)

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex items-center gap-4">
        <Whale className="h-24 w-24 animate-bob" />
        <div>
          <h1 className="font-display text-4xl font-extrabold">{profile?.display_name}</h1>
          <p className="text-ocean">@{profile?.username}</p>
          <p className="mt-2 font-display text-2xl">⭐ {total} sao · {best.size} bài đã làm</p>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-display text-2xl font-bold">Huy hiệu</h2>
        <div className="flex flex-wrap gap-4">
          {BADGES.map((b) => (
            <div key={b.name} className={`flex w-28 flex-col items-center rounded-2xl p-3 text-center ${total >= b.need ? 'bg-sand' : 'opacity-30 grayscale'}`}>
              <span className="text-5xl">{b.emoji}</span>
              <span className="font-bold">{b.name}</span>
              <span className="text-xs">{b.need} sao</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-display text-2xl font-bold">Lần làm gần đây</h2>
        <ul className="divide-y divide-foam">
          {attempts.slice(0, 15).map((a) => (
            <li key={a.id} className="flex justify-between py-2">
              <span>Bài #{a.exercise_id} · {new Date(a.created_at).toLocaleString('vi-VN')}</span>
              <span>{a.score}đ <StarRating stars={a.stars} size="text-base" /></span>
            </li>
          ))}
          {attempts.length === 0 && <li>Bé chưa làm bài nào. Bắt đầu thôi!</li>}
        </ul>
      </Card>
    </div>
  )
}
