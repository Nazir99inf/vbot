const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `*- Example :* ${usedPrefix + command} *[on/off]*`;

  const input = text.trim().toLowerCase();
  if (!["on", "off"].includes(input)) throw "Invalid input. Please choose: on / off";

  const chat = db.data.chats[m.chat] || (db.data.chats[m.chat] = {});
  const isOn = input === "on";

  if (isOn === !!chat.antiVideo) throw `The feature is already ${isOn ? "enabled" : "disabled"}.`;

  chat.antiVideo = isOn;

  const caption = [`*SYSTEM NOTICE: ANTI-VIDEO STATUS ${isOn ? "ENABLED" : "DISABLED"}*`, ``, isOn ? `@${m.sender.split("@")[0]} has activated the *antiVideo* system.\nAll members are now restricted from sending videos in this group.` : `@${m.sender.split("@")[0]} has deactivated the *antiVideo* system.\nMembers can now send videos freely.`].join("\n");

  await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] });
};

handler.help = ["antivideo"].map(a => a + " [on/off]");
handler.tags = ["group"];
handler.command = ["antivideo"];

handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;
