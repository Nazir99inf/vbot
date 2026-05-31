const util = require("util");
const { exec } = require("child_process");

module.exports = {
  before: async (m, { conn, usedPrefix, isBotAdmin, command, isAdmin, isOwner, groupAdmin }) => {
    if (m.text.startsWith("=>")) {
      if (!isOwner) return;
      m.reply("Processing...");
      try {
        const result = await eval(`(async () => { return ${m.text.slice(3)} })()`);
        await m.reply(util.inspect(result, { showHidden: false, depth: null, colors: false }));
      } catch (e) {
        await m.reply(util.format(e?.stack || e?.message || e));
      }
    } else if (m.text.startsWith(">")) {
      if (!isOwner) return;
      m.reply("Processing...");
      try {
        const result = await eval(`(async() => { ${m.text.slice(2)} })()`);
        await m.reply(util.inspect(result, { showHidden: false, depth: null, colors: false }));
      } catch (e) {
        await m.reply(util.format(e?.stack || e?.message || e));
      }
    } else if (m.text.startsWith("$")) {
      if (!isOwner) return;
      let { key } = await conn.sendMessage(
        m.chat,
        { text: "executed..." },
        { quoted: m }
      );
      exec(m.text.slice(2), async (err, stdout, stderr) => {
        if (err) {
          return await conn.sendMessage(m.chat, {
            text: util.format(err?.stack || err?.message || err),
            edit: key
          });
        }
        if (stderr && !stdout) {
          return await conn.sendMessage(m.chat, {
            text: util.format(stderr),
            edit: key
          });
        }
        if (stdout) {
          return await conn.sendMessage(m.chat, {
            text: stdout,
            edit: key
          });
        }
      });
    } else return;
  }
};