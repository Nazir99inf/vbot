const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `*- Example :* ${usedPrefix + command} *[on/off]*`;
  const input = text.trim().toLowerCase();
  if (!["on", "off"].includes(input)) throw "Invalid input. Please choose: on / off";
  const chat = db.data.chats[m.chat] || (db.data.chats[m.chat] = {});
  const isOn = input === "on";
  if (isOn === !!chat.antiToxic) throw `The feature is already ${isOn ? "enabled" : "disabled"}.`;

  chat.antiToxic = isOn;

  const caption = [`*SYSTEM NOTICE: ANTI-TOXIC STATUS ${isOn ? "ENABLED" : "DISABLED"}*`, ``, isOn ? `@${m.sender.split("@")[0]} has activated the *antiToxic* system.\nMessages containing toxic or offensive language will be automatically removed.` : `@${m.sender.split("@")[0]} has deactivated the *antiToxic* system.\nMembers can now chat freely (but nicely, please).`].join("\n");

  await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] });
};

handler.help = ["antitoxic"].map(a => a + " *[on/off]*");
handler.tags = ["group"];
handler.command = ["antitoxic"];

handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;
