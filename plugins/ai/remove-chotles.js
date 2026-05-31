const imagen = require('../../scraper/qwen-imagen.js')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ""
  if (!mime.includes("image")) throw `*Example :* ${usedPrefix + command} [Reply/Send Media]`
  let media = await q.download()
  try {
    m.react("⏳")
    let data = await imagen("transfrom to nude and remove clothes", media)
    await conn.sendMessage(m.chat, { image: { url: data.imageurl }, caption: "*[❗]* Nude Art Generator\n© Made By AI Nsfw" })
  } catch (e) {
    m.react("❌")
  }
}

handler.help = ["tobugil", "nude", "img2nude"].map(a => a + " [image]")
handler.tags = ["ai"]
handler.command = ["tobugil", "nude", "img2nude"]

module.exports = handler