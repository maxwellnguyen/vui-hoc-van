/** Ký hiệu dấu thanh dùng trong bài ghép → dấu kết hợp Unicode */
export const TONE_MARKS: Record<string, string> = {
  '´': '́', // sắc
  '`': '̀', // huyền
  '?': '̉', // hỏi
  '~': '̃', // ngã
  '.': '̣', // nặng
}
export const isToneMark = (s: string) => s in TONE_MARKS

/** Hiển thị dấu thanh trên thẻ ghép cho dễ nhìn */
export const TONE_DISPLAY: Record<string, string> = { '´': '◌́', '`': '◌̀', '?': '◌̉', '~': '◌̃', '.': '◌̣' }

const VOWELS = 'aăâeêioôơuưy'
const MARKED = 'ăâêôơư'

/** Đặt dấu thanh lên đúng nguyên âm của một tiếng (kiểu mới: hoà, quả, thuỷ). */
export function applyTone(syllable: string, mark: string): string {
  const combining = TONE_MARKS[mark]
  const base = syllable.normalize('NFC')
  if (!combining) return base
  const lower = base.toLowerCase()

  // bỏ qua phụ âm đầu; "qu" và "gi" (khi theo sau là nguyên âm) tính là phụ âm
  let start = 0
  while (start < lower.length && !VOWELS.includes(lower[start])) start++
  if ((lower.startsWith('qu') || lower.startsWith('gi')) && start === 1 && VOWELS.includes(lower[2] ?? '')) start = 2
  let end = start
  while (end < lower.length && VOWELS.includes(lower[end])) end++
  if (start >= end) return base

  const cluster = lower.slice(start, end)
  const hasFinal = end < lower.length
  let idx: number
  if (cluster.includes('ươ')) idx = cluster.indexOf('ơ')
  else if ([...cluster].some((c) => MARKED.includes(c))) idx = [...cluster].findIndex((c) => MARKED.includes(c))
  else if (cluster.length === 1) idx = 0
  else if (hasFinal) idx = cluster.length - 1
  else if (['oa', 'oe', 'uy'].includes(cluster)) idx = 1
  else if (cluster.length === 3) idx = 1
  else idx = 0

  const pos = start + idx
  return (base.slice(0, pos + 1) + combining + base.slice(pos + 1)).normalize('NFC')
}

/** Ghép các mảnh (âm, vần, dấu thanh) thành tiếng. */
export function composeSyllable(parts: string[]): string {
  const mark = parts.find(isToneMark)
  const text = parts.filter((p) => !isToneMark(p)).join('')
  return mark ? applyTone(text, mark) : text.normalize('NFC')
}

/** Bỏ dấu thanh (giữ dấu phụ ă â ê ô ơ ư) để so vần. */
export function stripTone(s: string): string {
  return s.normalize('NFD').replace(/[̣̀́̃̉]/g, '').normalize('NFC')
}

/** Vị trí [start,end) của vần cần tô trong một tiếng (tính trên chuỗi NFC). */
export function findRhyme(syllable: string, rhymes: string[]): [number, number] | null {
  const plain = stripTone(syllable.normalize('NFC')).toLowerCase()
  const sorted = [...rhymes].sort((a, b) => b.length - a.length)
  for (const r of sorted) {
    if (!r || !plain.endsWith(r)) continue
    const before = plain.slice(0, plain.length - r.length)
    const prev = before[before.length - 1]
    // không cắt giữa cụm nguyên âm (vd "oc" trong "uoc"), trừ khi trước đó là qu/gi
    if (prev && VOWELS.includes(prev) && !/^(qu|gi)$/.test(before)) continue
    return [before.length, plain.length]
  }
  return null
}
