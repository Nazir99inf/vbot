const startConverstation = require("../../scraper/ai-interface.js");

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*• Example:* ${usedPrefix + command} what your model?`;

  try {
    await m.react("⏳");

    const chat = await startConverstation(
      text,
      "deepseek-ai/DeepSeek-V4-Flash:novita"
    );

    await m.react("✅");

    await conn.sendMessage(
      m.chat,
      {
        text: chat.choices[0].message.content.replaceAll("**", "*"),
               /* contextInfo: {
          externalAdReply: {
            title: "Deepseek",
            body: "模型发布",
            thumbnailUrl: "https://i.pinimg.com/1200x/05/54/40/055440737406a41acb8265c600084093.jpg",
            sourceUrl: "https://www.deepseek.com",
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }*/
      },
      { quoted: m }
    );
  } catch (e) {
    console.log(e);
    return m.reply(String(e));
  }
};

handler.help = ["deepseek", "depsek"].map(a => a + " [question]");
handler.tags = ["ai"];
handler.command = ["deepseek", "depsek"];

module.exports = handler;