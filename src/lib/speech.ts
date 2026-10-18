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

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window
export const hasVietnameseVoice = () => !!(viVoice ?? pickVoice())

export interface SpeakOptions {
  rate?: number
  onBoundary?: (charIndex: number) => void
  onEnd?: () => void
}

export function speak(text: string, opts: SpeakOptions = {}) {
  if (!speechSupported()) return
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'vi-VN'
  const v = viVoice ?? pickVoice()
  if (v) u.voice = v
  u.rate = opts.rate ?? 0.8
  if (opts.onBoundary) u.onboundary = (e) => opts.onBoundary!(e.charIndex)
  u.onend = () => opts.onEnd?.()
  u.onerror = () => opts.onEnd?.()
  synth.speak(u)
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel()
}
