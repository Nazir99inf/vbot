const startConverstation = require("../../scraper/ai-interface.js");

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*• Example:* ${usedPrefix + command} what your model?`;

  try {
    await m.react("⏳");

    let hasil = await startConverstation(
      text,
      "meta-llama/Llama-3.3-70B-Instruct:novita"
    );

    await m.react("✅");

    await conn.sendMessage(
      m.chat,
      {
        text: hasil?.choices?.[0]?.message?.content?.replaceAll("**", "*") || "No response"
      },
      { quoted: m }
    );

  } catch (e) {
    console.error(e);
    return m.reply(e.message || String(e));
  }
};

handler.help = ["meta", "metaai"].map(v => v + " [question]");
handler.tags = ["ai"];
handler.command = ["meta", "metaai"]

module.exports = handler;