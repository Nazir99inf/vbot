const Pin = require(process.cwd() + '/scraper/pin.js')
let handler = async (m, {conn, usedPrefix, text, args, command}) => {
  if (!text) return m.reply(`*• Example :* ${usedPrefix + command} *[query/url]*`)
  const pintrest = new Pin()
  let keys
  if (!Func.isUrl(args[0])) {
    const data = await pintrest.search(text)
    let array = []
    for (let i = 0; i < data.length; i++) {
      const res = data[i]
      const image = res.image
      array.push([
        `*乂 P I N T E R E S T*\n${Object.entries(res)
          .map(
            ([k, v]) =>
              `   ◦ ${k
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")} : ${v}`
          )
          .join("\n")}`,
        "© Pinterest search",
        image,
        []
      ])
    }
    keys = await conn.sendCarousel(m.chat, array, m, {
      body: `*乂 P I N T E R E S T - S E A R C H*

      ◦  Total photos : ${data.length}
      ◦  Total request ${array.length}\n`
    })
  } else {
    const dl = await pintrest.dl(args[0])
    let cap = `*乂 P I N T E R E S T - D O W N L O A D E R*\n\n${Object.entries(dl)
      .map(([a, b]) =>
          `   ◦ ${a
            .split("_")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ")} : ${b}`
      )
      .join("\n")}\n`;
    if (dl.type === "image") {
      keys = await conn.sendMessage(m.chat, {image: {url: dl.url}, caption: cap}, {quoted: m})
    } else if (dl.type === "video") {
      keys = await conn.sendMessage(m.chat, {video: {url: dl.url}, caption: cap}, {quoted: m})
    }
  }
  await conn.delete(keys.key)
}

handler.help = ["pinterest", "pin", "pindl", "pindown"].map((a) => a + " *[query/url]*")
handler.tags = ["tools", "internet"]
handler.command = ["pinterest", "pin", "pindl", "pindown"]

module.exports = handler
