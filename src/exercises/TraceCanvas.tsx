import { useEffect, useRef, useState } from 'react'
import { speak } from '../lib/speech'
import { traceScore } from '../lib/scoring'
import type { TraceConfig } from '../lib/types'
import { Button } from '../components/ui'
import type { ExerciseProps } from './common'

const SIZE = 360
const BRUSH = 26
const COLORS = ['#1572A1', '#FF7F6B', '#3BB273', '#9B5DE5']

/**
 * mode 'do': đồ theo chữ nét chấm.  mode 'to': chữ rỗng có viền chạy (animation) – bé tô kín bên trong.
 * Chấm điểm: % điểm mẫu của chữ được phủ mực, trừ điểm nếu tô lem ra ngoài quá nhiều.
 */
export function TraceCanvas({ config, onFinish }: ExerciseProps<TraceConfig>) {
  const glyph = config.glyph
  const fontSize = Math.min(260, Math.floor(620 / Math.max(1, [...glyph].length)))
  const font = `800 ${fontSize}px Nunito, sans-serif`
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const [color, setColor] = useState(COLORS[0])
  const [hasInk, setHasInk] = useState(false)
  const [result, setResult] = useState<number | null>(null)

  useEffect(() => { speak(glyph) }, [glyph])

  const pos = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    return { x: ((e.clientX - r.left) / r.width) * SIZE, y: ((e.clientY - r.top) / r.height) * SIZE }
  }
  const stroke = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = ref.current!.getContext('2d')!
    ctx.strokeStyle = color; ctx.lineWidth = BRUSH; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke()
  }
  const down = (e: React.PointerEvent) => {
    if (result !== null) return
    ref.current!.setPointerCapture(e.pointerId)
    drawing.current = true
    last.current = pos(e)
    stroke(last.current, last.current)
    setHasInk(true)
  }
  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return
    const p = pos(e); stroke(last.current, p); last.current = p
  }
  const up = () => { drawing.current = false; last.current = null }

  const clear = () => {
    ref.current!.getContext('2d')!.clearRect(0, 0, SIZE, SIZE)
    setHasInk(false); setResult(null)
  }

  const check = () => {
    // mặt nạ chữ (đặc) và mặt nạ chữ nới rộng (để tính lem ra ngoài)
    const mk = (dilate: number) => {
      const c = document.createElement('canvas'); c.width = SIZE; c.height = SIZE
      const ctx = c.getContext('2d')!
      ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#000'
      ctx.fillText(glyph, SIZE / 2, SIZE / 2 + 10)
      if (dilate) { ctx.lineWidth = dilate; ctx.lineJoin = 'round'; ctx.strokeText(glyph, SIZE / 2, SIZE / 2 + 10) }
      return ctx.getImageData(0, 0, SIZE, SIZE).data
    }
    const glyphMask = mk(0)
    const wideMask = mk(BRUSH * 1.4)
    const ink = ref.current!.getContext('2d')!.getImageData(0, 0, SIZE, SIZE).data
    const alpha = (d: Uint8ClampedArray, x: number, y: number) => d[(Math.round(y) * SIZE + Math.round(x)) * 4 + 3]

    const target: { x: number; y: number }[] = []
    for (let y = 0; y < SIZE; y += 6) for (let x = 0; x < SIZE; x += 6) if (alpha(glyphMask, x, y) > 128) target.push({ x, y })
    let inkTotal = 0, inkOut = 0
    for (let y = 0; y < SIZE; y += 4) for (let x = 0; x < SIZE; x += 4) {
      if (alpha(ink, x, y) > 0) { inkTotal++; if (alpha(wideMask, x, y) === 0) inkOut++ }
    }
    const score = traceScore(target, (x, y) => alpha(ink, x, y) > 0, inkTotal ? inkOut / inkTotal : 0)
    setResult(score)
    speak(score >= 70 ? 'Giỏi quá' : 'Cố lên nhé')
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg text-ocean">
        {config.mode === 'do' ? 'Đồ theo nét chấm nhé!' : 'Tô kín chữ theo đường viền nhé!'}
      </p>
      <div className="relative w-full max-w-[360px] touch-none select-none overflow-hidden rounded-3xl border-4 border-aqua bg-white shadow-inner" style={{ aspectRatio: '1' }}>
        {/* dòng kẻ ô li */}
        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
          {[90, 180, 270].map((y) => <line key={y} x1="0" x2={SIZE} y1={y} y2={y} stroke="#7FD6E0" strokeDasharray="4 6" />)}
          <text x={SIZE / 2} y={SIZE / 2 + 10} textAnchor="middle" dominantBaseline="middle"
            style={{ font }}
            fill={config.mode === 'do' ? 'none' : '#E8F7FA'}
            stroke={config.mode === 'do' ? '#9aa9b5' : '#20A4B8'}
            strokeWidth={config.mode === 'do' ? 3 : 4}
            strokeDasharray={config.mode === 'do' ? '2 9' : '2000'}
            strokeDashoffset={config.mode === 'do' ? 0 : 2000}
            strokeLinecap="round"
            className={config.mode === 'to' ? '[animation:draw_4s_ease-in-out_forwards]' : ''}>
            {glyph}
          </text>
        </svg>
        <canvas ref={ref} width={SIZE} height={SIZE} className="absolute inset-0 h-full w-full opacity-80"
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />
      </div>
      <div className="flex gap-3">
        {COLORS.map((c) => (
          <button key={c} aria-label="Chọn màu" onClick={() => setColor(c)}
            className={`h-11 w-11 rounded-full border-4 ${color === c ? 'border-ocean-deep scale-110' : 'border-white'}`} style={{ background: c }} />
        ))}
      </div>
      {result === null ? (
        <div className="flex gap-3">
          <Button variant="secondary" onClick={clear}>Xoá</Button>
          <Button onClick={check} disabled={!hasInk}>Xong rồi!</Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <p className={`font-display text-3xl font-bold ${result >= 70 ? 'text-seaweed' : 'text-coral'}`}>
            {result >= 70 ? `Đẹp lắm! (${result} điểm)` : `Được ${result} điểm – tô kín hơn nhé!`}
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={clear}>Tô lại</Button>
            <Button variant="success" onClick={() => onFinish(result)}>Tiếp tục</Button>
          </div>
        </div>
      )}
    </div>
  )
}
