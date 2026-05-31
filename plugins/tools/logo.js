let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*• Example :* ${usedPrefix + command} Akiraa`;
  m.reply(
    `*• Result from :* ${text}`,
    `https://joshweb.click/canvas/avatarv2?id=${Math.floor(Math.random() * 200)}&bgtext=${text}&signature=by+AkiraaBot&color=black`,
  );
};
handler.help = ["logo"].map((a) => a + " *[name logo]*");
handler.tags = ["tools"];
handler.command = ["logo"];

module.exports = handler;