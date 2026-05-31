const ytm = require("../../scraper/yt-meta.js");

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*• Example :* ${usedPrefix + command} *[query]*`;
  m.reply("Please wait...");
  try {
    let q = await ytm.yts(text);
    let array = [];
    for (let i of q) {
      array.push({
        headers: "YOUTUBE SEARCH",
        rows: [
          {
            headers: "Download Video",
            title: i.title,
            body: i.description,
            command: ".ytv " + i.url
          },
          {
            headers: "Download Audio",
            title: i.title,
            body: i.description,
            command: ".yta " + i.url
          }
        ]
      });
    }
    if (global.isButton) {
      conn.sendList(m.chat, `Find Result [${q.length}]`, array, m, {
        body: `*• Result From :* ${text}`,
        footer: "\n( Views ) Button",
        url: q[0].thumbnail
      });
    } else {
      m.reply(
        q
          .map(
            (a, i) => `*• ${i + 1}.* ${a.title.toUpperCase()}
*• Duration :* ${a.duration}
*• Release :* ${a.ago}
*• Author :* ${a.author}
*• Url :* ${a.url}`
          )
          .join("\n\n"),
        q[0].thumbnail
      );
    }
  } catch (e) {
    throw e;
  }
};
handler.help = ["yts", "ytsearch"].map(a => a + " *[query]*");
handler.tags = ["downloader"];
handler.command = ["yts", "ytsearch"];

module.exports = handler;