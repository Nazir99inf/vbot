const Instagram = require("../../scraper/instagram.js");

module.exports = {
  help: ["ig", "instagram", "igdl"].map(v => v + " [url]"),
  tags: ["downloader"],
  command: ["ig", "instagram", "igdl"],
  code: async (m, { conn, args, command, usedPrefix }) => {
    if (!args[0] || !args[0].includes("instagram.com")) throw `* *Example :* ${usedPrefix + command} [instagram reel/syory]`;
    try {
      m.react("⏳");
      const res = await Instagram(args[0]);
      const caption = `*乂 I N S T A G R A M*

◦ Username : ${res.author?.username || "-"}
◦ Name : ${res.author?.name || "-"}
◦ Followers : ${res.author?.followers || "-"}
◦ Like : ${res.stats?.like || "-"}
◦ Comment : ${res.stats?.comments || "-"}
${res.caption ? `\nCaption : ${res.caption}` : ""}`;
      await conn.sendAlbum(m.chat, res.media, { caption, delete: global.delinterval }, m);
      m.react("✅");
    } catch (e) {
      m.react("❌");
      m.reply(String(e));
    }
  }
};
