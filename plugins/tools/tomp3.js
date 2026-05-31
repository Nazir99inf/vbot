const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (m.quoted ? m.quoted.msg.mimetype : m.msg.mimetype) || ''
  if (!/video|audio/.test(mime)) {
    throw `*• Example :* ${usedPrefix + command} *[reply/send video]*`
  }
  let tmpDir = path.join(process.cwd(), 'tmp')
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)
  let input = path.join(tmpDir, `${Date.now()}_input`)
  let output = path.join(tmpDir, `${Date.now()}.mp3`)
  try {
    let buffer = await q.download()
    fs.writeFileSync(input, buffer)
    let cmd = `ffmpeg -y -i "${input}" -vn -ac 2 -ar 44100 -ab 128k "${output}"`
    await new Promise((resolve, reject) => {
      exec(cmd, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })
    let audioBuffer = fs.readFileSync(output)
    await conn.sendMessage(
      m.chat,
      { audio: audioBuffer, mimetype: 'audio/mpeg' },
      { quoted: m }
    )

  } catch (e) {
    throw `❌ Error converting audio`
  } finally {
    if (fs.existsSync(input)) fs.unlinkSync(input)
    if (fs.existsSync(output)) fs.unlinkSync(output)
  }
}

handler.help = ['tomp3', 'toaudio'].map(v => v + ' *[reply/send video]*')
handler.tags = ['tools']
handler.command = ['tomp3', 'toaudio']
handler.limit = true

module.exports = handler