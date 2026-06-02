import spotify from "../../scraper/spotify.js";

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text)
    throw `Example:\n${usedPrefix + command} faded\n${usedPrefix + command} https://open.spotify.com/track/...`;

  if (/open\.spotify\.com\/track/i.test(text)) {
    const data = await spotify.download(text);

    if (!data?.download)
      throw "Gagal mendapatkan audio.";

    const caption = `*乂 S P O T I F Y - M U S I C*

◦ Title : ${data.name}
◦ Artist : ${
      Array.isArray(data.artist)
        ? data.artist.map(v => v.name).join(", ")
        : "-"
    }
◦ Duration : ${Math.floor(data.duration_ms / 60000)}:${String(
      Math.floor((data.duration_ms % 60000) / 1000)
    ).padStart(2, "0")}
`;

    await conn.sendMessage(
      m.chat,
      {
        image: {
          url: data.album?.images?.[0]?.url
        },
        caption
      },
      { quoted: m }
    );

    await conn.sendMessage(
      m.chat,
      {
        audio: {
          url: data.download
        },
        mimetype: "audio/mpeg",
        fileName: `${data.name}.mp3`
      },
      { quoted: m }
    );

    return;
  }

  const result = await spotify.search(text);

  const tracks = result.tracks || [];

  if (!tracks.length)
    throw "Lagu tidak ditemukan.";

  const first = tracks[0];

  let caption = `*乂 S P O T I F Y - S E A R C H*

Reply angka untuk download.

`;

  caption += tracks
    .slice(0, 10)
    .map(
      (v, i) => `*${i + 1}.* ${v.name}
Artist: ${v.artists.map(a => a.name).join(", ")}
Link: ${v.url}`
    )
    .join("\n\n");

  await conn.sendAliasMessage(
    m.chat,
    {
      text: caption
    },
    tracks.map((v, i) => ({
      alias: String(i + 1),
      response: `${usedPrefix + command} ${v.url}`
    })),
    m
  );
};

handler.help = ["spotify", "sp"];
handler.tags = ["downloader"];
handler.command = ["spotify", "sp"];

export default handler;