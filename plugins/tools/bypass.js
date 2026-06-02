const bypass = require("../../scraper/bypass.js");

module.exports = {
    help: ["bypass", "skipurl"].map(v => v + " [url]"),
    tags: ["tools"],
    command: ["bypass", "skipurl"],
    code: async (m, { conn, args, usedPrefix, command }) => {
        if (!args[0]) throw `*• Example :* ${usedPrefix + command} *[masukan url untuk skip link]*`;

        try {
            await m.react("⏳");

            const start = Date.now();
            const result = await bypass(args[0]);
            const time = ((Date.now() - start) / 1000).toFixed(2);

            await m.react("✅");

            await conn.sendMessage(
                m.chat,
                {
                    text: `*✅ Berhasil Bypass*

*⏱️ Waktu:* ${time} detik

*🔗 URL Awal:*
${args[0]}

*📎 Hasil:*
${typeof result === "string" ? result : JSON.stringify(result, null, 2)}`
                },
                { quoted: m }
            );
        } catch (e) {
            await m.react("❌");
            await conn.sendMessage(
                m.chat,
                { text: global.eror?.(e.message) || e.message || String(e) },
                { quoted: m }
            );
        }
    }
};