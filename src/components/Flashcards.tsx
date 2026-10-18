import { useCallback, useEffect, useRef, useState } from 'react'
import { speak, stopSpeaking } from '../lib/speech'
import type { Word } from '../lib/types'
import { WordImage } from './ui'

/** Trình chiếu thẻ từ toàn màn hình: hình to + chữ to + tự đọc. Phím ← → để chuyển, Space để tự chạy. */
export function Flashcards({ title, words, onClose }: { title: string; words: Word[]; onClose: () => void }) {
  const [i, setI] = useState(0)
  const [auto, setAuto] = useState(false)
  const [showText, setShowText] = useState(true)
  const box = useRef<HTMLDivElement>(null)
  const w = words[i]

  const go = useCallback((d: number) => setI((x) => (x + d + words.length) % words.length), [words.length])

  useEffect(() => { box.current?.requestFullscreen?.().catch(() => {}) ; return () => { stopSpeaking(); if (document.fullscreenElement) document.exitFullscreen().catch(() => {}) } }, [])
  useEffect(() => { if (w) speak(w.text) }, [w])
  useEffect(() => {
    if (!auto) return
    const t = setTimeout(() => go(1), 3500)
    return () => clearTimeout(t)
  }, [auto, i, go])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === ' ') { e.preventDefault(); setAuto((a) => !a) }
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  if (!w) return null
  return (
    <div ref={box} className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-foam via-aqua to-lagoon p-4">
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl font-extrabold text-ocean-deep">{title}</h2>
        <span className="text-ocean">{i + 1} / {words.length}</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setShowText((s) => !s)} className="rounded-xl bg-white/80 px-3 py-2 font-bold">{showText ? '🙈 Ẩn chữ' : '👀 Hiện chữ'}</button>
          <button onClick={() => setAuto((a) => !a)} className="rounded-xl bg-white/80 px-3 py-2 font-bold">{auto ? '⏸ Dừng' : '▶ Tự chạy'}</button>
          <button onClick={onClose} className="rounded-xl bg-coral px-4 py-2 font-bold text-white">✕ Đóng</button>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center gap-4">
        <button onClick={() => go(-1)} aria-label="Thẻ trước" className="h-20 w-20 shrink-0 rounded-full bg-white/80 text-4xl shadow-lg">◀</button>
        <button key={i} onClick={() => speak(w.text)}
          className="flex h-full max-h-[75vh] w-full max-w-3xl animate-pop flex-col items-center justify-center gap-4 rounded-[3rem] bg-white shadow-2xl">
          <WordImage emoji={w.emoji} imageUrl={w.image_url} text={w.text} className="h-[40vh] w-[40vh] text-[28vh]" />
          <span className={`font-display text-[12vh] font-extrabold leading-none text-ocean-deep ${showText ? '' : 'invisible'}`}>{w.text}</span>
        </button>
        <button onClick={() => go(1)} aria-label="Thẻ sau" className="h-20 w-20 shrink-0 rounded-full bg-white/80 text-4xl shadow-lg">▶</button>
      </div>
    </div>
  )
}
