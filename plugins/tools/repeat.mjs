export default {
  help: ["repeat"].map((a) => a + " [input]"),
  command: ["repeat"],
  tags: ["tools"],
  code: async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `* *Example :* ${usedPrefix + command} *[Input Text]*`;
    await m.reply(`${text}\n`.repeat(1000));
  }
};
