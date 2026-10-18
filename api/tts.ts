// Vercel Function: GET /api/tts?q=<văn bản> → mp3 giọng tiếng Việt.
// Dùng khi máy người dùng không có giọng vi-VN cho Web Speech API.
const UPSTREAM = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q='

export async function GET(request: Request): Promise<Response> {
  const q = (new URL(request.url).searchParams.get('q') ?? '').trim()
  if (!q || q.length > 200) return new Response('q phải có 1–200 ký tự', { status: 400 })

  const upstream = await fetch(UPSTREAM + encodeURIComponent(q), {
    headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://translate.google.com/' },
  })
  if (!upstream.ok) return new Response('TTS lỗi', { status: 502 })

  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      // cùng một từ → CDN trả lại bản đã lưu, không gọi lại nguồn
      'Cache-Control': 'public, max-age=86400, s-maxage=31536000, immutable',
    },
  })
}
