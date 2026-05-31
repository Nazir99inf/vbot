const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `*- Example :* ${usedPrefix + command} *[on/off]*`;

  const input = text.trim().toLowerCase();
  if (!["on", "off"].includes(input)) throw "Invalid input. Please choose: on / off";

  const chat = db.data.chats[m.chat] || (db.data.chats[m.chat] = {});
  const isOn = input === "on";

  if (isOn === !!chat.antiSticker) throw `The feature is already ${isOn ? "enabled" : "disabled"}.`;

  chat.antiSticker = isOn;

  const caption = [`*SYSTEM NOTICE: ANTI-STICKER STATUS ${isOn ? "ENABLED" : "DISABLED"}*`, ``, isOn ? `@${m.sender.split("@")[0]} has activated the *antiSticker* system.\nSending stickers is now restricted for non-admin members.` : `@${m.sender.split("@")[0]} has deactivated the *antiSticker* system.\nMembers can now send stickers freely.`].join("\n");

  await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] });
};

handler.before = async (m, { conn, isAdmin }) => {
  const chat = db.data.chats[m.chat];
  if (!chat?.antiSticker) return;

  if (m.mtype === "stickerMessage" && !isAdmin) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key });
    } catch {}
  }
};

handler.help = ["antisticker"].map(a => a + " [on/off]");
handler.tags = ["group"];
handler.command = ["antisticker"];

handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;
