const fs = require("fs");
const moment = require("moment-timezone");

let handler = async (m, { conn, usedPrefix, isBotAdmin, command, isAdmin }) => {
    let q = m.quoted || m;
    let mime = (q.msg || q).mimetype || "";
    if (!/image|video/.test(mime)) return m.reply(`Example: ${usedPrefix + command} [reply/send media]`);
    const now = moment().tz("Asia/Jakarta").format("YYYY/MM/DD/HH/mm");
    const packname = m.name || global.namebot || "Bot";
    const author = now;
    if (/image/.test(mime)) {
        m.react("⏳");
        const media = await conn.downloadAndSaveMediaMessage(q, `${Date.now()}`);
        await conn.sendImageAsSticker(m.chat, media, m, { packname, author });
        fs.unlinkSync(media);
        if (m.isGroup && isBotAdmin) {
            await q.delete();
        }
        await m.react("✅");
    }
    if (/video/.test(mime)) {
        m.react("⏳");
        if (q.seconds > 11) return m.reply("Max 10 seconds video!");
        const media = await conn.downloadAndSaveMediaMessage(q, `${Date.now()}`);
        await conn.sendVideoAsSticker(m.chat, media, m, { packname, author });
        fs.unlinkSync(media);
        if (m.isGroup && isBotAdmin) {
            await q.delete();
        }
        await m.react("✅");
    }
};

handler.help = ["sticker", "s"].map(a => a + " [reply/send media]");
handler.tags = ["sticker"];
handler.command = ["s", "sticker"];
handler.group = false;
handler.limit = 1;

module.exports = handler;
