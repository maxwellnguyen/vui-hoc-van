import { useState } from 'react'
import { speak } from '../lib/speech'
import { percent } from '../lib/scoring'
import type { TrueFalseConfig } from '../lib/types'
import { SpeakerButton, Whale, WordImage } from '../components/ui'
import { findWord, type ExerciseProps } from './common'

export function TrueFalse({ config, allWords, onFinish }: ExerciseProps<TrueFalseConfig>) {
  const items = config.items ?? []
  const [i, setI] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null)
  const item = items[i]
  if (!item) return <p>Bài chưa có câu hỏi.</p>
  const word = findWord(allWords, item.word)

  const answer = (v: boolean) => {
    if (feedback) return
    const ok = v === item.answer
    setFeedback(ok ? 'right' : 'wrong')
    speak(ok ? 'Đúng rồi' : 'Chưa đúng')
    const nextCorrect = correct + (ok ? 1 : 0)
    setCorrect(nextCorrect)
    setTimeout(() => {
      setFeedback(null)
      if (i + 1 >= items.length) onFinish(percent(nextCorrect, items.length))
      else setI(i + 1)
    }, 1300)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-ocean">Câu {i + 1} / {items.length}</p>
      <div key={i} className="flex animate-pop flex-col items-center gap-3">
        <WordImage emoji={word?.emoji} imageUrl={word?.image_url} text={item.word} className="h-36 w-36 text-8xl" />
        <div className="flex items-center gap-3">
          <p className="text-center font-display text-2xl font-bold sm:text-3xl">{item.statement}</p>
          <SpeakerButton text={item.statement} size="sm" />
        </div>
      </div>
      <div className="flex gap-6">
        <button onClick={() => answer(true)} className="h-28 w-28 rounded-full bg-seaweed text-6xl shadow-[0_6px_0_#26834f] active:translate-y-1">✔</button>
        <button onClick={() => answer(false)} className="h-28 w-28 rounded-full bg-coral text-6xl text-white shadow-[0_6px_0_#c4553f] active:translate-y-1">✘</button>
      </div>
      <div className="h-24">
        {feedback && (
          <div className={`flex items-center gap-2 font-display text-3xl font-bold ${feedback === 'right' ? 'animate-pop text-seaweed' : 'animate-shake text-coral'}`}>
            <Whale className="h-20 w-20" mood={feedback === 'right' ? 'happy' : 'sad'} />
            {feedback === 'right' ? 'Đúng rồi!' : `Chưa đúng – đáp án là ${item.answer ? 'Đúng' : 'Sai'}`}
          </div>
        )}
      </div>
    </div>
  )
}
