const edit = require(process.cwd() + "/lib/media-edit.js")

async function handler(m, { conn, command, args, usedPrefix }) {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || ""
  if (!mime) throw `* *Example :* ${usedPrefix +command} [Reply Or Send Media]`

  m.react("⏳")
  const buffer = await q.download()

  let out
  if (/video/.test(mime)) {
    out = await edit.hdvid(buffer)
    await conn.sendMessage(m.chat, { video: out, caption: "[ HD VIDEO ]" }, { quoted: m })
  } else if (/image/.test(mime)) {
    if (command === "hd") out = await edit.hd(buffer)
    if (command === "hdr") out = await edit.hdr(buffer)
    if (command === "enhance") out = await edit.enhance(buffer)
    if (command === "restore") out = await edit.restore(buffer)
    if (command === "colorize") out = await edit.colorize(buffer)
    if (command === "upscale") {
      const s = parseInt(args[args.indexOf("-s") + 1]) || 2
      out = await edit.upscale(buffer, s)
    }
    await conn.sendMessage(m.chat, { image: out, caption: `[ ${command.toUpperCase()} ]` }, { quoted: m })
  } else {
    throw "Media tidak didukung"
  }

  m.react("✅")
}

handler.help = ["hd", "hdr", "enhance", "restore", "colorize", "upscale -s 2", 'hdvid', 'hdvideo']
handler.tags = ["tools"]
handler.command = ["hd", "hdr", "enhance", "restore", "colorize", "upscale", 'hdvid', 'hdvideo']
handler.limit = 3

module.exports = handler