export type Role = 'student' | 'teacher'
export type UnitKind = 'am' | 'van' | 'thanh'

export interface Profile { id: string; username: string; display_name: string | null; role: Role }
export interface Unit {
  id: number; kind: UnitKind; subtype: string | null; value: string
  title: string | null; order_index: number; published: boolean
}
export interface Word { id: number; text: string; emoji: string | null; image_url: string | null }
export interface Lesson { id: number; number: number; title: string; order_index: number }

export type ExerciseType =
  | 'read' | 'trace' | 'true_false' | 'build' | 'pick_tone' | 'rhyme_grid' | 'star_words' | 'passage'

export interface ReadConfig { examples?: string[] }
export interface TraceConfig { glyph: string; mode: 'do' | 'to' }
export interface TrueFalseConfig { items: { word: string; statement: string; answer: boolean }[] }
export interface BuildConfig { parts: string[]; answer: string; distractors?: string[] }
export interface PickToneConfig { items: { base: string; answer: string; options: string[] }[] }
export interface RhymeGridConfig { rows: string[]; cols: string[]; given?: [string, string][]; blocked?: [string, string][] }
export interface StarWordsConfig { words: string[]; highlight?: string[] }
export interface PassageConfig { text: string; highlight?: string[] }

export interface Exercise {
  id: number; unit_id: number | null; lesson_id: number | null
  type: ExerciseType; title: string; config: Record<string, unknown>; order_index: number
}

export interface Attempt { id: number; user_id: string; exercise_id: number; score: number; stars: number; created_at: string }

export const UNIT_KIND_LABELS: Record<UnitKind, string> = { am: 'Âm', van: 'Vần', thanh: 'Thanh' }
export const AM_SUBTYPE_LABELS: Record<string, string> = { chinh: 'Âm chính', phu: 'Âm phụ', ghep: 'Phụ âm ghép' }

export const EXERCISE_LABELS: Record<ExerciseType, string> = {
  read: 'Đọc', trace: 'Tô / đồ chữ', true_false: 'Đúng – Sai', build: 'Ghép',
  pick_tone: 'Nghe chọn thanh', rhyme_grid: 'Bảng ghép vần', star_words: 'Đọc từ ngôi sao', passage: 'Đọc đoạn văn',
}

export const EXERCISE_TEMPLATES: Record<ExerciseType, unknown> = {
  read: { examples: ['ma', 'má'] },
  trace: { glyph: 'a', mode: 'do' },
  true_false: { items: [{ word: 'mèo', statement: 'Từ "mèo" có vần eo', answer: true }] },
  build: { parts: ['m', 'eo', '`'], answer: 'mèo', distractors: ['b', 'ac'] },
  pick_tone: { items: [{ base: 'ma', answer: 'má', options: ['ma', 'má', 'mà', 'mả', 'mã', 'mạ'] }] },
  rhyme_grid: { rows: ['a', 'o'], cols: ['c', 't'], given: [['a', 'c']], blocked: [] },
  star_words: { words: ['hạt thóc', 'quả ớt'], highlight: ['oc', 'ơt'] },
  passage: { text: 'Gà mẹ dẫn đàn con đi ăn.', highlight: ['an'] },
}
