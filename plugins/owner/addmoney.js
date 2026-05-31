let handler = async (m, { conn, text }) => {
  if (!text) throw "*• Example :* . addmoney *[@user amount]*";
  let who;
  if (m.isGroup) who = m.mentionedJid[0];
  else who = m.chat;
  if (!who) throw "*• Example :* . addmoney *[@user amount]*";
  let txt = text.replace("@" + who.split`@`[0], "").trim();
  if (isNaN(txt)) throw "*• Example :* . addmoney *[@user amount]*";
  let poin = parseInt(txt);
  let money = poin;
  let users = global.db.data.users;
  if (users[m.sender].owner == true) {
    if (money < 1000) throw "Max 1000";
    if (money > 1000) {
      users[who].money += poin;

      conn.reply(m.chat, `Congratulations @${who.split`@`[0]}. You get +${points} Money!`, m, {
        contextInfo: {
          mentionedJid: [who]
        }
      });
    }
  } else {
    if (money > 10000) return m.reply(`Maks 10000`);
    if (money < 1000) return m.reply("Minimal 1000");
    if (money < 10001) {
      users[who].money += poin;
      conn.reply(m.chat, `Selamat @${who.split`@`[0]}. Kamu mendapatkan +${poin} Money!`, m, {
        contextInfo: {
          mentionedJid: [who]
        }
      });
    }
  }
};

handler.help = ["addmoney *[@user, amount]*"];
handler.tags = ["owner"];
handler.command = ["addmoney"];
handler.rowner = true;

module.exports = handler;
