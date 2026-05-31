module.exports = {
  help: ["toimg"].map((a) => a + " *[reply sticker]*"),
  tags: ["tools"],
  command: ["toimg"],
  code: async (m, { conn, usedPrefix, command, text, isOwner, isAdmin, isBotAdmin, isPrems, chatUpdate }) => {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || "";
    if (!mime) throw `*• Example :* ${usedPrefix + command} *[reply sticker]*`;
    conn.sendMessage(
      m.chat,
      {
        image: await q.download(),
        caption: done
      },
      {
        quoted: m
      }
    );
  }
};