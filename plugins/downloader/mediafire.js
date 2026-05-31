const { fetch } = require("undici");
const cheerio = require("cheerio");

async function mfdl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Gagal fetch halaman Mediafire");

  const html = await response.text();
  const $ = cheerio.load(html);

  const raw = $("div.dl-info");

  // Nama file
  const filename =
    $(".dl-btn-label").attr("title") ||
    raw.find("div.intro div.filename").text().trim() ||
    "file.unknown";

  const ext = filename.includes(".") ? filename.split(".").pop() : "";
  const mimetype = ext.toLowerCase();

  const filesize = raw.find("ul.details li:nth-child(1) span").text().trim();
  const uploaded = raw.find("ul.details li:nth-child(2) span").text().trim();
  const dl =
    $("a#downloadButton").attr("data-scrambled-url") ||
    $("a#downloadButton").attr("href");

  if (!dl) throw new Error("Direct download URL tidak ditemukan");
  const downloadUrl = dl.startsWith("http")
    ? dl
    : Buffer.from(dl, "base64").toString("utf-8");

  return {
    metadata: {
      filename,
      filesize,
      mimetype,
      ext,
      uploaded,
    },
    download: downloadUrl,
  };
}
let handler = async (m, { conn, text, usedPrefix, args, command }) => {
  if (!text) throw `*• Example :* ${usedPrefix + command} *[url mediaFire]*`;
  if (!text.includes("mediafire.com")) throw "*[ ! ]* input url mediafire";
  m.reply(wait);
  try {
    let data = await mfdl(text)
    let cap = `*乂 MEDIAFIRE  - DOWNLOADER*
${Object.entries(data.metadata)
  .map(([a, b]) => ` ◦ ${a} : ${b} `)
  .join("\n")}
`;
  const file = await fetch(data.download);
    await conn.sendMessage(
      m.chat,
      {
        document: Buffer.from(await file.arrayBuffer()),
        mimetype: data.metadata.mimetype,
        fileName: data.metadata.filename,
        caption: cap
      },
      {
        quoted: m
      }
    );
  } catch (e) {
    throw e;
  }
};
handler.help = ["mediafire", "mf", "mfdl"].map((a) => a + " [url mediaFire]");
handler.tags = ["downloader"];
handler.command = ["mediafire", "mf", "mfdl"];

module.exports = handler;
