const cv = require("../../lib/exif.js");
let handler = async (m, { conn, usedPrefix, command }) => {
  if (!m.quoted) throw `*• Example :* ${usedPrefix + command} *[reply sticker]*`;
  let mime = m.quoted.mimetype || "";
  if (!/webp/.test(mime)) throw `*• Example :* ${usedPrefix + command} *[reply sticker]*`;
  m.reply(wait);
  try {
    let media = await m.quoted.download();
    let out = Buffer.alloc(0);
    if (/webp/.test(mime)) {
      out = await cv.webp2mp4(media);
    }
    conn.sendMessage(
      m.chat,
      {
        video: {
          url: out
        }
      },
      {
        quoted: m
      }
    );
  } catch (e) {
    throw eror;
  }
};
handler.help = ["tovideo", "tovid"].map((a) => a + " *[reply sticker]*");
handler.tags = ["tools"];
handler.command = ["tovideo", "tovid"];
handler.limit = true;

module.exports = handler;
