const handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `*- Example :* ${usedPrefix + command} *[on/off]*`;

  const input = text.trim().toLowerCase();
  if (!["on", "off"].includes(input)) throw "Invalid input. Please choose: on / off";

  const chat = db.data.chats[m.chat] || (db.data.chats[m.chat] = {});
  const isOn = input === "on";

  if (isOn === !!chat.antiLink) throw `The feature is already ${isOn ? "enabled" : "disabled"}.`;

  chat.antiLink = isOn;

  const caption = [`*SYSTEM NOTICE: ANTI-LINK STATUS ${isOn ? "ENABLED" : "DISABLED"}*`, ``, isOn ? `@${m.sender.split("@")[0]} has activated the *antiLink* system.\nAny WhatsApp link sent will be automatically removed.` : `@${m.sender.split("@")[0]} has deactivated the *antiLink* system.\nMembers may now share WhatsApp links freely.`].join("\n");
  await conn.sendMessage(m.chat, { text: caption });
};

handler.before = async (m, { conn, isAdmin }) => {
  const chat = db.data.chats[m.chat];
  if (!chat?.antiLink) return;

  const body = m.text || "";
  const linkDetected = /chat\.whatsapp\.com\/|wa\.me\/|whatsapp\.com\/channel\//i.test(body);

  if (linkDetected && !isAdmin) {
    try {
      await conn.sendMessage(m.chat, { delete: m.key });
    } catch {}
  }
};

handler.help = ["antilink"].map(a => a + " [on/off]");
handler.tags = ["group"];
handler.command = ["antilink"];

handler.group = true;
handler.admin = true;
handler.botAdmin = true;

module.exports = handler;
