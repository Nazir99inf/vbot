import crypto from 'crypto'

const CLOUDBOOKLET_PAGE = 'https://www.cloudbooklet.com/ai-image-generator'


const SESSION_ID = '50a34184-1ed8-4800-a306-6df631bbae2a'
const SECURITY_HASH = '01a6b5a9b0fe3d3cc183c57b016f276a'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Masukkan prompt!\nContoh: *${usedPrefix + command}* seorang bapak sedang memasak`

  m.reply('Sedang Memproses Gambar...')

  try {
    const seed = crypto.randomInt(1, 999999999)

    const tokenRes = await fetch(
      'https://api.nekolabs.web.id/tools/bypass/cf-turnstile?' +
        new URLSearchParams({
          url: CLOUDBOOKLET_PAGE,
          siteKey: "0x4AAAAAAAVATcIK2Cuwen3S"
        })
    )

    const tokenJson = await tokenRes.json()
    if (!tokenJson.success || !tokenJson.result) throw 'Gagal mendapatkan token Turnstile'

    const token = tokenJson.result

    const headers = {
      accept: '*/*',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      origin: 'https://www.cloudbooklet.com',
      referer: CLOUDBOOKLET_PAGE,
      'x-requested-with': 'XMLHttpRequest',
      'user-agent':
        'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36',
      cookie: 'pll_language=en'
    }

    const post = async body => {
      const res = await fetch('https://www.cloudbooklet.com?api=v1', {
        method: 'POST',
        headers,
        body
      })
      return res.json()
    }

    const bodyTurnstile = new URLSearchParams()
    bodyTurnstile.append('action', 'turnstile')
    bodyTurnstile.append('module', 'image')
    bodyTurnstile.append('prompt', text)
    bodyTurnstile.append('dimension', 'square')
    bodyTurnstile.append('seed', seed)
    bodyTurnstile.append('system', '')
    bodyTurnstile.append('session', SESSION_ID)
    bodyTurnstile.append('error', 'false')
    bodyTurnstile.append('token', token)
    bodyTurnstile.append('security', SECURITY_HASH)

    const turnstile = await post(bodyTurnstile)
    if (!turnstile.status) throw String(turnstile)

    const bodyImage = new URLSearchParams()
    bodyImage.append('action', 'image')
    bodyImage.append('module', 'image')
    bodyImage.append('prompt', text)
    bodyImage.append('dimension', 'square')
    bodyImage.append('seed', seed)
    bodyImage.append('system', '')
    bodyImage.append('session', SESSION_ID)
    bodyImage.append('error', 'false')
    bodyImage.append('token', token)
    bodyImage.append('security', SECURITY_HASH)

    const start = await post(bodyImage)
    if (!start.status || !start.id) throw String(start)

    const jobId = start.id

    while (true) {
      await new Promise(r => setTimeout(r, 3000))
      const q = new URLSearchParams()
      q.append('action', 'queue')
      q.append('module', 'image')
      q.append('id', jobId)
      q.append('token', token)
      q.append('security', SECURITY_HASH)
      const check = await post(q)
      if (check.status && check.pending === 0) break
    }

    const h = new URLSearchParams()
    h.append('action', 'history')
    h.append('module', 'image')
    h.append('id', jobId)
    h.append('token', token)
    h.append('security', SECURITY_HASH)

    const history = await post(h)
    if (!history.status || !history.file) throw String(history)

    const o = new URLSearchParams()
    o.append('action', 'output')
    o.append('module', 'image')
    o.append('id', history.file)
    o.append('token', token)
    o.append('security', SECURITY_HASH)

    const output = await post(o)
    if (!output.status || !output.data) throw String(output)

    await conn.sendMessage(
      m.chat,
      {
        image: { url: output.data },
        caption: `*Prompt:* ${text}`
      },
      { quoted: m }
    )
  } catch (e) {
    m.reply(String(e))
  }
}

handler.help =['texttoimg', 'text2img'].map(a => a +' [prompt]')
handler.tags = ['ai', 'tools']
handler.command = ['texttoimg', 'text2img']

export default handler