import axios from "axios";
import spotify from '../../scraper/spotify.js'
const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text) throw `* *Example :* ${usedPrefix + command} *[Songname/spotifyUrl]*`;
  if (/open\.spotify\.com/.test(args[0])) {
    let metadata = await spotify.download(args[0])
    const caption = `*乂 S P O T I F Y - M U S I C*
◦   Title : ${metadata.title || ""}
◦   Artist : ${metadata.artis || ""}
◦   Duration : ${Math.floor(metadata.durasi / 60000)}:${String(Math.floor((metadata.durasi % 60000) / 1000)).padStart(2, "0")}
`;
    const reply = await conn.sendMessage(
      m.chat,
      {
        text: caption,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 99999,
          externalAdReply: {
            title: metadata.title,
            body: metadata.artis,
            mediaType: 1,
            thumbnailUrl: metadata.image,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    );
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: metadata.download },
        mimetype: "audio/mpeg",
        contextInfo: {
          isForwarded: true,
          forwardingScore: 99999
        }
      },
      { quoted: reply }
    );
  } else {
    const search = await spotify.search(text)
    const first = search[0];
    const cap = `*乂 S P O T I F Y - S E A R C H*
*Example Download*
.spotify ${first.link}
*or*
reply number 0 - ${search.length}

*[+]* Total: ${search.length}
${search
  .map(
    (a, i) =>
      `_*Number*_ *[ ${i + 1} ]*
- Title : ${a.title}
- Artist: ${a.artists}
- Popularity: ${a.popularity}
- Url: ${a.link}`
  )
  .join("\n\n")}`;
    await conn.sendAliasMessage(
      m.chat,
      {
        text: cap,
        contextInfo: {
          isForwarded: true,
          forwardingScore: 99999,
          externalAdReply: {
            title: first.title,
            body: first.artists,
            mediaType: 1,
            thumbnailUrl: first.image,
            renderLargerThumbnail: true,
            sourceUrl: first.link
          }
        }
      },
      search.map((a, i) => ({
        alias: `${i + 1}`,
        response: `${usedPrefix + command} ${a.link}`
      })),
      m
    );
  }
};

handler.help = ["spotify", "sp"].map((v) => v + " [q/url]");
handler.tags = ["downloader", "internet"];
handler.command = ["spotify", "sp"];
handler.limit = 3;

export default handler;
