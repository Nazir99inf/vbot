const moment = require("moment-timezone");

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) return m.reply(`*Example:* ${usedPrefix + command} meme -5`);
    let match = text.match(/-(\d+)$/);
    let limit = match ? Math.min(+match[1], 20) : 5;
    let query = text.replace(/-\d+$/, "").trim();

    const now = moment().tz("Asia/Jakarta").format("YYYY/MM/DD");
    const packname = m.name || "Sticker";
    const author = "\n" + now;
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
    const timestamp = Date.now();  
    const res = await fetch('https://api.sticker.ly/v4/stickerPack/smartSearch', {  
        method: 'POST',  
        headers: {  
            'User-Agent': 'androidapp.stickerly/3.25.2 (220333QAG; U; Android 30; ms-MY; id;)',  
            'Content-Type': 'application/json',  
            'Accept-Encoding': 'gzip',  
            'x-duid': Buffer.from(timestamp.toString()).toString('base64')  
        },  
        body: JSON.stringify({  
            keyword: query,  
            enabledKeywordSearch: true,  
            filter: {  
                extendSearchResult: true,  
                sortBy: 'RECOMMENDED',  
                languages: ['ALL'],  
                minStickerCount: limit,  
                searchBy: 'ALL',  
                stickerType: 'ALL'  
            }  
        })  
    });  
    if (!res.ok) return m.reply("🍂 Gagal mengambil data");

    const json = await res.json();
    const pack = json?.result?.stickerPacks?.find(p => p.resourceFiles?.length);
    if (!pack) return m.reply("🍂 Sticker tidak ditemukan");

    const stickers = pack.resourceFiles
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    for (let i = 0; i < stickers.length; i++) {
      try {
        const url = stickers[i].startsWith("http")
          ? stickers[i]
          : pack.resourceUrlPrefix + stickers[i];

        const img = await fetch(url);
        if (!img.ok) continue;

        const buffer = Buffer.from(await img.arrayBuffer());

        await conn.sendImageAsSticker(m.chat, buffer, m, {
          packname,
          author
        });

        if (i < stickers.length - 1)
          await new Promise(r => setTimeout(r, 600));
      } catch {}
    }

  } catch (e) {
    console.error(e);
    m.reply("error: " + e);
  } finally {
    await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
  }
};

handler.help = ["stickerly", "sly", "ssearch"].map(v => v + " <query> [-count]");
handler.tags = ["tools", "sticker"];
handler.command = ["stickerly", "sly", "ssearch"];
handler.limit = true;

module.exports = handler;