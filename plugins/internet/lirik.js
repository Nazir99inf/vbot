const lirik = require(process.cwd() + '/scraper/lirik')

let handler = async (m, { conn, usedPrefix, text, command }) => {
  if (!text) throw `* *Example :* ${usedPrefix + command} Sailor Song`;
  let data = await lirik(text);
  let caption = `*乂 G E N I U S - L Y R I C*
◦ Title : ${data.title}\n ◦ Author : ${data.author}\n ◦ Url : ${data.url}\n ◦ Realese : ${data.release}\n\n*🎵 LYRICS 🎵*\n${data.lirik}`;
  await conn.relayMessage(
    m.chat,
    {
      extendedTextMessage: {
        text: caption,
        mentions: [m.sender]
      }
    },
    { quoted: m }
  );
};
handler.help = ["lirik", "lyrics"].map((a) => a + " [song name]");
handler.tags = ["internet", "tools"];
handler.command = ["lirik", "lyrics"];
handler.limit = true;

module.exports = handler;
