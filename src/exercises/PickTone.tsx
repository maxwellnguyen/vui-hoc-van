import { useEffect, useMemo, useState } from 'react'
import { speak } from '../lib/speech'
import { percent } from '../lib/scoring'
import type { PickToneConfig } from '../lib/types'
import { Whale } from '../components/ui'
import { shuffle, type ExerciseProps } from './common'

/** Nghe tiếng → chọn tiếng có dấu thanh đúng */
export function PickTone({ config, onFinish }: ExerciseProps<PickToneConfig>) {
  const items = config.items ?? []
  const [i, setI] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const item = items[i]
  const options = useMemo(() => (item ? shuffle(item.options) : []), [item])

  useEffect(() => { if (item) setTimeout(() => speak(item.answer), 400) }, [item])
  if (!item) return <p>Bài chưa có câu hỏi.</p>

  const pick = (o: string) => {
    if (picked) return
    setPicked(o)
    const ok = o === item.answer
    const c = correct + (ok ? 1 : 0)
    setCorrect(c)
    setTimeout(() => {
      setPicked(null)
      if (i + 1 >= items.length) onFinish(percent(c, items.length))
      else setI(i + 1)
    }, 1400)
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-ocean">Câu {i + 1} / {items.length} – Nghe và chọn tiếng đúng</p>
      <button onClick={() => speak(item.answer)}
        className="flex h-32 w-32 animate-bob items-center justify-center rounded-full bg-star text-6xl shadow-[0_6px_0_#d9a800]" aria-label="Nghe lại">🔊</button>
      <div className="grid grid-cols-3 gap-4">
        {options.map((o) => {
          const state = picked === null ? '' : o === item.answer ? 'bg-seaweed text-white' : o === picked ? 'bg-coral text-white animate-shake' : 'opacity-40'
          return (
            <button key={o} onClick={() => pick(o)}
              className={`h-24 w-28 rounded-2xl bg-white font-display text-5xl font-bold text-ocean-deep shadow-[0_5px_0_#7FD6E0] transition active:translate-y-1 ${state}`}>{o}</button>
          )
        })}
      </div>
      <div className="h-20">
        {picked && (picked === item.answer
          ? <p className="flex animate-pop items-center gap-2 font-display text-3xl text-seaweed"><Whale className="h-16 w-16" />Đúng rồi!</p>
          : <p className="flex items-center gap-2 font-display text-3xl text-coral"><Whale mood="sad" className="h-16 w-16" />Tiếng đúng là “{item.answer}”</p>)}
      </div>
    </div>
  )
}
