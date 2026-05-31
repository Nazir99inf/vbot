module.exports = {
  help: ["request", "req"].map((a) => a + " *[name features]*"),
  tags: ["info"],
  command: ["req", "request"],
  code: async (m, { conn, usedPrefix, command, text, isOwner, isAdmin, isBotAdmin, isPrems, chatUpdate }) => {
    conn.req = conn.req ? conn.req : {};
    if (!text) throw `*• Example :* ${usedPrefix + command} *[name features]*`;
    if (!conn.req[m.sender]) {
      conn.req[m.sender] = {
        total: 0
      };
    }
    if (conn.req[m.sender].total >= 1) return m.reply("You already sending request !");
    for (let i of owner) {
      conn.reply(
        [i + "@s.whatsapp.net", "6285822146627@s.whatsapp.net"],
        `*[ REQUEST FEATURES ]*
*• Name :* ${m.name} *[ @${m.sender.split("@")[0]} ]*
*• Message :*
${text}`,
        null
      );
    }
    conn.reply(m.chat, "Success sending request to Owner bot", null);
    conn.req[m.sender].total += 1;
    setTimeout(() => {
      delete conn.req[m.sender];
    }, 5 * 10000);
  }
};
