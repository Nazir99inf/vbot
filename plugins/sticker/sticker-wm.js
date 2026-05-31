const webp = require("node-webpmux")

function createExif(pack, author) {
  const json = {
    "sticker-pack-id": "wm",
    "sticker-pack-name": pack || "",
    "sticker-pack-publisher": author || "",
    "emojis": [""]
  }
  const exifAttr = Buffer.from([
    0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00,
    0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
    0x00,0x00,0x16,0x00,0x00,0x00
  ])
  const jsonBuf = Buffer.from(JSON.stringify(json))
  const exif = Buffer.concat([exifAttr, jsonBuf])
  exif.writeUIntLE(jsonBuf.length, 14, 4)
  return exif
}

module.exports = {
  help: ["wm", "watermark"].map(v => v + " pack|author"),
  tags: ["sticker"],
  command: ["wm", "watermark"],
  code: async (m, { conn, text }) => {
    if (!text) return m.reply("Contoh: .wm packname|author")
    const q = m.quoted || m
    const mime = (q.msg || q).mimetype || ""
    if (!/webp/.test(mime)) return m.reply("Fitur ini khusus untuk stiker/webp langsung")
    const [pack, author] = text.split("|")
    try {
      const media = await q.download()

      const img = new webp.Image()
      await img.load(media)
      img.exif = createExif(pack, author)
      const final = await img.save(null)
      await conn.sendMessage(m.chat, { sticker: final }, { quoted: m })
    } catch (e) {
      console.error(e)
      m.reply("Gagal merubah watermark stiker")
    }
  }
}