const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `*- Example :* ${usedPrefix + command} *[on/off]*`;
  const input = text.trim().toLowerCase();
  if (!["on", "off"].includes(input)) throw "Invalid input. Please choose: on / off";
  const chat = db.data.chats[m.chat] || (db.data.chats[m.chat] = {});
  const isOn = input === "on";
  if (isOn === !!chat.antiTagsw) throw `The feature is already ${isOn ? "enabled" : "disabled"}.`;
  chat.antiTagsw = isOn;
  const caption = [`*SYSTEM NOTICE: ANTI-TAG STATUS ${isOn ? "ENABLED" : "DISABLED"}*`, ``, isOn ? `@${m.sender.split("@")[0]} has activated the *antiTagsw* system.\nTagging group statuses is now restricted in this chat.` : `@${m.sender.split("@")[0]} has deactivated the *antiTagsw* system.\nMembers can now tag group statuses again.`].join("\n");

  await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] });
};

handler.before = async (m, { conn, isAdmin }) => {
  const chat = db.data.chats[m.chat];
  if (!chat?.antiTagsw) return;

  const isTagStatus = m.mtype === "groupStatusMentionMessage" || (m.quoted && m.quoted.mtype === "groupStatusMentionMessage") || (m.message && m.message.groupStatusMentionMessage) || m.message?.protocolMessage?.type === 25;

  if (!isTagStatus || isAdmin) return;

  const user = (db.data.users[m.sender] ||= { warn: 0 });
  user.warn++;

  try {
    await conn.sendMessage(m.chat, { delete: m.key });
  } catch {}

  const caption = [`*[ TAG STATUS DETECTED ]*`, `*@${m.sender.split("@")[0]}* tagged the group status (status mention).`, `The message has been deleted and you received *1 warning*.`, ``, `Warnings: ${user.warn}`].join("\n");

  await conn.sendMessage(m.chat, { text: caption, mentions: [m.sender] });
};

handler.help = ["antitagsw"].map(a => a + " [on/off]");
handler.tags = ["group"];
handler.command = ["antitagsw", "antitagstatus", "antistatusmention"];

handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;
