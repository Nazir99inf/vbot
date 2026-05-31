const axios = require("axios");
const fs = require("fs");
const moment = require("moment-timezone");

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Example: ${usedPrefix + command} [text]`;
  if (text.length >= 150) throw `Maksimum 150 karakter.`;
  const response = await axios.post(`https://nazir99iq-canvas.hf.space/api/brat`, {
      text: text
    }, { responseType: "arraybuffer" });
  m.react("👌")
  const now = moment().tz("Asia/Jakarta").format("YYYY/MM/DD");
  const packname = m.name || namebot;
  const author = "\n"+now;
  let stic = await conn.sendImageAsSticker(m.chat, response.data, m, {
    packname,
    author
  });
  await conn.sendMessage(m.chat, {
    react: { text: "🎉", key: stic.key }
  });
};

handler.help = ["brat [text]"];
handler.tags = ["sticker"];
handler.command = /^brat$/i;
handler.limit = 1;

module.exports = handler;