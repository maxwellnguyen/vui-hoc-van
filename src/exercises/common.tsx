import { findRhyme } from '../lib/vietnamese'
import type { Unit, Word } from '../lib/types'

export interface ExerciseProps<C> {
  config: C
  unit?: Unit | null
  unitWords: Word[]
  allWords: Word[]
  onFinish: (score: number) => void
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const findWord = (all: Word[], text: string) =>
  all.find((w) => w.text.normalize('NFC') === text.normalize('NFC'))

/** Hiển thị một cụm từ, tô màu phần vần cần ôn trong từng tiếng */
export function HighlightedText({ text, rhymes = [], className = '', activeIndex }:
  { text: string; rhymes?: string[]; className?: string; activeIndex?: number }) {
  const tokens = text.normalize('NFC').split(/(\s+)/)
  let offset = 0
  return (
    <span className={className}>
      {tokens.map((tok, i) => {
        const start = offset
        offset += tok.length
        if (/^\s+$/.test(tok)) return tok
        const m = tok.match(/^([^\p{L}]*)([\p{L}]+)([^\p{L}]*)$/u)
        const active = activeIndex !== undefined && activeIndex >= start && activeIndex < offset
        const wrap = (c: React.ReactNode) =>
          <span key={i} className={active ? 'rounded bg-star/70' : ''}>{c}</span>
        if (!m || rhymes.length === 0) return wrap(tok)
        const [, pre, word, post] = m
        const r = findRhyme(word, rhymes)
        if (!r) return wrap(tok)
        return wrap(<>{pre}{word.slice(0, r[0])}<span className="font-extrabold text-coral">{word.slice(r[0], r[1])}</span>{word.slice(r[1])}{post}</>)
      })}
    </span>
  )
}
