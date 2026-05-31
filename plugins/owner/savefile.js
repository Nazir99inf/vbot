let fs = require("fs");
let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!text) throw `*• Example:* ${usedPrefix + command} *[reply code]*`;
  if (command === "sf") {
    if (!m.quoted) throw `*[ ! ] Reply Your Progress Code*`;
    let path = `plugins/${text}`;
    await fs.writeFileSync(path, m.quoted.text);
    await conn.sendMessage(m.chat, { text: `*[ SUCCES SAVING CODE ]*\n\n\`\`\`${m.quoted.text}\`\`\`` }, { quored: m });
  } else if (command === "df") {
    let path = `plugins/${text}`;
    let key = await conn.sendMessage(m.chat, { text: "*[ DELETE FILE... ]*" }, { quoted: m });
    if (!fs.existsSync(path)) return conn.sendMessage(m.chat, { text: `*[ FILE NOT FOUND ]*`, edit: key.key }, { quored: m });
    fs.unlinkSync(path);
    await conn.sendMessage(m.chat, { text: `*[ SUCCESS DELETE FILE ]*`, edit: key.key }, { quored: m });
  }
};
handler.help = ["sf", "df"].map((v) => v + " [reply code]");
handler.tags = ["owner"];
handler.command = /^(sf|df)$/i;
handler.owner = true;
module.exports = handler;
