const axios = require("axios");
const moment = require("moment-timezone");

const handler = async (m, { conn, text }) => {
  if (!text) throw "Example: .iqc2 halo world 😂";

  try {
    const time = moment().tz("Asia/Jakarta").format("HH.mm");

    const res = await axios.post(
      "https://nazir99iq-canvas.hf.space/api/iqc2",
      {
        msg: text,
        msgTime: time
      },
      {
        responseType: "arraybuffer"
      }
    );

    await conn.sendMessage(
      m.chat,
      {
        image: res.data,
        caption: `Here @${m.sender.split("@")[0]} !!`,
        mentions: [m.sender]
      },
      { quoted: m }
    );
  } catch (e) {
    console.error(e);
    m.reply("❌ Terjadi kesalahan saat memproses permintaan.");
  }
};

handler.help = ["iqc2 <teks>"];
handler.tags = ["tools", "maker"];
handler.command = ["iqc2"];
handler.limit = true;

module.exports = handler;