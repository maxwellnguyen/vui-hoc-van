import { describe, expect, it } from 'vitest'
import { applyTone, composeSyllable, findRhyme, stripTone } from './vietnamese'
import { percent, starsFor, traceScore } from './scoring'

describe('composeSyllable', () => {
  it.each([
    [['b', 'a', '`'], 'bà'],
    [['c', 'a', '´'], 'cá'],
    [['m', 'eo', '`'], 'mèo'],
    [['th', 'o', '?'], 'thỏ'],
    [['m', 'u', '~'], 'mũ'],
    [['m', 'e', '.'], 'mẹ'],
    [['ng', 'h', 'e', '´'], 'nghé'],
    [['n', 'g', 'h'], 'ngh'],
  ])('%j → %s', (parts, expected) => {
    expect(composeSyllable(parts)).toBe(expected)
  })
})

describe('applyTone', () => {
  it.each([
    ['hoa', '`', 'hoà'],
    ['qua', '?', 'quả'],
    ['gia', '`', 'già'],
    ['thuy', '?', 'thuỷ'],
    ['muong', '`', 'muòng'],
    ['mương', '`', 'mường'],
    ['thoc', '´', 'thóc'],
    ['moc', '´', 'móc'],
    ['mua', '`', 'mùa'],
    ['khoai', '´', 'khoái'],
    ['tiên', '´', 'tiến'],
    ['mưa', '?', 'mửa'],
  ])('%s + %s → %s', (s, m, expected) => {
    expect(applyTone(s, m)).toBe(expected)
  })
})

describe('findRhyme', () => {
  const R = ['ac', 'ăc', 'âc', 'oc', 'ôc', 'uc', 'ưc', 'at', 'ăt', 'ât', 'ot', 'ôt', 'ơt', 'ut', 'ưt']
  it('tô vần trong tiếng', () => {
    expect(findRhyme('thóc', R)).toEqual([2, 4])
    expect(findRhyme('mắt', R)).toEqual([1, 3])
    expect(findRhyme('ớt', R)).toEqual([0, 2])
    expect(findRhyme('giấc', R)).toEqual([2, 4])
    expect(findRhyme('mơ', R)).toBeNull()
    expect(findRhyme('lửa', R)).toBeNull()
  })
  it('không cắt giữa cụm nguyên âm', () => {
    expect(findRhyme('thuốc', ['oc', 'ôc'])).toBeNull()
  })
  it('stripTone giữ dấu phụ', () => {
    expect(stripTone('xắc')).toBe('xăc')
  })
})

describe('scoring', () => {
  it('stars', () => {
    expect([100, 90, 89, 70, 40, 39, 0].map(starsFor)).toEqual([3, 3, 2, 2, 1, 0, 0])
  })
  it('percent', () => {
    expect(percent(2, 3)).toBe(67)
    expect(percent(0, 0)).toBe(0)
  })
  it('traceScore', () => {
    const target = Array.from({ length: 10 }, (_, i) => ({ x: i, y: 0 }))
    expect(traceScore(target, () => true, 0)).toBe(100)
    expect(traceScore(target, (x) => x < 5, 0.1)).toBe(50)
    expect(traceScore(target, () => true, 0.85)).toBe(50)
    expect(traceScore([], () => true, 0)).toBe(0)
  })
})
