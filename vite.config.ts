import { defineConfig, type Connect, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

const TTS_UPSTREAM = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q='

/** /api/tts khi chạy `npm run dev` / `npm run preview` (trên Vercel là api/tts.ts, Docker là nginx) */
const ttsMiddleware: Connect.NextHandleFunction = async (req, res, next) => {
  if (!req.url?.startsWith('/api/tts')) return next()
  const q = (new URL(req.url, 'http://localhost').searchParams.get('q') ?? '').trim()
  if (!q || q.length > 200) { res.statusCode = 400; res.end('q phải có 1–200 ký tự'); return }
  try {
    const r = await fetch(TTS_UPSTREAM + encodeURIComponent(q), {
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://translate.google.com/' },
    })
    if (!r.ok) throw new Error(String(r.status))
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400')
    res.end(Buffer.from(await r.arrayBuffer()))
  } catch {
    res.statusCode = 502; res.end('TTS lỗi')
  }
}

const ttsPlugin = (): Plugin => ({
  name: 'vi-tts',
  configureServer: (server) => { server.middlewares.use(ttsMiddleware) },
  configurePreviewServer: (server) => { server.middlewares.use(ttsMiddleware) },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ttsPlugin()],
})
