const ocr = require(process.cwd() + '/scraper/ocr')

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m;
  const mime = (q.msg || q).mimetype || q.mediaType || "";
  if (/^image/.test(mime)) {
    let media = await q.download();
    let url = await Uploader.tmpfiles(media);
    let ocr_res = await ocr(url);
    await m.reply(ocr_res)
  } else {
    m.reply("*[ ! ]* Media Yang Support Adalah Image")
  }
};
handler.help = ["ocr", "readimg"].map((a) => a + " [img]");
handler.tags = ["tools"];
handler.command = ["ocr", "readimg"];
module.exports = handler;