async function removeBg(buffer, mime) {
  const formData = new FormData();
  const blob = new Blob([buffer], { type: mime });
  formData.append("size", "auto");
  formData.append("image_file", blob, "image.png");
  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": "Nbq8ejM5LixoPhAghZGcFzXD"
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";

  if (!mime.startsWith("image/"))
    throw `*• Example :* ${usedPrefix + command} *[reply/send image]*`;

  m.reply(wait);

  let media = await q.download();
  let hasil = await removeBg(media, mime);

  await conn.sendMessage(
    m.chat,
    {
      image: hasil,
      caption: `Here @${m.sender.split("@")[0]} !!`,
      mentions: [m.sender],
    },
    { quoted: m }
  );
};
handler.help = ["removebg", "nobg"].map((a) => a + " [reply/send]");
handler.tags = ["tools"];
handler.command = ["removebg", "nobg"];
handler.limit = true;

module.exports = handler;
