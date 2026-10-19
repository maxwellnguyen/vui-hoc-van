/**
 * Đọc tiếng Việt:
 *  1. Có mạng → giọng online qua /api/tts (mp3), mọi máy đều nghe được, không cần cài gì.
 *  2. Mất mạng / API lỗi → giọng vi-VN cài sẵn trên máy (Web Speech API).
 */
import { applyTone } from './vietnamese'

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
  // vần đứng riêng tận cùng c/t/p/ch (ăc, ôt…) không thanh thì máy đọc sai → đọc kèm thanh sắc
  if (/^[^\s\u0300\u0301\u0303\u0309\u0323]+(c|t|p|ch)$/i.test(text.normalize('NFD'))) text = applyTone(text, '´')
  // giọng online (Google) đọc rõ thanh hỏi/ngã hơn giọng cài sẵn của Windows → ưu tiên khi có mạng
  if (!navigator.onLine && hasVietnameseVoice()) speakNative(text, opts, id)
  else speakOnline(text, opts, id)
}

export function stopSpeaking() {
  session++
  if (audio) { audio.pause(); audio = null }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel()
}

// Đọc từng khúc ngắn: Chrome tự ngắt utterance dài ~15s; bỏ qua callback của lượt đọc đã bị dừng
function speakNative(text: string, opts: SpeakOptions, id: number) {
  if (!('speechSynthesis' in window)) { opts.onEnd?.(); return }
  const chunks = chunkText(text)
  const v = viVoice ?? pickVoice()
  const playAt = (k: number) => {
    if (id !== session) return
    if (k >= chunks.length) { opts.onEnd?.(); return }
    const c = chunks[k]
    const u = new SpeechSynthesisUtterance(c.text)
    u.lang = 'vi-VN'
    if (v) u.voice = v
    u.rate = opts.rate ?? 0.8
    if (opts.onBoundary) u.onboundary = (e) => id === session && opts.onBoundary!(c.start + e.charIndex)
    u.onend = () => playAt(k + 1)
    u.onerror = () => playAt(chunks.length)
    window.speechSynthesis.speak(u)
  }
  // Chrome bỏ mất câu nếu speak() ngay sau cancel() cùng nhịp
  setTimeout(() => playAt(0), 0)
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
      speakNative(chunks.slice(k).map((x) => x.text).join(' '), { ...opts, onBoundary: undefined }, id)
    }
    a.play().catch(() => a.onerror?.(new Event('error')))
  }
  playAt(0)
}
