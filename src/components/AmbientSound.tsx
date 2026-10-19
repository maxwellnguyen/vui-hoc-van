import { useEffect, useState } from 'react'

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
  gain.gain.linearRampToValueAtTime(0.05 + size * 0.04, t + 0.005)
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

/** Nhạc nền + tiếng bong bóng lách tách sau khi đăng nhập, có nút bật/tắt (nhớ lựa chọn). */
export function AmbientSound() {
  const [on, setOn] = useState(() => {
    try { return localStorage.getItem(KEY) !== 'off' } catch { return true }
  })

  useEffect(() => {
    try { localStorage.setItem(KEY, on ? 'on' : 'off') } catch { /* bỏ qua */ }
    if (!on) return
    const music = new Audio(MUSIC_SRC)
    music.loop = true
    music.volume = 0.2
    const ctx = new AudioContext()
    const out = ctx.createGain()
    out.gain.value = 0.7
    out.connect(ctx.destination)
    underwater(ctx, out)
    let timer = 0
    const loop = () => {
      // thỉnh thoảng một chùm 2–3 bong bóng liên tiếp
      const n = Math.random() < 0.35 ? 2 + Math.floor(Math.random() * 3) : 1
      for (let i = 0; i < n; i++) setTimeout(() => bubble(ctx, out), i * (60 + Math.random() * 120))
      timer = window.setTimeout(loop, 2500 + Math.random() * 4000)
    }
    // trình duyệt chặn tự phát khi chưa chạm: thử ngay, nếu bị chặn thì phát ở lần chạm đầu tiên
    const start = () => { music.play().catch(() => {}); ctx.resume() }
    start()
    window.addEventListener('pointerdown', start, { once: true })
    loop()
    return () => {
      window.removeEventListener('pointerdown', start)
      clearTimeout(timer)
      music.pause()
      ctx.close()
    }
  }, [on])

  return (
    <button onClick={() => setOn((v) => !v)} aria-label={on ? 'Tắt nhạc nền' : 'Bật nhạc nền'} aria-pressed={on}
      className="min-h-11 min-w-11 rounded-xl px-2 text-xl hover:bg-white/10">
      {on ? '🔊' : '🔇'}
    </button>
  )
}
