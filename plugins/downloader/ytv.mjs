import fs from "fs";
import ytm from "../../scraper/yt-meta.js";
import ytp from "../../scraper/youtube.js";

export default {
    help: ["ytv", "ytmp4", "yt"].map(a => a + " [youtubeUrl]"),
    limit: 1,
    tags: ["downloader"],
    command: ["ytv", "ytmp4", "yt"],
    code: async (m, { conn, usedPrefix, command, args }) => {
        if (!args[0]) throw `*Example :* ${usedPrefix + command} https://youtu.be/wL8DVHuWI7Y`;

        m.react("⏳");

        const id = args[0].match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
        const metadata = await ytm.ytm(id);

        let caption = `*[ Youtube Video Downloader ]*\n${Object.entries(metadata)
            .filter(([key, val]) => !["videoId", "comments"].includes(key) && val != null)
            .map(([k, v]) => ` ◦ ${k.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase())}: ${v}`)
            .join("\n")}`;

        const videoplayer = await ytp(metadata.videoId, "mp4");

        // ukuran dalam byte
        const size = Number(videoplayer.contentLength || videoplayer.size || 0);

        if (size > 180 * 1024 * 1024) {
            await conn.sendMessage(
                m.chat,
                {
                    document: { url: global.useProxy ? global.proxyUrl + videoplayer.url : videoplayer.url },
                    mimetype: "video/mp4",
                    fileName: `${metadata.title}.mp4`,
                    caption
                },
                { quoted: m }
            );
        } else {
            await conn.sendMessage(
                m.chat,
                {
                    video: { url: global.useProxy ? global.proxyUrl + videoplayer.url : videoplayer.url },
                    caption
                },
                { quoted: m }
            );
        }

        m.react("✅");
    }
};
