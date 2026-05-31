let handler = async (m, { usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!mime) throw `📸 *Contoh:* ${usedPrefix + command} (balas kirim media)`;

  if (!/image|video|audio/.test(mime)) throw `⚠️ File tidak didukung!\nHanya bisa upload *image/video/audio*`;
  try {
    let media = await q.download();
    let caption = [];
    let U = global.Uploader;
    if (/image/.test(mime)) {
      let telegraph = await U.telegraph(media).catch(() => null);
      if (telegraph) caption.push(`🌐 Telegraph: ${telegraph}`);
      let tmpfiles = await U.tmpfiles(media).catch(() => null);
      if (tmpfiles) caption.push(`📁 Tmpfiles: ${tmpfiles}`);
      let uguu = await U.Uguu(media).catch(() => null);
      if (uguu) caption.push(`🦋 Uguu: ${uguu}`);
      let puticu = await U.puticu(media).catch(() => null);
      if (puticu) caption.push(`☁️ Put.icu: ${puticu}`);
    }
    if (/video/.test(mime)) {
      let videy = await U.videy(media).catch(() => null);
      if (videy) caption.push(`🎬 Videy: ${videy}`);

      let tmpfiles = await U.tmpfiles(media).catch(() => null);
      if (tmpfiles) caption.push(`📁 Tmpfiles: ${tmpfiles}`);
      let pomf2 = await U.pomf2(media).catch(() => null);
      if (pomf2?.files?.[0]?.url) caption.push(`📦 Pomf2: ${pomf2.files[0].url}`);
      let puticu = await U.puticu(media).catch(() => null);
      if (puticu) caption.push(`☁️ Put.icu: ${puticu}`);
    }
    if (/audio/.test(mime)) {
      let tmpfiles = await U.tmpfiles(media).catch(() => null);
      if (tmpfiles) caption.push(`📁 Tmpfiles: ${tmpfiles}`);

      let uguu = await U.Uguu(media).catch(() => null);
      if (uguu) caption.push(`🦋 Uguu: ${uguu}`);

      let puticu = await U.puticu(media).catch(() => null);
      if (puticu) caption.push(`☁️ Put.icu: ${puticu}`);
    }

    if (!caption.length) throw `❌ Semua upload gagal.`;

    await m.reply(caption.join("\n"));
  } catch (e) {
    console.error(e);
    throw `⚠️ Terjadi kesalahan saat upload media.`;
  }
};

handler.help = ["tourl", "upload"].map((a) => a + " [reply/send media]");
handler.tags = ["tools"];
handler.command = ["tourl", "upload"];
handler.limit = true;

module.exports = handler;