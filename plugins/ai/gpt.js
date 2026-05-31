const startConverstation = require("../../scraper/ai-interface.js");

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*• Example:* ${usedPrefix + command} what your model?`;
  try {
    m.react("⏳");
    const gpt = await startConverstation(text,"openai/gpt-oss-120b:novita")
    await m.react("✅");
    await conn.sendMessage(
      m.chat,
      {
        text: gpt.choices[0].message.content.replaceAll("**", "*"),
        /*contextInfo: {
          externalAdReply: {
            title: "ChatGPT",
            body: `OpenAI | model: ${hasil.model}`,
            thumbnailUrl: "https://i.pinimg.com/1200x/b3/3f/0d/b33f0d10bab5c0d68a006844f7eda264.jpg",
            sourceUrl: "https://openai.com",
            mediaType: 1,
            renderLargerThumbnail: false
          }
        }*/
      },
      { quoted: m }
    );
  } catch (e) {
    throw e.message
  }
};

handler.help = ["gpt", "chatgpt", "ai"].map(a => a + " [question]");
handler.tags = ["ai"];
handler.command = ["gpt", "ai", "chatgpt"];

module.exports = handler;
