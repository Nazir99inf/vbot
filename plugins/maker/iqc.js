const axios = require("axios");
const moment = require("moment-timezone");

const handler = async (m, { conn, text }) => {
    if (!text) throw "Example .iqc hallo word😂";
    try {
        const buffer = await axios.post(
            "https://nazir99iq-canvas.hf.space/api/iqc",
            {
                msg: text,
                name: m.name
            },
            { responseType: "arraybuffer" }
        );
        let msgs = await conn.sendMessage(
            m.chat,
            {
                image: buffer.data,
                caption: `Here @${m.sender.split("@")[0]} !!`,
                mentions: [m.sender]
            },
            { quoted: m }
        );
        return conn.delete(msgs.key, global.delinterval)
    } catch (e) {
        console.error(e);
        m.reply("❌ Terjadi kesalahan saat memproses permintaan.");
    }
};

handler.help = ["iqc <teks>"];
handler.tags = ["tools", "maker"];
handler.command = ["iqc"];
handler.limit = true;
handler.limit = 2

module.exports = handler;
