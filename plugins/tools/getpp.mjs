export default {
  help: ["getpp"].map((a) => a + " *[get pp user]*"),
  tags: ["tools"],
  command: ["getpp"],
  code: async (m, { conn, usedPrefix, command, text, isOwner, isAdmin, isBotAdmin, isPrems, chatUpdate }) => {
    let q = m.quoted ? m.quoted : m;
    conn.sendMessage(
      m.chat,
      {
        image: {
          url: await conn.profilePictureUrl(q.sender, "image").catch((e) => icon)
        },
        caption: `• Get Profile : *[ @${q.sender.split("@")[0]} ]*`,
        mentions: [q.sender]
      },
      {
        quoted: m
      }
    );
  }
};
