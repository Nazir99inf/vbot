let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";
  if (!mime.includes("im")) throw `Please [reply or send media image with command ${usedPrefix + command} ]`;
  let media = await q.download();
  try {
    m.reply("Memproses Gambar Dan Mengubah Menjadi Figure.\nini akan memakan waktu hingga 10detik hingga 2menit");
    let hasil = await Api("ai/tofigure", { url: await Uploader.tmpfiles(await q.download()) });
    let caption = `*[ F I G U R E - G E N E R A T O R ]*\na cinematic converting image to figure miniatur 3d models.\n© Gemini - Nano Banana🍌`;
    await conn.sendMessage(m.chat, { image: { url: hasil.result }, caption });
  } catch (e) {}
};

handler.help = ["figure", "tofigure"].map((a) => a + " [image]");
handler.tags = ["ai"];
handler.command = ["tofigure", "figure"];

module.exports = handler;
