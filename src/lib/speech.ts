/**
 * Đọc tiếng Việt:
 *  1. Máy có sẵn giọng vi-VN (Edge, Windows/macOS/Android đã cài) → Web Speech API.
 *  2. Không có → tự dùng giọng online qua /api/tts (mp3), mọi máy đều nghe được, không cần cài gì.
 */
let viVoice: SpeechSynthesisVoice | null = null

function pickVoice() {
  if (!('speechSynthesis' in window)) return null
  const voices = window.speechSynthesis.getVoices()
  viVoice = voices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith('vi')) ?? null
  return viVoice
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice()
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice)
}

export const speechSupported = () => typeof window !== 'undefined' && ('speechSynthesis' in window || 'Audio' in window)
export const hasVietnameseVoice = () => 'speechSynthesis' in window && !!(viVoice ?? pickVoice())

export interface SpeakOptions {
  rate?: number
  onBoundary?: (charIndex: number) => void
  onEnd?: () => void
}

let session = 0
let audio: HTMLAudioElement | null = null

export function speak(text: string, opts: SpeakOptions = {}) {
  stopSpeaking()
  const id = ++session
  if (hasVietnameseVoice()) speakNative(text, opts)
  else speakOnline(text, opts, id)
}

export function stopSpeaking() {
  session++
  if (audio) { audio.pause(); audio = null }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}

function speakNative(text: string, opts: SpeakOptions) {
  if (!('speechSynthesis' in window)) { opts.onEnd?.(); return }
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'vi-VN'
  const v = viVoice ?? pickVoice()
  if (v) u.voice = v
  u.rate = opts.rate ?? 0.8
  if (opts.onBoundary) u.onboundary = (e) => opts.onBoundary!(e.charIndex)
  u.onend = () => opts.onEnd?.()
  u.onerror = () => opts.onEnd?.()
  window.speechSynthesis.speak(u)
}

export const ttsUrl = (text: string) => `/api/tts?q=${encodeURIComponent(text)}`

/** Cắt đoạn dài thành các khúc ≤ max ký tự (ưu tiên cắt ở dấu câu, rồi khoảng trắng) */
export function chunkText(text: string, max = 180): { text: string; start: number }[] {
  const out: { text: string; start: number }[] = []
  let i = 0
  while (i < text.length) {
    while (i < text.length && /\s/.test(text[i])) i++
    if (i >= text.length) break
    let end = Math.min(text.length, i + max)
    if (end < text.length) {
      const slice = text.slice(i, end)
      const punct = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '), slice.lastIndexOf(', '))
      const space = slice.lastIndexOf(' ')
      if (punct > max / 3) end = i + punct + 1
      else if (space > 0) end = i + space
    }
    out.push({ text: text.slice(i, end).trim(), start: i })
    i = end
  }
  return out
}

function speakOnline(text: string, opts: SpeakOptions, id: number) {
  const chunks = chunkText(text)
  const rate = Math.min(1, Math.max(0.6, (opts.rate ?? 0.8) + 0.15))
  const playAt = (k: number) => {
    if (id !== session) return
    if (k >= chunks.length) { audio = null; opts.onEnd?.(); return }
    const c = chunks[k]
    const a = new Audio(ttsUrl(c.text))
    audio = a
    a.playbackRate = rate
    // ước lượng từ đang đọc theo tiến độ phát để tô sáng
    if (opts.onBoundary) {
      const words = [...c.text.matchAll(/\S+/g)].map((m) => c.start + (m.index ?? 0))
      a.ontimeupdate = () => {
        if (id !== session || !a.duration) return
        const w = words[Math.min(words.length - 1, Math.floor((a.currentTime / a.duration) * words.length))]
        if (w !== undefined) opts.onBoundary!(w)
      }
    }
    a.onended = () => playAt(k + 1)
    a.onerror = () => {
      // mất mạng / API lỗi → thử giọng mặc định của máy
      if (id !== session) return
      audio = null
      speakNative(chunks.slice(k).map((x) => x.text).join(' '), { ...opts, onBoundary: undefined })
    }
    a.play().catch(() => a.onerror?.(new Event('error')))
  }
  playAt(0)
}
