import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import confetti from 'canvas-confetti'
import { fetchWords, useAsync } from '../lib/api'
import { speak } from '../lib/speech'
import { starsFor } from '../lib/scoring'
import type { Word } from '../lib/types'
import { Button, Card, Loading, SpeakerButton, StarRating, Whale, WordImage } from '../components/ui'
import { shuffle } from '../exercises/common'

const GAMES = [
  { id: 'lat-the', emoji: '🃏', title: 'Lật thẻ ghép đôi', desc: 'Lật 2 thẻ: hình và chữ giống nhau là ăn điểm', color: 'from-lagoon to-ocean' },
  { id: 'do-nhanh', emoji: '⏱️', title: 'Đố nhanh', desc: 'Nhìn hình, nghe đọc – chọn chữ đúng trước khi hết giờ', color: 'from-star to-coral' },
  { id: 'keo-co', emoji: '🪢', title: 'Kéo co trí tuệ', desc: '2 đội thi đấu trên cùng một màn hình – đúng thì kéo dây', color: 'from-[#9B2C8F] to-[#C04BAE]' },
] as const

const celebrate = () => confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ['#FFD23F', '#20A4B8', '#FF7F6B', '#7FD6E0'] })

export function GamesHub() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-4xl font-extrabold">Trò chơi 🎮</h1>
      <div className="grid gap-5 sm:grid-cols-3">
        {GAMES.map((g, i) => (
          <Link key={g.id} to={`/tro-choi/${g.id}`}
            className={`group relative overflow-hidden rounded-[2rem] bg-gradient-to-br ${g.color} p-6 text-white shadow-xl transition hover:-translate-y-1`}>
            <span className="absolute -right-3 -top-3 text-8xl opacity-25 transition group-hover:rotate-12">{g.emoji}</span>
            <span className="inline-block animate-bob text-6xl" style={{ animationDelay: `${i * 0.4}s` }}>{g.emoji}</span>
            <h2 className="mt-2 font-display text-3xl font-extrabold">{g.title}</h2>
            <p className="opacity-90">{g.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function GamePage() {
  const { id } = useParams()
  const { data, loading, error } = useAsync(fetchWords, [])
  const words = useMemo(() => (data ?? []).filter((w) => w.emoji || w.image_url), [data])
  const game = GAMES.find((g) => g.id === id)
  if (loading) return <Loading />
  if (error) return <p className="text-coral">Lỗi: {error}</p>
  if (!game) return <p>Không tìm thấy trò chơi.</p>
  if (words.length < 6) return <p>Cần ít nhất 6 từ có hình để chơi. Giáo viên hãy thêm từ trong trang Giáo viên nhé.</p>
  return (
    <div className="flex flex-col gap-3">
      <Link to="/tro-choi" className="font-bold text-ocean-deep">← Trò chơi</Link>
      <h1 className="font-display text-3xl font-extrabold">{game.emoji} {game.title}</h1>
      {id === 'lat-the' && <MemoryGame words={words} />}
      {id === 'do-nhanh' && <QuickQuiz words={words} />}
      {id === 'keo-co' && <TugOfWar words={words} />}
    </div>
  )
}

function ResultCard({ score, onAgain, extra }: { score: number; onAgain: () => void; extra?: string }) {
  const stars = starsFor(score)
  useEffect(() => { if (stars === 3) celebrate(); speak(stars >= 2 ? 'Con giỏi lắm' : 'Cố gắng thêm nhé') }, [stars])
  return (
    <Card className="mx-auto flex max-w-md animate-pop flex-col items-center gap-3 text-center">
      <Whale className="h-24 w-24 animate-bob" mood={stars >= 1 ? 'happy' : 'sad'} />
      <h2 className="font-display text-4xl font-extrabold">{['Cố lên nào!', 'Khá lắm!', 'Giỏi quá!', 'Xuất sắc!'][stars]}</h2>
      <StarRating stars={stars} size="text-6xl" />
      <p className="text-xl text-ocean">{score} điểm{extra ? ` · ${extra}` : ''}</p>
      <Button onClick={onAgain}>Chơi lại 🔁</Button>
    </Card>
  )
}

/* ---------------- Lật thẻ ghép đôi ---------------- */
type MemCard = { key: string; word: Word; face: 'pic' | 'text' }

function MemoryGame({ words }: { words: Word[] }) {
  const PAIRS = 6
  const [round, setRound] = useState(0)
  const cards = useMemo<MemCard[]>(() => {
    const picked = shuffle(words).slice(0, PAIRS)
    return shuffle(picked.flatMap((w) => [{ key: `${w.id}p`, word: w, face: 'pic' as const }, { key: `${w.id}t`, word: w, face: 'text' as const }]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words, round])
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const [wrong, setWrong] = useState(false)

  const reset = () => { setRound((r) => r + 1); setOpen([]); setMatched(new Set()); setMoves(0) }

  const flip = (i: number) => {
    if (open.length === 2 || open.includes(i) || matched.has(cards[i].word.id)) return
    const next = [...open, i]
    setOpen(next)
    if (cards[i].face === 'text') speak(cards[i].word.text)
    if (next.length < 2) return
    setMoves((m) => m + 1)
    const [a, b] = next.map((k) => cards[k])
    if (a.word.id === b.word.id) {
      speak(a.word.text)
      setTimeout(() => { setMatched((s) => new Set(s).add(a.word.id)); setOpen([]) }, 500)
    } else {
      setWrong(true)
      setTimeout(() => { setOpen([]); setWrong(false) }, 900)
    }
  }

  if (matched.size === PAIRS) {
    const score = Math.max(40, 100 - Math.max(0, moves - PAIRS) * 8)
    return <ResultCard score={score} onAgain={reset} extra={`${moves} lượt lật`} />
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-ocean">Đã ghép {matched.size}/{PAIRS} đôi · {moves} lượt</p>
      <div className="grid w-full max-w-2xl grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((c, i) => {
          const up = open.includes(i) || matched.has(c.word.id)
          return (
            <button key={c.key} onClick={() => flip(i)} style={{ perspective: 800 }}
              className={`aspect-[4/3] ${wrong && open.includes(i) ? 'animate-shake' : ''}`}>
              <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
                style={{ transform: up ? 'rotateY(180deg)' : 'none' }}>
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-lagoon to-ocean text-5xl shadow-lg [backface-visibility:hidden]">🐚</div>
                <div className={`absolute inset-0 flex items-center justify-center rounded-2xl shadow-lg [backface-visibility:hidden] [transform:rotateY(180deg)] ${matched.has(c.word.id) ? 'bg-seaweed/25' : 'bg-white'}`}>
                  {c.face === 'pic'
                    ? <WordImage emoji={c.word.emoji} imageUrl={c.word.image_url} text={c.word.text} className="h-full w-full text-6xl" />
                    : <span className="px-1 text-center font-display text-2xl font-bold text-ocean-deep sm:text-3xl">{c.word.text}</span>}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------- Đố nhanh ---------------- */
function makeQuestions(words: Word[], n: number, opts: number) {
  return shuffle(words).slice(0, n).map((w) => ({
    word: w,
    options: shuffle([w, ...shuffle(words.filter((x) => x.id !== w.id)).slice(0, opts - 1)]),
  }))
}

function QuickQuiz({ words }: { words: Word[] }) {
  const N = 10, TIME = 10
  const [round, setRound] = useState(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const qs = useMemo(() => makeQuestions(words, Math.min(N, words.length), 4), [words, round])
  const [i, setI] = useState(0)
  const [left, setLeft] = useState(TIME)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const q = qs[i]

  useEffect(() => { if (q) speak(q.word.text) }, [q])
  useEffect(() => {
    if (!q || picked !== null) return
    if (left <= 0) { answer(-1); return }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, picked, q])

  const answer = (wordId: number) => {
    if (picked !== null) return
    const ok = wordId === q.word.id
    setPicked(wordId)
    if (ok) { setCorrect((c) => c + 1); setStreak((s) => s + 1); speak(streak >= 2 ? 'Tuyệt vời' : 'Đúng rồi') }
    else { setStreak(0); speak(`Đáp án là ${q.word.text}`) }
    setTimeout(() => { setPicked(null); setLeft(TIME); setI((x) => x + 1) }, 1400)
  }

  const reset = () => { setRound((r) => r + 1); setI(0); setCorrect(0); setStreak(0); setLeft(TIME) }
  if (!q) return <ResultCard score={Math.round((correct / qs.length) * 100)} onAgain={reset} extra={`đúng ${correct}/${qs.length} câu`} />

  return (
    <Card className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between font-bold text-ocean">
        <span>Câu {i + 1}/{qs.length}</span>
        {streak >= 2 && <span className="animate-pop text-coral">🔥 x{streak}</span>}
        <span>⏱️ {left}s</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-foam">
        <div className={`h-full rounded-full transition-all duration-1000 ease-linear ${left <= 3 ? 'bg-coral' : 'bg-lagoon'}`} style={{ width: `${(left / TIME) * 100}%` }} />
      </div>
      <div key={i} className="flex animate-pop items-center gap-3">
        <WordImage emoji={q.word.emoji} imageUrl={q.word.image_url} text={q.word.text} className="h-36 w-36 text-8xl" />
        <SpeakerButton text={q.word.text} />
      </div>
      <div className="grid w-full grid-cols-2 gap-3">
        {q.options.map((o) => {
          const state = picked === null ? '' : o.id === q.word.id ? 'bg-seaweed text-white' : o.id === picked ? 'animate-shake bg-coral text-white' : 'opacity-50'
          return (
            <button key={o.id} onClick={() => answer(o.id)}
              className={`min-h-[64px] rounded-2xl bg-star px-3 font-display text-2xl font-bold text-ocean-deep shadow-[0_5px_0_#d9a800] transition active:translate-y-1 sm:text-3xl ${state}`}>
              {o.text}
            </button>
          )
        })}
      </div>
    </Card>
  )
}

/* ---------------- Kéo co ---------------- */
const TEAMS = [
  { name: 'Đội Cá Heo', emoji: '🐬', color: 'bg-ocean', ring: 'ring-ocean' },
  { name: 'Đội Cá Mập', emoji: '🦈', color: 'bg-coral', ring: 'ring-coral' },
]
const WIN = 5

function TugOfWar({ words }: { words: Word[] }) {
  const [pos, setPos] = useState(0) // âm: đội trái thắng thế, dương: đội phải
  const [winner, setWinner] = useState<number | null>(null)
  const [qs, setQs] = useState(() => [makeQuestions(words, 1, 3)[0], makeQuestions(words, 1, 3)[0]])
  const [flash, setFlash] = useState<(string | null)[]>([null, null])
  const lock = useRef([false, false])

  const answer = (team: number, wordId: number) => {
    if (winner !== null || lock.current[team]) return
    lock.current[team] = true
    const ok = wordId === qs[team].word.id
    setFlash((f) => f.map((x, k) => (k === team ? (ok ? 'right' : 'wrong') : x)))
    if (ok) {
      const next = pos + (team === 0 ? -1 : 1)
      setPos(next)
      if (Math.abs(next) >= WIN) { setWinner(team); celebrate(); speak(`${TEAMS[team].name} thắng rồi`) }
    }
    setTimeout(() => {
      lock.current[team] = false
      setFlash((f) => f.map((x, k) => (k === team ? null : x)))
      setQs((q) => q.map((x, k) => (k === team ? makeQuestions(words, 1, 3)[0] : x)))
    }, ok ? 500 : 1100)
  }

  const reset = () => { setPos(0); setWinner(null); setQs([makeQuestions(words, 1, 3)[0], makeQuestions(words, 1, 3)[0]]) }

  return (
    <div className="flex flex-col gap-4">
      {/* dây kéo co */}
      <Card className="relative overflow-hidden !p-3">
        <div className="flex items-center justify-between font-display text-xl font-bold">
          <span className="text-ocean">{TEAMS[0].emoji} {TEAMS[0].name}</span>
          <span className="text-coral">{TEAMS[1].name} {TEAMS[1].emoji}</span>
        </div>
        <div className="relative mx-auto my-2 h-16 max-w-3xl">
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-ocean-deep/30" />
          <div className="absolute inset-y-0 left-[10%] w-1 bg-ocean/40" /><div className="absolute inset-y-0 right-[10%] w-1 bg-coral/40" />
          <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center transition-transform duration-500"
            style={{ transform: `translate(${(pos / WIN) * 40}%, -50%)` }}>
            <span className="text-5xl">{TEAMS[0].emoji}</span>
            <div className="h-3 flex-1 rounded-full bg-[repeating-linear-gradient(45deg,#c8a165_0_8px,#a77b3f_8px_16px)]" />
            <span className="-mx-2 text-4xl">🚩</span>
            <div className="h-3 flex-1 rounded-full bg-[repeating-linear-gradient(45deg,#c8a165_0_8px,#a77b3f_8px_16px)]" />
            <span className="-scale-x-100 text-5xl">{TEAMS[1].emoji}</span>
          </div>
        </div>
      </Card>

      {winner !== null ? (
        <Card className="mx-auto flex animate-pop flex-col items-center gap-3 text-center">
          <span className="text-8xl">{TEAMS[winner].emoji}🏆</span>
          <h2 className="font-display text-4xl font-extrabold">{TEAMS[winner].name} thắng!</h2>
          <Button onClick={reset}>Chơi ván mới 🔁</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {TEAMS.map((t, team) => {
            const q = qs[team]
            return (
              <Card key={team} className={`flex flex-col items-center gap-3 ring-4 ${t.ring} ${flash[team] === 'wrong' ? 'animate-shake' : ''}`}>
                <p className={`rounded-full px-4 py-1 font-display text-xl font-bold text-white ${t.color}`}>{t.emoji} {t.name}</p>
                <div className="flex items-center gap-2">
                  <WordImage emoji={q.word.emoji} imageUrl={q.word.image_url} text={q.word.text} className="h-28 w-28 text-7xl" />
                  <SpeakerButton text={q.word.text} size="sm" />
                </div>
                <div className="grid w-full grid-cols-3 gap-2">
                  {q.options.map((o) => (
                    <button key={o.id} onClick={() => answer(team, o.id)}
                      className={`min-h-[60px] rounded-2xl px-2 font-display text-xl font-bold shadow-[0_5px_0_#d9a800] active:translate-y-1 sm:text-2xl ${flash[team] === 'right' && o.id === q.word.id ? 'bg-seaweed text-white' : 'bg-star text-ocean-deep'}`}>
                      {o.text}
                    </button>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
