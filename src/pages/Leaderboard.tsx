import { useState } from 'react'
import { fetchLeaderboard, useAsync } from '../lib/api'
import { useAuth } from '../auth/AuthProvider'
import { Card, Loading } from '../components/ui'

const MEDALS = ['🥇', '🥈', '🥉']
const PODIUM = [
  { place: 1, h: 'h-28', bg: 'from-star to-[#f0b400]' },
  { place: 0, h: 'h-40', bg: 'from-star to-coral' },
  { place: 2, h: 'h-20', bg: 'from-aqua to-lagoon' },
]
const AVATARS = ['🐬', '🐢', '🐙', '🦀', '🐠', '🐳', '🦑', '🐡', '🦭', '🪼']
const avatar = (id: string) => AVATARS[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATARS.length]

export function Leaderboard() {
  const { profile } = useAuth()
  const [days, setDays] = useState<number | null>(7)
  const { data, loading, error } = useAsync(() => fetchLeaderboard(days), [days])
  const rows = data ?? []

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-display text-4xl font-extrabold">Đua rank 🏆</h1>
      <div className="flex gap-2">
        {([[7, 'Tuần này'], [null, 'Mọi lúc']] as const).map(([d, label]) => (
          <button key={label} onClick={() => setDays(d)}
            className={`rounded-2xl px-5 py-2 font-display text-xl font-bold ${days === d ? 'bg-ocean text-white' : 'bg-white/80'}`}>{label}</button>
        ))}
      </div>
      {loading ? <Loading /> : error ? (
        <p className="text-coral">Chưa tải được bảng xếp hạng ({error}). Giáo viên cần chạy lại <code>supabase/schema.sql</code>.</p>
      ) : rows.length === 0 ? <Card>Chưa có ai làm bài {days ? 'trong tuần này' : ''}. Làm bài để lên bảng nhé!</Card> : (
        <>
          {/* bục vinh quang top 3 */}
          <div className="mx-auto flex w-full max-w-xl items-end justify-center gap-3">
            {PODIUM.map(({ place, h, bg }) => {
              const r = rows[place]
              if (!r) return <div key={place} className="flex-1" />
              return (
                <div key={place} className="flex flex-1 animate-pop flex-col items-center gap-1" style={{ animationDelay: `${place * 150}ms` }}>
                  <span className="animate-bob text-5xl">{avatar(r.user_id)}</span>
                  <b className="max-w-full truncate font-display text-lg">{r.display_name}</b>
                  <span className="font-bold">⭐ {r.stars}</span>
                  <div className={`flex w-full items-start justify-center rounded-t-2xl bg-gradient-to-b ${bg} ${h} pt-2 text-4xl shadow-lg`}>{MEDALS[place]}</div>
                </div>
              )
            })}
          </div>
          <Card>
            <ol className="divide-y divide-foam">
              {rows.map((r, i) => (
                <li key={r.user_id} className={`flex items-center gap-3 py-2 ${r.user_id === profile?.id ? 'rounded-xl bg-star/30 px-2 font-bold' : ''}`}>
                  <span className="w-8 text-center font-display text-xl font-bold text-ocean">{MEDALS[i] ?? i + 1}</span>
                  <span className="text-3xl">{avatar(r.user_id)}</span>
                  <span className="flex-1 truncate">{r.display_name}{r.user_id === profile?.id && ' (bé)'}</span>
                  <span className="text-sm text-ocean">{r.exercises} bài</span>
                  <span className="w-16 text-right font-display text-xl font-bold">⭐ {r.stars}</span>
                </li>
              ))}
            </ol>
          </Card>
        </>
      )}
    </div>
  )
}
