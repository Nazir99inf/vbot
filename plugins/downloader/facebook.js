const ua = "Mozilla/5.0 (Linux; Android 10) Chrome/139.0.0.0 Mobile";

const clean = s => s?.replace(/&amp;/g, "&").replace(/&quot;/g, '"') || "";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Example: ${usedPrefix + command} <url>`);

  try {
    const body = new URLSearchParams({
      q: text,
      lang: "en",
      v: "v2"
    });

    const res = await fetch("https://fbdown.to/api/ajaxSearch", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "user-agent": ua,
        "x-requested-with": "XMLHttpRequest"
      },
      body
    });

    const json = await res.json();
    const html = json.data || "";

    const video = html.match(/https:\/\/dl\.snapcdn\.app\/download\?token=[^"]+/)?.[0];

    const audio = html.match(/id="audioUrl"\s+value="([^"]+)"/)?.[1];

    if (!video && !audio) return m.reply("Media tidak ditemukan.");

    if (video) {
      await conn.sendMessage(m.chat, { video: { url: clean(video) } }, { quoted: m });
    }

    if (audio) {
      await conn.sendMessage(m.chat, { audio: { url: clean(audio) }, mimetype: "audio/mp4" }, { quoted: m });
    }
  } catch {
    m.reply("Error");
  }
};

handler.help = ["fb", "facebook"].map(a => a + " [url]");
handler.tags = ["downloader"];
handler.command = ["fb", "facebook"];

module.exports = handler;
