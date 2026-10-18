import { useEffect, useState } from 'react'
import { speak, stopSpeaking } from '../lib/speech'
import type { PassageConfig } from '../lib/types'
import { Button } from '../components/ui'
import { HighlightedText, type ExerciseProps } from './common'

/** Đọc đoạn văn: máy đọc mẫu (sáng từng từ), các vần cần ôn được tô màu. */
export function Passage({ config, onFinish }: ExerciseProps<PassageConfig>) {
  const text = config.text.normalize('NFC')
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text]
  const [active, setActive] = useState<number | undefined>(undefined)
  const [playing, setPlaying] = useState(false)
  const [listened, setListened] = useState(false)

  useEffect(() => stopSpeaking, [])

  const playAll = () => {
    setPlaying(true)
    speak(text, {
      onBoundary: (ci) => setActive(ci),
      onEnd: () => { setPlaying(false); setActive(undefined); setListened(true) },
    })
  }

  let offset = 0
  return (
    <div className="flex flex-col items-center gap-5">
      <div className="w-full rounded-3xl border-4 border-aqua bg-white p-6 text-3xl leading-relaxed shadow">
        {sentences.map((s, i) => {
          const start = offset
          offset += s.length
          return (
            <span key={i} role="button" tabIndex={0} title="Chạm để nghe câu này"
              onClick={() => speak(s)} onKeyDown={(e) => e.key === 'Enter' && speak(s)}
              className="cursor-pointer rounded-lg hover:bg-foam">
              <HighlightedText text={s} rhymes={config.highlight}
                activeIndex={active !== undefined ? active - start : undefined} />
            </span>
          )
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {playing
          ? <Button variant="secondary" onClick={() => { stopSpeaking(); setPlaying(false); setActive(undefined) }}>⏹ Dừng</Button>
          : <Button onClick={playAll}>🔊 Nghe đọc mẫu</Button>}
        <Button variant="success" disabled={!listened} onClick={() => onFinish(100)}>Con đã đọc theo ✔</Button>
      </div>
      <p className="text-ocean">Chạm vào một câu để nghe riêng câu đó. Các vần được tô <b className="text-coral">màu cam</b>.</p>
    </div>
  )
}
