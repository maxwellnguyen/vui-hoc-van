import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'
import { Whale } from '../components/ui'

const ISLANDS = [
  { to: '/am', title: 'Đảo Âm', desc: 'Âm chính · Âm phụ · Phụ âm ghép', emoji: '🐚', color: 'from-lagoon to-ocean' },
  { to: '/van', title: 'Đảo Vần', desc: 'Đọc · Đúng – sai · Ghép vần', emoji: '🐙', color: 'from-aqua to-lagoon' },
  { to: '/thanh', title: 'Đảo Thanh', desc: 'Sắc · Huyền · Hỏi · Ngã · Nặng', emoji: '🐢', color: 'from-ocean to-ocean-deep' },
  { to: '/bai', title: 'Ôn tập theo bài', desc: 'Bảng vần · Ngôi sao · Đoạn văn', emoji: '⭐', color: 'from-star to-coral' },
  { to: '/tro-choi', title: 'Trò chơi', desc: 'Lật thẻ · Đố nhanh · Kéo co', emoji: '🎮', color: 'from-[#9B2C8F] to-[#C04BAE]' },
  { to: '/xep-hang', title: 'Đua rank', desc: 'Ai nhiều sao nhất tuần này?', emoji: '🏆', color: 'from-seaweed to-lagoon' },
]

export function Home() {
  const { profile } = useAuth()
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center gap-4">
        <Whale className="h-24 w-24 animate-bob" />
        <div>
          <h1 className="font-display text-4xl font-extrabold">Chào {profile?.display_name ?? 'bé'}! 👋</h1>
          <p className="text-xl text-ocean">Hôm nay bé muốn học gì nào?</p>
        </div>
      </div>
      <div className="grid w-full gap-6 sm:grid-cols-2">
        {ISLANDS.map((i, idx) => (
          <Link key={i.to} to={i.to}
            className={`group relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${i.color} p-6 text-white shadow-xl transition hover:-translate-y-1`}>
            <span className="absolute -right-4 -top-4 text-9xl opacity-30 transition group-hover:rotate-12">{i.emoji}</span>
            <span className="animate-bob inline-block text-6xl" style={{ animationDelay: `${idx * 0.4}s` }}>{i.emoji}</span>
            <h2 className="mt-2 font-display text-4xl font-extrabold">{i.title}</h2>
            <p className="text-lg opacity-90">{i.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
