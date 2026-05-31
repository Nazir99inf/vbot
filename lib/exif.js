const fs = require("node:fs");
const path = require("node:path");
const { tmpdir } = require("node:os");
const { spawn } = require("node:child_process");
const Crypto = require("node:crypto");
const webp = require("node-webpmux");

const tmp = e => path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0,6).toString(36)}.${e}`);

const ffmpeg = a => new Promise((r,j)=>{
  const p = spawn("ffmpeg", a);
  p.on("error", j);
  p.on("close", c => c === 0 ? r() : j(c));
});

const toWebp = async (media, ext, args) => {
  const i = tmp(ext), o = tmp("webp");
  fs.writeFileSync(i, media);
  await ffmpeg(["-y","-i",i,...args,o]);
  const b = fs.readFileSync(o);
  fs.unlinkSync(i); fs.unlinkSync(o);
  return b;
};

const imageToWebp = m => toWebp(m,"jpg",[
  "-vcodec","libwebp",
  "-vf","scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0"
]);

const videoToWebp = m => toWebp(m,"mp4",[
  "-vcodec","libwebp",
  "-vf","scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0",
  "-loop","0","-ss","00:00:00","-t","00:00:06",
  "-preset","default","-an","-vsync","0"
]);

const writeExif = async (buf, meta, id) => {
  const i = tmp("webp"), o = tmp("webp");
  fs.writeFileSync(i, buf);
  if (!meta.packname && !meta.author) return i;
  const img = new webp.Image();
  const j = Buffer.from(JSON.stringify({
    "sticker-pack-id": id,
    "sticker-pack-name": meta.packname,
    "sticker-pack-publisher": meta.author,
    "emojis": meta.categories || [""]
  }));
  const h = Buffer.from([0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00,0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,0x00,0x00]);
  const ex = Buffer.concat([h,j]);
  ex.writeUIntLE(j.length,14,4);
  await img.load(i);
  fs.unlinkSync(i);
  img.exif = ex;
  await img.save(o);
  return o;
};

const writeExifImg = (m,d) => imageToWebp(m).then(b => writeExif(b,d,"https://github.com/nazir99inf"));
const writeExifVid = (m,d) => videoToWebp(m).then(b => writeExif(b,d,"https://github.com/nazir99inf"));

module.exports = { imageToWebp, videoToWebp, writeExifImg, writeExifVid };