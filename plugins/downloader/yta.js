const yts = require("../../scraper/yt-meta.js");
const fs = require("fs");
const path = require("path");
const Audio = require("../../lib/audio.js");
const { execSync } = require("child_process");
let ytp = require("../../scraper/youtube.js");

async function exact(vid) {
    if (Func.isUrl(vid)) {
        const id = vid.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/)?.[1];
        return await yts.ytm(id);
    } else {
        const s = await yts.yts(vid);
        return s[0];
    }
}

let handler = async (m, { conn, text }) => {
    if (!text) throw "*• Example :* .play sailor song";

    try {
        m.react("⌛");
        const data = await exact(text);
        const videoId = data.videoId || data.id;
        const player = await ytp(videoId, "mp3");
        let thum = await fetch(data.thumbnail);
        let thumbnail = Buffer.from(await thum.arrayBuffer());

        let q = await conn.sendAliasMessage(
            m.chat,
            {
                text: `*乂 Y T M P 3 - P L A Y*\n
 ◦  Title : ${data.title}
 ◦  Url : ${data.url}
 ◦  Duration : ${data.duration}
 ◦  Views : ${Func.h2k(data.views)}
 ◦  Author : ${data.author}
 ◦  Size : ${Func.formatSize(player.contentLength)}
 ◦  Ago : ${data.ago}
───────────────
💬 *Reply Message With Number®*
① Get Lyrics 🎼
② Download Video 🎥`
            },
            [
                { alias: "1", cmd: `.lirik ${Func.isUrl(text) ? data.title : text}` },
                { alias: "2", cmd: `.ytv ${data.url}` }
            ],
            m
        );
        const audio = await fetch(global.useProxy ? global.proxyUrl + player.url : player.url, { headers: { Range: `bytes=0-${Number(player.contentLength) + 50826}` } });
        const mp3 = Buffer.from(await audio.arrayBuffer());
        const input = path.join(process.cwd() + "/tmp", `input-${data.videoId}.m4a`);
        const output = path.join(process.cwd() + "/tmp", `yta-${data.videoId}.mp3`);
        fs.writeFileSync(input, mp3);
        execSync(`ffmpeg -y -i "${input}" -vn -ar 44100 -ac 2 -b:a 128k -preset ultrafast "${output}"`, { stdio: "ignore" });
        const mp3Fixed = fs.readFileSync(output);
        const tagged = Audio.update(
            {
                title: data.title.toString(),
                originalTitle: data.title.toString(),
                subtitle: data.title.toString(),
                author: data.author,
                image: thumbnail
            },
            mp3Fixed
        );
        await conn.sendMessage(m.chat, { audio: tagged, mimetype: "audio/mpeg" }, { quoted: q });

        m.react("✅");
    } catch (e) {
        console.error(e);
        m.react("❌");
        m.reply(e.message);
    }
};

handler.command = ["ytmp3", "yta", "play", "song", "ds"];
handler.help = ["ytmp3", "yta", "play", "song", "ds"];
handler.tags = ["downloader"];
handler.exp = 0;
handler.limit = true;
handler.premium = false;

module.exports = handler;
