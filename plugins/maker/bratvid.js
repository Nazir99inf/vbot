const axios = require("axios");
const moment = require("moment-timezone");

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    if (!text) {
        return m.reply(`*• Example :* ${usedPrefix + command} *[input text]*`);
    }
    try {
      const { data } = await axios.get(`https://nazir99iq-canvas.hf.space/api/bratvid?text=${encodeURIComponent(text)}`, {
                        responseType: "arraybuffer",
                    },
                )
                const now = moment().tz("Asia/Jakarta").format("YYYY/MM/DD");
  const packname = m.name || namebot;
                await conn.sendMessage(m.chat, { sticker: data, packname, author: now }, { quoted: m })
                
    } catch (err) {
        console.error(err);
        m.reply("Maaf, terjadi kesalahan saat memproses permintaan.");
    }
};

handler.help = ["bratvid"].map((a) => a + " *[text]*");
handler.tags = ["sticker"];
handler.command = ["bratvid"];
handler.premium = false;
handler.limit = 1

module.exports = handler;