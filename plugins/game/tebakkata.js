const axios = require("axios");
let timeout = 120000;

let handler = async (m, { conn, command, usedPrefix }) => {
  conn.tebakkata = conn.tebakkata || {};
  let id = m.chat;
  if (id in conn.tebakkata) {
    conn.reply(m.chat, "You already have an active Tebak Kata question!", conn.tebakkata[id][0]);
    return;
  }
  const res = await axios.get("https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakkata.json");
  const list = res.data;
  const random = list[Math.floor(Math.random() * list.length)];
  let json = {
    soal: random.soal,
    jawaban: random.jawaban
  };
  let clue = json.jawaban.replace(/[AIUEOaiueo]/g, "_");
  let caption = `*[ TEBAK KATA ]*
*• Timeout:* 60 seconds
*• Question:* ${json.soal}
*• Clue:* ${clue}

Reply this message to answer.
Type *nyerah* to surrender.`.trim();
  conn.tebakkata[id] = [
    await conn.reply(m.chat, caption, m),
    json,
    setTimeout(() => {
      if (conn.tebakkata[id]) {
        conn.sendMessage(
          id,
          {
            text: `*Game Over!* ⏰
You lose by *[ Timeout ]*.

• Correct Answer : *${json.jawaban}*`
          },
          { quoted: m }
        );
        delete conn.tebakkata[id];
      }
    }, timeout)
  ];
};

handler.before = async (m, { conn }) => {
  conn.tebakkata = conn.tebakkata || {};
  let id = m.chat;
  if (!m.text || m.isCommand || !conn.tebakkata[id]) return;
  let json = conn.tebakkata[id][1];
  let reward = db.data.users[m.sender];
  if (m.text.toLowerCase() === "nyerah" || m.text.toLowerCase() === "surrender") {
    clearTimeout(conn.tebakkata[id][2]);
    await conn.sendMessage(
      m.chat,
      {
        text: `*Game Over!* 😢
You gave up.

• Correct Answer : *${json.jawaban}*`
      },
      { quoted: conn.tebakkata[id][0] }
    );
    delete conn.tebakkata[id];
  } else if (m.text.toLowerCase() === json.jawaban.toLowerCase()) {
    let bonusLimit = Math.floor(Math.random() * 10) + 1;
    let bonusMoney = bonusLimit * 1000;
    reward.money += bonusMoney;
    reward.limit += bonusLimit;
    clearTimeout(conn.tebakkata[id][2]);
    await conn.sendMessage(
      m.chat,
      {
        text: `🎉 *Correct Answer!*
You earned:

• *Money:* +${bonusMoney.toLocaleString()}
• *Limit:* +${bonusLimit}`
      },
      { quoted: conn.tebakkata[id][0] }
    );
    delete conn.tebakkata[id];
    await conn.appendTextMessage(m, `.tebakkata`, m.chatUpdate);
  } else {
    m.react("❌")
  }
};

handler.help = ["tebakkata"];
handler.tags = ["game"];
handler.command = ["tebakkata"];
handler.group = true;

module.exports = handler;
