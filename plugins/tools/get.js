const { fetch } = require("undici");
const fileType = require("file-type");

function isUrl(string) {
  let urlRegex = /(https?:\/\/[^\s]+)/g;
  let result = string.match(urlRegex);
  return result;
}

module.exports = {
  help: ["get"].map(a => a + " *[url]*"),
  tags: ["downloader"],
  command: ["get"],
  code: async (m, { conn, usedPrefix, command, text }) => {
    if (!text) throw `*• Example :*\n⟩ ${usedPrefix + command} https://api.nazirganz.space`;
    m.react("⌛");
    const urls = isUrl(text);
    if (!urls || urls.length === 0) throw "Your Url Input Is Not Failed";
    for (const url of urls) {
      let data;
      try {
        data = await fetch(url);
      } catch (e) {
        m.reply(`Failed To Getting In Url ${url}\n*Error Log*\n⟩ *${e.message}`);
        continue;
      }

      const contentTypeHeader = data.headers.get("content-type");
      let mime = contentTypeHeader ? contentTypeHeader.split(";")[0].trim() : "application/octet-stream";

      const cap = `乂 *F E T C H  -  U R L*
    ◦  Request : ${url}
    ◦  Mimetype : ${mime}`;

      if (/\json/gi.test(mime)) {
        try {
          const body = await data.json();
          m.reply(JSON.stringify(body, null, 2));
        } catch (e) {
          m.reply(`⚠️ Gagal mem-parse JSON dari URL: ${url}`);
        }
      } else if (/\html/gi.test(mime)) {
        try {
          const body = await data.text();
          await conn.sendMessage(
            m.chat,
            {
              document: Buffer.from(body),
              caption: cap,
              fileName: "result.html",
              mimetype: "text/html"
            },
            { quoted: m }
          );
        } catch (e) {
          m.reply(`⚠️ Gagal mengambil teks HTML dari URL: ${url}`);
        }
      } else {
        try {
          const arrayBuffer = await data.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          const fileTypeResult = await fileType.fromBuffer(buffer);

          let finalMime = fileTypeResult ? fileTypeResult.mime : mime;
          let extension = fileTypeResult ? fileTypeResult.ext : "bin";

          if (/audio/gi.test(mime) && finalMime === "application/octet-stream") {
            finalMime = "audio/mpeg";
            extension = "mp3";
          }

          conn.sendFile(m.chat, buffer, `result.${extension}`, cap, m, {
            mimetype: finalMime,
            ...(finalMime.startsWith("audio/") && { ptt: false })
          });
        } catch (e) {
          try {
            const body = await data.text();
            await conn.sendCopy(m.chat, [[`COPY RESULT`, body]], m, {
              body: `${cap}\n\n${body}`
            });
          } catch (error) {
            m.reply(`⚠️ Gagal memproses konten dari URL: ${url}\nError: ${error.message}`);
          }
        }
      }
    }
  }
};
