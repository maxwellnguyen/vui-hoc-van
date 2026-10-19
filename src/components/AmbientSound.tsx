import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'

const KEY = 'ambient-sound'
// Nhạc nền: đặt file vào public/audio/nhac-nen.mp3 (thiếu file thì chỉ có tiếng bong bóng)
const MUSIC_SRC = '/audio/nhac-nen.mp3'

/** Một bong bóng: tần số vọt lên nhanh rồi tắt (giống bong bóng nước thật), lọc mềm, lệch trái/phải ngẫu nhiên. */
function bubble(ctx: AudioContext, out: AudioNode) {
  const t = ctx.currentTime
  const size = Math.random()                 // bong bóng to → trầm và dài hơn
  const f = 1100 - size * 700
  const dur = 0.04 + size * 0.06
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const pan = ctx.createStereoPanner()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(f, t)
  osc.frequency.exponentialRampToValueAtTime(f * 1.8, t + dur)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.09 + size * 0.06, t + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  pan.pan.value = Math.random() * 1.6 - 0.8
  osc.connect(gain).connect(pan).connect(out)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

/** Nền "ù ù" dưới nước: tiếng ồn nâu lọc thấp, rất nhỏ. */
function underwater(ctx: AudioContext, out: AudioNode) {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
  const d = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5 }
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 400
  const gain = ctx.createGain()
  gain.gain.value = 0.12
  src.connect(lp).connect(gain).connect(out)
  src.start()
}

/** Nhạc trò chơi: giai điệu ngũ cung vui tươi lặp lại, tiếng "xylophone" nhỏ. */
const TUNE = [0, 2, 4, 7, 9, 7, 4, 2, 4, 7, 9, 12, 9, 7, 4, -1]
/** Nhạc nền tạm (khi chưa có file mp3): giai điệu chậm, êm, trầm hơn. */
const CALM = [0, 4, 7, 4, 9, 7, 4, 2, -1, 2, 4, 7, 4, 2, 0, -1]
function tune(ctx: AudioContext, out: AudioNode, notes: number[], ms: number, base: number, type: OscillatorType, vol: number, len: number) {
  let i = 0
  const id = window.setInterval(() => {
    const n = notes[i++ % notes.length]
    if (n < 0) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = base * 2 ** (n / 12)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + len)
    osc.connect(gain).connect(out)
    osc.start(t)
    osc.stop(t + len + 0.02)
  }, ms)
  return () => clearInterval(id)
}

/** Nhạc nền + tiếng bong bóng lách tách sau khi đăng nhập, có nút bật/tắt (nhớ lựa chọn). */
export function AmbientSound() {
  const [on, setOn] = useState(() => {
    try { return localStorage.getItem(KEY) !== 'off' } catch { return true }
  })
  const [blocked, setBlocked] = useState(false)
  const game = useLocation().pathname.startsWith('/tro-choi/')

  useEffect(() => {
    try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* bỏ qua */ }
    if (!on) return
    const music = new Audio(MUSIC_SRC)
    music.loop = true
    music.volume = 0.1
    const ctx = new AudioContext()
    const out = ctx.createGain()
    out.gain.value = 0.7
    out.connect(ctx.destination)
    underwater(ctx, out)
    const stopTune = game ? tune(ctx, out, TUNE, 220, 523.25, 'triangle', 0.03, 0.3) : () => {}
    let stopCalm = () => {}
    // chưa có file mp3 → phát nhạc nền tạm tổng hợp
    music.addEventListener('error', () => { if (!game) stopCalm = tune(ctx, out, CALM, 600, 392, 'triangle', 0.09, 1.2) })
    if (game) music.volume = 0.04
    let timer = 0
    const loop = () => {
      // thỉnh thoảng một chùm 2–3 bong bóng liên tiếp
      const n = Math.random() < 0.35 ? 2 + Math.floor(Math.random() * 3) : 1
      for (let i = 0; i < n; i++) setTimeout(() => bubble(ctx, out), i * (60 + Math.random() * 120))
      timer = window.setTimeout(loop, 2500 + Math.random() * 4000)
    }
    // trình duyệt chặn tự phát khi chưa chạm: thử ngay, nếu bị chặn thì phát ở lần chạm đầu tiên
    const start = () => {
      music.play().catch(() => {})
      ctx.resume().then(() => setBlocked(false))
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
    music.play().catch(() => {})
    ctx.resume()
    // chờ một nhịp: nếu trình duyệt vẫn chặn thì báo cho bé chạm vào màn hình
    const check = window.setTimeout(() => setBlocked(ctx.state !== 'running'), 300)
    window.addEventListener('pointerdown', start)
    window.addEventListener('keydown', start)
    loop()
    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
      clearTimeout(check)
      setBlocked(false)
      clearTimeout(timer)
      stopTune()
      stopCalm()
      music.pause()
      ctx.close()
    }
  }, [on, game])

  return (
    <>
    {/* Trình duyệt chặn âm thanh khi chưa chạm → màn chào: bấm một lần là có nhạc (pointerdown ở window sẽ bật) */}
    {blocked && createPortal(
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-ocean-deep/70 p-4 backdrop-blur-sm">
        <button autoFocus onClick={() => setBlocked(false)}
          className="flex min-h-11 flex-col items-center gap-2 rounded-[2rem] bg-white px-10 py-8 font-display text-3xl font-extrabold text-ocean-deep shadow-[0_8px_0_#7FD6E0] transition active:translate-y-1 sm:text-4xl">
          <span className="animate-bob text-7xl">🐳</span>
          Bấm để bắt đầu
        </button>
        <button onClick={() => setOn(false)} className="min-h-11 px-4 font-bold text-white underline">
          Học không có nhạc
        </button>
      </div>,
      document.body,
    )}
    <button onClick={() => setOn((v) => !v)} aria-label={on ? 'Tắt nhạc nền' : 'Bật nhạc nền'} aria-pressed={on}
      title={blocked ? 'Chạm vào màn hình để nghe nhạc' : undefined}
      className={`min-h-11 min-w-11 rounded-xl px-2 text-xl hover:bg-white/10 ${blocked ? 'animate-pulse bg-white/20' : ''}`}>
      {on ? '🔊' : '🔇'}
    </button>
    </>
  )
}
