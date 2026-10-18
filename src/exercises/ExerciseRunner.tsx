import { useEffect, useState, type ComponentType } from 'react'
import confetti from 'canvas-confetti'
import { saveAttempt } from '../lib/api'
import { starsFor } from '../lib/scoring'
import { speak } from '../lib/speech'
import type { Exercise, ExerciseType, Unit, Word } from '../lib/types'
import { Button, Card, StarRating, Whale } from '../components/ui'
import type { ExerciseProps } from './common'
import { ReadCard } from './ReadCard'
import { TraceCanvas } from './TraceCanvas'
import { TrueFalse } from './TrueFalse'
import { BuildTiles } from './BuildTiles'
import { PickTone } from './PickTone'
import { RhymeGrid } from './RhymeGrid'
import { StarWords } from './StarWords'
import { Passage } from './Passage'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const COMPONENTS: Record<ExerciseType, ComponentType<ExerciseProps<any>>> = {
  read: ReadCard, trace: TraceCanvas, true_false: TrueFalse, build: BuildTiles,
  pick_tone: PickTone, rhyme_grid: RhymeGrid, star_words: StarWords, passage: Passage,
}

interface Props {
  exercise: Exercise
  unit?: Unit | null
  unitWords: Word[]
  allWords: Word[]
  onNext?: () => void
  /** không lưu điểm (xem thử trong trang admin) */
  preview?: boolean
}

export function ExerciseRunner({ exercise, unit, unitWords, allWords, onNext, preview }: Props) {
  const [result, setResult] = useState<{ score: number; stars: number } | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [round, setRound] = useState(0)

  useEffect(() => { setResult(null); setRound(0) }, [exercise.id])

  const finish = async (score: number) => {
    const stars = starsFor(score)
    setResult({ score, stars })
    if (stars === 3) confetti({ particleCount: 140, spread: 80, origin: { y: 0.6 }, colors: ['#FFD23F', '#20A4B8', '#FF7F6B', '#7FD6E0'] })
    speak(stars >= 2 ? 'Con giỏi lắm' : 'Cố gắng thêm nhé')
    if (preview) return
    try { await saveAttempt(exercise.id, score, stars); setSaveError(null) }
    catch (e) { setSaveError((e as Error).message) }
  }

  const Comp = COMPONENTS[exercise.type]
  if (!Comp) return <p>Dạng bài “{exercise.type}” chưa hỗ trợ.</p>

  if (result) {
    return (
      <Card className="mx-auto flex max-w-md animate-pop flex-col items-center gap-4 text-center">
        <Whale className="h-28 w-28 animate-bob" mood={result.stars >= 1 ? 'happy' : 'sad'} />
        <h2 className="font-display text-4xl font-extrabold">
          {['Cố lên nào!', 'Khá lắm!', 'Giỏi quá!', 'Xuất sắc!'][result.stars]}
        </h2>
        <StarRating stars={result.stars} size="text-6xl" />
        <p className="text-xl text-ocean">{result.score} điểm</p>
        {saveError && <p className="text-sm text-coral">Không lưu được kết quả: {saveError}</p>}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => { setResult(null); setRound((r) => r + 1) }}>Làm lại</Button>
          {onNext && <Button onClick={onNext}>Bài tiếp ➜</Button>}
        </div>
      </Card>
    )
  }

  return (
    <Comp key={`${exercise.id}-${round}`} config={exercise.config} unit={unit}
      unitWords={unitWords} allWords={allWords} onFinish={finish} />
  )
}
