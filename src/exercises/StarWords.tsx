import { useState } from 'react'
import { speak } from '../lib/speech'
import type { StarWordsConfig } from '../lib/types'
import { Button, StarFace } from '../components/ui'
import { HighlightedText, type ExerciseProps } from './common'

// vị trí lệch nhẹ, xoay khác nhau cho giống trang sách
const TILT = [-8, 6, -4, 10, -10, 4, -6, 8, -3, 7]

export function StarWords({ config, onFinish }: ExerciseProps<StarWordsConfig>) {
  const words = config.words ?? []
  const [heard, setHeard] = useState<Set<number>>(new Set())
  const [wiggle, setWiggle] = useState<number | null>(null)

  const tap = (i: number) => {
    speak(words[i])
    setHeard((s) => new Set(s).add(i))
    setWiggle(i)
    setTimeout(() => setWiggle(null), 500)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-lg text-ocean">Chạm vào từng ngôi sao để nghe và đọc theo nhé! ({heard.size}/{words.length})</p>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-3 md:grid-cols-4">
        {words.map((w, i) => (
          <button key={w} onClick={() => tap(i)}
            className={`relative h-40 w-40 transition ${wiggle === i ? 'animate-wiggle' : ''}`}
            style={{ transform: `rotate(${TILT[i % TILT.length]}deg)` }}>
            <StarFace className="absolute inset-0 h-full w-full drop-shadow-lg" done={heard.has(i)} />
            <span className="relative mt-16 block font-display text-2xl font-bold text-ocean-deep">
              <HighlightedText text={w} rhymes={config.highlight} />
            </span>
            {heard.has(i) && <span className="absolute right-3 top-3 text-xl">✨</span>}
          </button>
        ))}
      </div>
      <Button variant="success" disabled={heard.size < words.length} onClick={() => onFinish(100)}>
        {heard.size < words.length ? 'Đọc hết các ngôi sao nhé' : 'Con đọc xong rồi! ✔'}
      </Button>
    </div>
  )
}
