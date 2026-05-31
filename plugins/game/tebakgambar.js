let timeout = 120000;
let handler = async (m, { conn }) => {
  conn.tebakgambar = conn.tebakgambar || {};
  let id = m.chat;
  if (id in conn.tebakgambar) return m.reply("You already have an active question!");
  let res = await fetch(`https://raw.githubusercontent.com/BochilTeam/database/master/games/tebakgambar.json`);
  let src = await res.json();
  let json = src[Math.floor(Math.random() * src.length)];

  let caption = `*[ TEBAK GAMBAR ]*
*• Timeout:* 60 seconds
*• Clue:* ${json.jawaban.replace(/[AIUEOaiueo]/g, "_")}

Type *nyerah* to surrender`.trim();
  let sentMsg = await conn.sendMessage(
    m.chat,
    {
      image: { url: json.img },
      caption
    },
    { quoted: m }
  );
  console.log(json);
  conn.tebakgambar[id] = {
    key: sentMsg.key,
    soal: json,
    timeout: setTimeout(async () => {
      if (conn.tebakgambar[id]) {
        await conn.sendMessage(
          m.chat,
          {
            text: `⏰ *Game Over!*  
You lose because of *Timeout!*

• Answer: *${json.jawaban}*`
          },
          { quoted: sentMsg }
        );
        await conn.sendMessage(m.chat, {
          delete: sentMsg.key
        });
        delete conn.tebakgambar[id];
      }
    }, timeout)
  };
};

handler.before = async (m, { conn }) => {
  conn.tebakgambar = conn.tebakgambar || {};
  let id = m.chat;
  if (!m.text || !conn.tebakgambar[id]) return;

  let { soal, key, timeout } = conn.tebakgambar[id];
  let reward = db.data.users[m.sender];
  let answer = m.text.toLowerCase();

  if (answer === "nyerah" || answer === "surrender") {
    clearTimeout(timeout);
    await conn.sendMessage(
      m.chat,
      {
        text: `😢 *You gave up!*  
• The correct answer was: *${soal.jawaban}*`
      },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, {
      delete: key
    });
    delete conn.tebakgambar[id];
  } else if (answer === soal.jawaban.toLowerCase()) {
    reward.money += 10000;
    reward.limit += 10;
    clearTimeout(timeout);
    await conn.sendMessage(m.chat,
      {
        text: `🎉 *Correct!*  
You got it right!

*+ Money:* 10,000  
*+ Limit:* 10`
      },
      { quoted: m }
    );
    await conn.sendMessage(m.chat, {
      delete: key
    });
    delete conn.tebakgambar[id];
  } else {
    conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
  }
};

handler.help = ["tebakgambar"];
handler.tags = ["game"];
handler.command = ["tebakgambar"];
handler.group = true;

module.exports = handler;
