import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { speak } from '../lib/speech'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ocean text-white shadow-[0_5px_0_#0B3D5C] hover:bg-lagoon',
  secondary: 'bg-white text-ocean-deep shadow-[0_5px_0_#7FD6E0] hover:bg-foam',
  ghost: 'bg-transparent text-ocean-deep hover:bg-white/50',
  danger: 'bg-coral text-white shadow-[0_5px_0_#c4553f]',
  success: 'bg-seaweed text-white shadow-[0_5px_0_#26834f]',
}

export function Button({ variant = 'primary', className = '', ...props }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...props}
      className={`min-h-[52px] rounded-2xl px-5 py-2 font-display text-xl font-bold transition active:translate-y-1 active:shadow-none disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    />
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[1.75rem] bg-white/90 p-5 shadow-lg backdrop-blur ${className}`}>{children}</div>
}

export function SpeakerButton({ text, className = '', size = 'md' }: { text: string; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'h-10 w-10 text-xl', md: 'h-14 w-14 text-2xl', lg: 'h-20 w-20 text-4xl' }[size]
  return (
    <button
      type="button"
      aria-label={`Nghe: ${text}`}
      onClick={(e) => { e.stopPropagation(); speak(text) }}
      className={`inline-flex items-center justify-center rounded-full bg-star shadow-[0_4px_0_#d9a800] transition active:translate-y-1 active:shadow-none ${s} ${className}`}
    >🔊</button>
  )
}

export function StarRating({ stars, size = 'text-3xl' }: { stars: number; size?: string }) {
  return (
    <span className={size} aria-label={`${stars} sao`}>
      {[0, 1, 2].map((i) => <span key={i} className={i < stars ? '' : 'opacity-25 grayscale'}>⭐</span>)}
    </span>
  )
}

export function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Whale className="h-20 w-20 animate-bob" />
    </div>
  )
}

export function Whale({ className = '', mood = 'happy' }: { className?: string; mood?: 'happy' | 'sad' }) {
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden>
      <path d="M58 22c-3-10 6-16 6-16M64 20c3-9 12-10 12-10M60 21c0-8-8-12-8-12" stroke="#7FD6E0" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M10 60c0-22 20-36 48-36 30 0 46 18 46 36 0 16-16 28-46 28C30 88 10 78 10 60z" fill="#1572A1" />
      <path d="M18 70c10 10 26 14 40 14 22 0 36-6 42-16-8 6-22 8-42 8-16 0-28-2-40-6z" fill="#E8F7FA" />
      <path d="M100 52c8-10 14-12 18-8-4 4-4 10 0 14-4 4-12 2-18-6z" fill="#0B3D5C" />
      <circle cx="38" cy="54" r="5" fill="#0B3D5C" /><circle cx="39.5" cy="52.5" r="1.6" fill="#fff" />
      <circle cx="30" cy="64" r="4" fill="#FF7F6B" opacity=".6" />
      {mood === 'happy'
        ? <path d="M34 68q8 7 16 0" stroke="#0B3D5C" strokeWidth="3" fill="none" strokeLinecap="round" />
        : <path d="M34 72q8 -6 16 0" stroke="#0B3D5C" strokeWidth="3" fill="none" strokeLinecap="round" />}
    </svg>
  )
}

/** Ngôi sao biển vàng có mặt cười (giống minh hoạ SGK) */
export function StarFace({ className = '', done = false }: { className?: string; done?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M50 4l13 29 31 3-23 21 7 31-28-16-28 16 7-31L6 36l31-3z"
        fill={done ? '#FFD23F' : '#FFE27A'} stroke="#E8A800" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="38" cy="28" rx="10" ry="5" fill="#fff" opacity=".55" transform="rotate(-25 38 28)" />
      <circle cx="40" cy="44" r="3.2" fill="#5a3b00" /><circle cx="60" cy="44" r="3.2" fill="#5a3b00" />
      <circle cx="33" cy="54" r="4" fill="#FF7F6B" opacity=".45" /><circle cx="67" cy="54" r="4" fill="#FF7F6B" opacity=".45" />
      <path d={done ? 'M42 54q8 9 16 0' : 'M44 55q6 4 12 0'} stroke="#5a3b00" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  )
}

/** Nền đại dương động: bong bóng nổi, cá bơi, sóng chạy (hiệu ứng như GIF, làm bằng CSS) */
export function OceanBackground() {
  const bubbles = Array.from({ length: 14 }, (_, i) => ({
    left: (i * 37) % 100, size: 8 + ((i * 13) % 22), dur: 9 + ((i * 7) % 10), delay: (i * 1.7) % 12,
  }))
  const fish = [
    { top: '22%', dur: 28, delay: 0, emoji: '🐠', size: 'text-3xl' },
    { top: '58%', dur: 36, delay: 8, emoji: '🐟', size: 'text-2xl' },
    { top: '75%', dur: 44, delay: 18, emoji: '🐡', size: 'text-3xl' },
  ]
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {bubbles.map((b, i) => (
        <span key={i} className="bubble" style={{ left: `${b.left}%`, width: b.size, height: b.size, animationDuration: `${b.dur}s`, animationDelay: `${b.delay}s` }} />
      ))}
      {fish.map((f, i) => (
        <span key={i} className={`fish ${f.size} opacity-70`} style={{ top: f.top, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }}>
          <span className="inline-block -scale-x-100">{f.emoji}</span>
        </span>
      ))}
      <div className="absolute bottom-0 left-0 h-24 w-[200%]">
        <svg className="wave absolute bottom-0 h-full w-full" style={{ animationDuration: '14s' }} viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0 40 Q75 10 150 40 T300 40 T450 40 T600 40 T750 40 T900 40 T1050 40 T1200 40 V100 H0z" fill="#20A4B8" opacity=".55" />
        </svg>
        <svg className="wave absolute bottom-0 h-3/4 w-full" style={{ animationDuration: '9s' }} viewBox="0 0 1200 100" preserveAspectRatio="none">
          <path d="M0 50 Q75 20 150 50 T300 50 T450 50 T600 50 T750 50 T900 50 T1050 50 T1200 50 V100 H0z" fill="#1572A1" opacity=".7" />
        </svg>
      </div>
    </div>
  )
}

type Creature = { emoji: string; top?: string; bottom?: string; left?: string; right?: string; size: string; anim: string; dur: number; delay?: number; flip?: boolean }

const SIDE_CREATURES: Creature[] = [
  // bên trái
  { emoji: '🐙', top: '12%', left: '8%', size: 'text-7xl', anim: 'creature-drift', dur: 7 },
  { emoji: '🪼', top: '30%', left: '24%', size: 'text-6xl', anim: 'creature-jelly', dur: 4.5, delay: 1 },
  { emoji: '🐢', top: '50%', left: '6%', size: 'text-7xl', anim: 'creature-drift', dur: 9, delay: 2, flip: true },
  { emoji: '🦐', top: '44%', left: '28%', size: 'text-4xl', anim: 'creature-bob', dur: 2.6 },
  { emoji: '🐠', top: '66%', left: '22%', size: 'text-5xl', anim: 'creature-drift', dur: 6, delay: .5, flip: true },
  { emoji: '🦀', bottom: '9%', left: '10%', size: 'text-5xl', anim: 'creature-scuttle', dur: 5 },
  { emoji: '🐚', bottom: '7%', left: '30%', size: 'text-4xl', anim: 'creature-bob', dur: 3.5, delay: 1 },
  // bên phải
  { emoji: '🐬', top: '10%', right: '18%', size: 'text-7xl', anim: 'creature-drift', dur: 6.5 },
  { emoji: '🐳', top: '26%', right: '4%', size: 'text-6xl', anim: 'creature-bob', dur: 4, delay: .8 },
  { emoji: '🦑', top: '40%', right: '24%', size: 'text-6xl', anim: 'creature-jelly', dur: 5, delay: 1.5 },
  { emoji: '🐡', top: '56%', right: '8%', size: 'text-5xl', anim: 'creature-drift', dur: 7.5, delay: 2 },
  { emoji: '🦞', top: '70%', right: '26%', size: 'text-5xl', anim: 'creature-bob', dur: 3, delay: .3 },
  { emoji: '⭐', bottom: '8%', right: '10%', size: 'text-5xl', anim: 'creature-sway', dur: 3.5 },
  { emoji: '🦭', bottom: '6%', right: '28%', size: 'text-6xl', anim: 'creature-bob', dur: 4.2, delay: 1.2 },
]

const SEAWEED = ['3%', '16%', '34%', '64%', '82%', '95%']

/** Sinh vật biển trang trí hai bên (ẩn trên màn hình nhỏ để không che form). */
export function SeaCreatures() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 hidden overflow-hidden lg:block" aria-hidden>
      {SEAWEED.map((left, i) => (
        <span key={`w${i}`} className="creature creature-sway bottom-0 text-6xl"
          style={{ left, animationDuration: `${3 + (i % 3)}s`, animationDelay: `${i * .4}s` }}>
          {i % 2 ? '🪸' : '🌿'}
        </span>
      ))}
      {SIDE_CREATURES.map((c, i) => (
        <span key={i} className={`creature ${c.anim} ${c.size}`}
          style={{ top: c.top, bottom: c.bottom, left: c.left, right: c.right, animationDuration: `${c.dur}s`, animationDelay: `${c.delay ?? 0}s` }}>
          <span className={`inline-block ${c.flip ? '-scale-x-100' : ''}`}>{c.emoji}</span>
        </span>
      ))}
    </div>
  )
}

/** Chữ nhún nhảy từng ký tự. */
export function BouncyTitle({ text, className = '' }: { text: string; className?: string }) {
  const colors = ['text-ocean-deep', 'text-ocean', 'text-lagoon', 'text-coral']
  let n = 0
  return (
    <h1 className={className} aria-label={text}>
      {text.split(' ').map((word, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-nowrap">
          {[...word].map((ch) => {
            const i = n++
            return (
              <span key={i} className={`title-letter ${colors[i % colors.length]}`} style={{ animationDelay: `${i * .12}s` }}>{ch}</span>
            )
          })}
        </span>
      )).reduce<ReactNode[]>((acc, el, i) => (i ? [...acc, ' ', el] : [el]), [])}
    </h1>
  )
}

export function WordImage({ emoji, imageUrl, text, className = 'h-24 w-24 text-6xl' }:
  { emoji?: string | null; imageUrl?: string | null; text: string; className?: string }) {
  if (imageUrl) return <img src={imageUrl} alt={text} className={`${className} rounded-2xl object-cover`} />
  return <span className={`${className} inline-flex items-center justify-center rounded-2xl bg-foam`} role="img" aria-label={text}>{emoji ?? '🖼️'}</span>
}
