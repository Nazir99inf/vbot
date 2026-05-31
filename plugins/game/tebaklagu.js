let timeout = 120000

let handler = async (m, { conn, command, usedPrefix }) => {
  conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {}
  let id = m.chat
  if (id in conn.tebaklagu) {
    conn.reply(m.chat, "You already have a question to answer!", conn.tebaklagu[id][0])
  }
  let res = await fetch(`https://raw.githubusercontent.com/qisyana/scrape/main/tebaklagu.json`)
  let src = await res.json()
  let Apps = src[Math.floor(Math.random() * src.length)]
  let json = Apps
  let caption = `*[ TEBAK LAGU ]*
*• Timeout :* 60 seconds
*• Artist :* ${json.artis}
*• Clue :* ${json.judul.replace(/[AIUEOKBaiueokb]/g, "?")}

Reply to this message to answer the question.
Type *\`nyerah\`* to surrender.`.trim()
  let q = await conn.reply(m.chat, caption, m)
  conn.tebaklagu[id] = [
    await conn.sendMessage(m.chat, { audio: { url: json.lagu }, mimetype: "audio/mpeg" }, { quoted: m }),
    json,
    setTimeout(() => {
      if (conn.tebaklagu[id])
        conn.sendMessage(
          id,
          {
            text: `⏰ *Game Over!*
You lose because of *Timeout*.

🎵 The correct answer was: *${json.judul}*`
          },
          { quoted: m }
        )
      delete conn.tebaklagu[id]
    }, timeout)
  ]
}

handler.before = async (m, { conn }) => {
  conn.tebaklagu = conn.tebaklagu ? conn.tebaklagu : {}
  let id = m.chat
  if (!m.text) return
  if (m.isCommand) return
  if (!conn.tebaklagu[id]) return
  let json = await conn.tebaklagu[id][1]
  let reward = db.data.users[m.sender]

  if (m.text.toLowerCase() === "nyerah" || m.text.toLowerCase() === "surrender") {
    clearTimeout(await conn.tebaklagu[id][2])
    conn.sendMessage(
      m.chat,
      {
        text: `💀 *Game Over!*
You surrendered.

🎵 The correct answer was: *${json.judul}*`
      },
      { quoted: await conn.tebaklagu[id][0] }
    )
    delete conn.tebaklagu[id]
  } else if (m.text.toLowerCase() === json.judul.toLowerCase()) {
    let randomLimit = Math.floor(Math.pow(Math.random(), 2) * 5) + 1
    let rewardMoney = 10000

    reward.money += rewardMoney
    reward.limit += randomLimit
    clearTimeout(await conn.tebaklagu[id][2])
    await conn.sendMessage(
      m.chat,
      {
        text: `🎉 *Congratulations!*
You guessed it right!

*💰 Money:* +${rewardMoney.toLocaleString()}
*⚡ Limit:* +${randomLimit}

(Penghasilan Answer Kemungkinan Dapat Besar Lebih Rendah~ 🍀)`
      },
      { quoted: await conn.tebaklagu[id][0] }
    )
    delete conn.tebaklagu[id]
  } else {
    conn.sendMessage(m.chat, {
      react: {
        text: "❌",
        key: m.key
      }
    })
  }
}

handler.help = ["tebaklagu"]
handler.tags = ["game"]
handler.command = ["tebaklagu"]
handler.group = true

module.exports = handler