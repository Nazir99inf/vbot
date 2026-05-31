const cheerio = require("cheerio");

async function getPPGrup(inviteLink) {
  try {
    const res = await fetch(inviteLink, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" } });
    const $ = cheerio.load(await res.text());
    return $('meta[property="og:image"]').attr("content") || null;
  } catch { return null; }
}

async function urlToBuffer(url) {
  const res = await fetch(url);
  return Buffer.from(await res.arrayBuffer());
}

const handler = async (m, { conn, text }) => {
  if (!m.isGroup) throw "❌ Command ini hanya bisa digunakan di grup";

  let title = "Group", member = 0, duration = 0, description = "", profileBuffer;
  if (text?.startsWith("https://chat.whatsapp.com/")) {
    try {
      const code = text.split("chat.whatsapp.com/")[1]?.split("?")[0];
      const info = await conn.groupGetInviteInfo(code);
      title = info.subject || title;
      member = info.size || 0;
      duration = info.ephemeralDuration || 0;
      description = info.desc || "";
      const ppUrl = await getPPGrup(text);
      if (ppUrl) profileBuffer = await urlToBuffer(ppUrl);
    } catch (e) {
      throw "❌ Link grup tidak valid / expired";
    }
  } else {
    const meta = await conn.groupMetadata(m.chat);
    title = meta.subject || title;
    member = meta.participants?.length || 0;
    duration = meta.ephemeralDuration || 0;
    description = meta.desc || "";
    try {
      const pp = await conn.profilePictureUrl(m.chat, "image");
      profileBuffer = await urlToBuffer(pp);
    } catch {}
  }

  try {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("member", String(member));
    formData.append("duration", String(duration));
    formData.append("description", description);
    if (profileBuffer) formData.append("profile", new Blob([profileBuffer], { type: "image/png" }), "pp.png");

    const res = await fetch("https://nazir99iq-canvas.hf.space/api/ssgcip", {
      method: "POST",
      body: formData
    });

    await conn.sendMessage(m.chat, {
      image: Buffer.from(await res.arrayBuffer()),
      caption: `Here @${m.sender.split("@")[0]} !!`,
      mentions: [m.sender]
    }, { quoted: m });
  } catch (e) {
    m.reply(`❌ Gagal membuat info grup.: ${e}`);
  }
};

handler.help = ["ssgc <link grup>", "ssgcip <link grup>"];
handler.tags = ["tools", "maker"];
handler.command = ["ssgc", "ssgcip"];
handler.group = true;
handler.limit = true;

module.exports = handler;