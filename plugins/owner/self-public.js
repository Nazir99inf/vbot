let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (command === "self") {
    if (db.data.settings.self) throw "*[ ! ] self has been activated previously*";
    db.data.settings.self = true;
    m.reply("[ ✓ ] self activated successfully");
  } else if (command === "public") {
    if (!db.data.settings.self) throw "*[ ! ] public has been activated previously*";
    db.data.settings.self = false;
    m.reply("[ ✓ ] public activated successfully");
  }
};
handler.help = ["self", "public"].map((a) => a + " *[options]*");
handler.tags = ["owner"];
handler.command = ["self", "public"];
handler.owner = true;

module.exports = handler;
