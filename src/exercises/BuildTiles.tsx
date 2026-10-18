import { useMemo, useState } from 'react'
import { speak } from '../lib/speech'
import { composeSyllable, isToneMark, TONE_DISPLAY } from '../lib/vietnamese'
import type { BuildConfig } from '../lib/types'
import { Button, Whale } from '../components/ui'
import { shuffle, type ExerciseProps } from './common'

const label = (p: string) => (isToneMark(p) ? TONE_DISPLAY[p] : p)

/** Ghép âm / vần / thanh: chạm thẻ để đặt vào ô, chạm ô để gỡ ra. */
export function BuildTiles({ config, onFinish }: ExerciseProps<BuildConfig>) {
  const tiles = useMemo(
    () => shuffle([...config.parts, ...(config.distractors ?? [])]).map((t, i) => ({ id: i, t })),
    [config],
  )
  const [slots, setSlots] = useState<(number | null)[]>(() => config.parts.map(() => null))
  const [tries, setTries] = useState(0)
  const [state, setState] = useState<'idle' | 'right' | 'wrong' | 'reveal'>('idle')

  const used = new Set(slots.filter((s): s is number => s !== null))
  const placed = slots.map((s) => (s === null ? null : tiles[s].t))
  const preview = composeSyllable(placed.filter((p): p is string => p !== null))
  const full = slots.every((s) => s !== null)

  const place = (id: number) => {
    if (state === 'right' || state === 'reveal') return
    const idx = slots.indexOf(null)
    if (idx < 0) return
    const next = [...slots]; next[idx] = id; setSlots(next); setState('idle')
    if (!isToneMark(tiles[id].t)) speak(tiles[id].t)
  }
  const remove = (idx: number) => {
    if (state === 'right' || state === 'reveal') return
    const next = [...slots]; next[idx] = null; setSlots(next); setState('idle')
  }

  const check = () => {
    const ok = preview.normalize('NFC') === config.answer.normalize('NFC')
    const t = tries + 1
    setTries(t)
    if (ok) {
      setState('right'); speak(config.answer)
      setTimeout(() => onFinish(t === 1 ? 100 : t === 2 ? 70 : 40), 1400)
    } else if (t >= 3) {
      setState('reveal'); speak(config.answer)
      setTimeout(() => onFinish(0), 2200)
    } else setState('wrong')
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-lg text-ocean">Chạm các thẻ để ghép thành <b>tiếng / vần</b> đúng nhé!</p>
      <div className={`flex gap-3 ${state === 'wrong' ? 'animate-shake' : ''}`}>
        {slots.map((s, i) => (
          <button key={i} onClick={() => remove(i)}
            className={`flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-dashed font-display text-5xl font-bold transition ${s === null ? 'border-aqua bg-white/60' : 'border-ocean bg-white text-ocean-deep'}`}>
            {s !== null && label(tiles[s].t)}
          </button>
        ))}
      </div>
      <div className="h-20 font-display text-6xl font-extrabold text-ocean-deep">
        {state === 'reveal' ? config.answer : full ? <>= {preview}</> : null}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {tiles.map(({ id, t }) => (
          <button key={id} disabled={used.has(id)} onClick={() => place(id)}
            className="h-20 min-w-20 rounded-2xl bg-star px-4 font-display text-4xl font-bold text-ocean-deep shadow-[0_5px_0_#d9a800] transition active:translate-y-1 disabled:opacity-20">
            {label(t)}
          </button>
        ))}
      </div>
      <Button onClick={check} disabled={!full || state === 'right' || state === 'reveal'}>Kiểm tra</Button>
      {state === 'right' && <p className="flex animate-pop items-center gap-2 font-display text-3xl text-seaweed"><Whale className="h-16 w-16" />Giỏi quá!</p>}
      {state === 'wrong' && <p className="font-display text-2xl text-coral">Chưa đúng, thử lại nhé! (lần {tries}/3)</p>}
      {state === 'reveal' && <p className="font-display text-2xl text-coral">Đáp án là “{config.answer}”</p>}
    </div>
  )
}
