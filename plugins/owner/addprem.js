let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*• Example :* ${usedPrefix + command} 62xxxxx,30`;
  let [Target, duration] = text.split(",");
  if (!Target) return;
  let number = await no(Target);
  const user = db.data.users[number + "@s.whatsapp.net"];
  if (duration) {
    let milidetikDalamHari = 24 * 60 * 60 * 1000;
    let angka = duration;
    let hasil = angka * milidetikDalamHari;
    let { key } = await conn.sendMessage(m.chat, { text: "*[ VERIFYING USER DATA... ]*" }, { quoted: m });
    if (!user.registered) return conn.sendMessage(m.chat, { text: "*[ USER NOT REGISTERED... ]*", edit: key }, { quoted: m });
    if (user.banned) return conn.sendMessage(m.chat, { text: "*[ USER HAS BEEN BANNED... ]*", edit: key }, { quoted: m });
    user.premium = true;
    user.premiumDate = hasil;
    await conn.sendMessage(
      m.chat,
      {
        text: `*[ ✅ VERIFICATION SUCCESS ]*
*• Username:* ${user.name}
*• Age:* ${user.age}
*• Premium:* ${user.premium ? "✅" : "❎"}
*• Expired:* ${duration} *Day* *[${Func.toDate(user.premiumDate)}]*`,
        edit: key
      },
      { quoted: m }
    );
    await conn.sendMessage(
      number + "@s.whatsapp.net",
      {
        text: `*[ THANK YOU FOR YOUR ORDER ]*
*• Username:* ${user.name}
*• Age:* ${user.age}
*• Premium:* ${user.premium ? "✅" : "❎"}
*• Expired:* ${duration} *Day* *[${Func.toDate(user.premiumDate)}]*

*✅ Thank you for ordering premium on ${namebot}, enjoy exclusive features that can only be accessed by premium users with unlimited limits*`
      },
      { quoted: m }
    );
  } else {
    let { key } = await conn.sendMessage(m.chat, { text: "*[ VERIFYING USER DATA... ]*" }, { quoted: m });
    if (!user.registered) return conn.sendMessage(m.chat, { text: "*[ USER NOT REGISTERED... ]*", edit: key }, { quoted: m });
    if (user.banned) return conn.sendMessage(m.chat, { text: "*[ USER HAS BEEN BANNED... ]*", edit: key }, { quoted: m });
    user.premium = true;
    user.premiumDate = "PERMANENT";
    await conn.sendMessage(
      m.chat,
      {
        text: `*[ ✅ VERIFICATION SUCCESS ]*
*• Username:* ${user.name}
*• Age:* ${user.age}
*• Premium:* ${user.premium ? "✅" : "❎"}
*• Expired:* PERMANENT`,
        edit: key
      },
      { quoted: m }
    );
    await conn.sendMessage(
      number + "@s.whatsapp.net",
      {
        text: `*[ THANK YOU FOR YOUR ORDER ]*
*• Username:* ${user.name}
*• Age:* ${user.age}
*• Premium:* ${user.premium ? "✅" : "❎"}
*• Expired:* PERMANENT

*✅ Thank you for ordering premium on ${namebot}, enjoy exclusive features that can only be accessed by premium users with unlimited limits*`
      },
      { quoted: m }
    );
  }
};
handler.help = ["addprem"].map((a) => a + " [number,duration]");
handler.tags = ["owner"];
handler.command = ["addprem"];
handler.owner = true;

module.exports = handler;

function no(number) {
  return number.replace(/\s/g, "").replace(/([@+-])/g, "");
}
