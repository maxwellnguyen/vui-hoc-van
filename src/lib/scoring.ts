export function starsFor(score: number): number {
  if (score >= 90) return 3
  if (score >= 70) return 2
  if (score >= 40) return 1
  return 0
}

/** Tỉ lệ đúng → điểm 0..100 */
export const percent = (correct: number, total: number) =>
  total <= 0 ? 0 : Math.round((correct / total) * 100)

/**
 * Chấm bài tô/đồ chữ.
 * target: các điểm mẫu thuộc nét chữ; inked(x,y): bé đã tô tại điểm đó chưa;
 * outsideInk: tỉ lệ mực nằm ngoài chữ (0..1).
 */
export function traceScore(
  target: { x: number; y: number }[],
  inked: (x: number, y: number) => boolean,
  outsideInk: number,
): number {
  if (target.length === 0) return 0
  const covered = target.filter((p) => inked(p.x, p.y)).length / target.length
  const penalty = Math.max(0, outsideInk - 0.35) // cho phép tô lem một chút
  return Math.max(0, Math.min(100, Math.round((covered - penalty) * 100)))
}
