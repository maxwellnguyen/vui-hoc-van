import { useMemo, useState } from 'react'
import { speak } from '../lib/speech'
import { percent } from '../lib/scoring'
import type { RhymeGridConfig } from '../lib/types'
import { Button } from '../components/ui'
import { shuffle, type ExerciseProps } from './common'

const key = (r: string, c: string) => `${r}|${c}`

/** Bảng ghép vần kiểu SGK (config: rows = âm chính, cols = âm cuối; hiển thị xoay ngang). Chạm ô trống → chọn vần đúng. */
export function RhymeGrid({ config, onFinish }: ExerciseProps<RhymeGridConfig>) {
  const { rows, cols } = config
  const given = useMemo(() => new Set((config.given ?? []).map(([r, c]) => key(r, c))), [config])
  const blocked = useMemo(() => new Set((config.blocked ?? []).map(([r, c]) => key(r, c))), [config])
  const todo = rows.flatMap((r) => cols.map((c) => key(r, c))).filter((k) => !given.has(k) && !blocked.has(k))

  const [filled, setFilled] = useState<Map<string, boolean>>(new Map()) // true = đúng ngay lần đầu
  const [open, setOpen] = useState<{ r: string; c: string } | null>(null)
  const [wrongPick, setWrongPick] = useState<string | null>(null)

  const options = useMemo(() => {
    if (!open) return []
    const answer = open.r + open.c
    const others = shuffle(rows.filter((r) => r !== open.r)).slice(0, 2).map((r) => r + open.c)
    return shuffle([answer, ...others])
  }, [open, rows])

  const pick = (o: string) => {
    if (!open) return
    const k = key(open.r, open.c)
    if (o === open.r + open.c) {
      speak(o)
      const next = new Map(filled)
      next.set(k, !next.has(k) && wrongPick === null)
      setFilled(next); setOpen(null); setWrongPick(null)
    } else {
      setWrongPick(o)
      speak('Chưa đúng')
    }
  }

  const done = todo.every((k) => filled.has(k))
  const firstTry = todo.filter((k) => filled.get(k)).length

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg text-ocean">Chạm vào ô trống để ghép vần. Chạm ô đã có để nghe đọc.</p>
      {/* Bảng nằm ngang: cột = âm chính, hàng = âm cuối → gọn trong một màn hình, không phải cuộn */}
      <div className="max-w-full overflow-x-auto pb-1">
        <table className="border-separate border-spacing-1 font-display text-2xl font-bold sm:text-3xl">
          <thead>
            <tr>
              <th />
              {rows.map((r) => <th key={r} className="h-12 w-14 rounded-xl bg-star text-ocean-deep sm:h-14 sm:w-20">{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {cols.map((c) => (
              <tr key={c}>
                <th className="h-12 w-12 rounded-xl bg-star text-ocean-deep sm:h-14 sm:w-16">{c}</th>
                {rows.map((r) => {
                  const k = key(r, c)
                  if (blocked.has(k)) return (
                    <td key={r} className="relative rounded-xl bg-sand/70">
                      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 10 10"><path d="M0 0L10 10M10 0L0 10" stroke="#d9a800" strokeWidth=".4" /></svg>
                    </td>
                  )
                  const shown = given.has(k) || filled.has(k)
                  const isOpen = open?.r === r && open?.c === c
                  return (
                    <td key={r} className="p-0">
                      <button
                        onClick={() => (shown ? speak(r + c) : (setOpen({ r, c }), setWrongPick(null)))}
                        className={`h-12 w-14 rounded-xl text-ocean-deep transition active:scale-95 sm:h-14 sm:w-20 ${shown ? (given.has(k) ? 'bg-sand' : 'animate-pop bg-seaweed/30') : isOpen ? 'bg-aqua ring-4 ring-ocean' : 'bg-sand/60 hover:bg-aqua/60'}`}>
                        {shown ? r + c : isOpen ? '?' : ''}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="flex animate-pop flex-col items-center gap-2 rounded-3xl bg-white p-4 shadow-lg">
          <p className="text-lg">
            <b className="text-ocean">{open.r}</b> + <b className="text-ocean">{open.c}</b> = ?
          </p>
          <div className="flex gap-3">
            {options.map((o) => (
              <button key={o} onClick={() => pick(o)}
                className={`h-16 w-24 rounded-2xl bg-star font-display text-3xl font-bold shadow-[0_5px_0_#d9a800] active:translate-y-1 ${wrongPick === o ? 'animate-shake bg-coral text-white' : ''}`}>{o}</button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <p className="text-ocean">Đã ghép {todo.filter((k) => filled.has(k)).length} / {todo.length} ô</p>
        <Button variant="success" disabled={!done} onClick={() => onFinish(percent(firstTry, todo.length))}>Hoàn thành ✔</Button>
      </div>
    </div>
  )
}
