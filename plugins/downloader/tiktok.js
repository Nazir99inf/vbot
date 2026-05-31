const tiktok = require("../../scraper/tiktok.js");

module.exports = {
    help: ["tt", "tiktok", "ttslide", "ttdl"].map(v => v + " *[Tiktok Url]*"),
    limit: 1,
    tags: ["downloader"],
    command: ["tt", "tiktok", "ttslide", "ttdl"],
    code: async (m, { conn, usedPrefix, command, args }) => {
        if (!args[0] || !/tiktok/.test(args[0])) {
            throw `*• Example :* ${usedPrefix + command} *[Valid TikTok URL]*`;
        }

        try {
            m.react("⏳");
            const data = await tiktok(args[0]);

            const caption = `*乂 T I K T O K - ${data.isVideo ? "D O W N L O A D E R" : "S L I D E"}*

◦ Title : ${data.title}
◦ Views : ${data.views}
◦ Like : ${data.like}
◦ Comment : ${data.comment}
◦ Share : ${data.share}
◦ Author : ${data.author.nickname}
◦ Duration : ${data.duration}`;
            let video = await conn.sendAlbum(
                m.chat,
                data.download,
                {
                    caption,
                    ...(global.autodel ? { delete: true, time: global.delinterval } : {})
                },
                m
            );

            m.react("✅");
            await conn.sendMessage(m.chat, { audio: { url: data.music.url }, mimetype: "audio/mpeg" }, { quoted: video });
        } catch (e) {
            m.react("❌");
            conn.sendMessage(m.chat, { text: global.eror(e.message) }, { quoted: m });
        }
    }
};
