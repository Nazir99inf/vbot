const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { exec } = require("child_process");
const { fromBuffer } = require("file-type");

const tmp = path.join(process.cwd(), "tmp");
const run = (c) =>
  new Promise((r, j) =>
    exec(c, { windowsHide: true }, (e, so, se) => (e ? j(e) : r({ so, se })))
  );

const q = (s) => `"${String(s).replaceAll(`"`, `\\"`)}"`;

const SCALE_UP = (mult = 1.5) =>
  `scale=trunc(iw*${mult}/2)*2:trunc(ih*${mult}/2)*2:flags=lanczos`;

const IMG_QUALITY_CHAIN = (mult = 1.5) =>
  [SCALE_UP(mult), "hqdn3d=1.2:1.2:6:6", "eq=saturation=1.15:contrast=1.06:brightness=0.01", "unsharp=3:3:0.8:3:3:0.0"].join(
    ","
  );

const IMG_RESTORE_CHAIN = (mult = 1.0) =>
  [SCALE_UP(mult), "hqdn3d=2:2:8:8", "deblock=alpha=1:beta=1", "eq=saturation=1.10:contrast=1.05:brightness=0.005", "unsharp=3:3:0.6:3:3:0.0"].join(
    ","
  );

async function prep(buffer, inExt, outExt) {
  await fs.mkdir(tmp, { recursive: true });
  const id = crypto.randomBytes(6).toString("hex");
  const i = path.join(tmp, `${id}.${inExt}`);
  const o = path.join(tmp, `${id}_o.${outExt}`);
  await fs.writeFile(i, buffer);
  return { i, o };
}

async function cleanup(...paths) {
  await Promise.all(paths.map((p) => fs.unlink(p).catch(() => {})));
}

async function hdvid(buffer, opts = {}) {
  const t = await fromBuffer(buffer);
  const inExt = t?.ext || "mp4";
  const {
    upscale = 1.0,
    crf = 19,
    preset = "slow",
    fps = null,
    denoise = "hqdn3d=1.5:1.5:6:6",
    sharpen = "unsharp=3:3:0.7:3:3:0.0",
    eq = "eq=saturation=1.10:contrast=1.05:brightness=0.005",
    audioBitrate = "160k",
  } = opts;

  const { i, o } = await prep(buffer, inExt, "mp4");
  const vf = [
    upscale && upscale !== 1.0 ? SCALE_UP(upscale) : null,
    denoise,
    eq,
    sharpen,
    fps ? `fps=${fps}` : null,
  ]
    .filter(Boolean)
    .join(",");

  try {
    await run(
      `ffmpeg -y -i ${q(i)} -vf ${q(vf)} -c:v libx264 -pix_fmt yuv420p -crf ${crf} -preset ${preset} -c:a aac -b:a ${audioBitrate} -movflags +faststart ${q(
        o
      )}`
    );
    return await fs.readFile(o);
  } finally {
    await cleanup(i, o);
  }
}

async function hd(buffer, opts = {}) {
  const { upscale = 1.5, quality = 3 } = opts;
  const t = await fromBuffer(buffer);
  const inExt = t?.ext || "jpg";
  const { i, o } = await prep(buffer, inExt, "jpg");
  const vf = IMG_QUALITY_CHAIN(upscale);

  try {
    await run(`ffmpeg -y -i "${i}" -vf "scale=iw*2:ih*2,hqdn3d=1.5:1.5:6:6,unsharp=5:5:1.3:5:5:0.0,eq=saturation=1.5:contrast=1.1:brightness=0.02,colorchannelmixer=aa=0.9" "${o}"`);
    return await fs.readFile(o);
  } finally {
    await cleanup(i, o);
  }
}

async function hdr(buffer, opts = {}) {
  const t = await fromBuffer(buffer);
  const inExt = t?.ext || "jpg";
  const { contrast = 1.15, saturation = 1.05, brightness = 0.005, quality = 3 } = opts;
  const { i, o } = await prep(buffer, inExt, "jpg");
  const vf = [`tonemap=reinhard:peak=1.0`, `eq=contrast=${contrast}:saturation=${saturation}:brightness=${brightness}`].join(",");

  try {
    await run(`ffmpeg -y -i ${q(i)} -vf ${q(vf)} -q:v ${quality} ${q(o)}`);
    return await fs.readFile(o);
  } finally {
    await cleanup(i, o);
  }
}

async function enhance(buffer, opts = {}) {
  const t = await fromBuffer(buffer);
  const inExt = t?.ext || "jpg";
  const { quality = 3 } = opts;
  const { i, o } = await prep(buffer, inExt, "jpg");
  const vf = ["hqdn3d=1.0:1.0:5:5", "eq=saturation=1.12:contrast=1.05:brightness=0.005", "unsharp=3:3:0.6:3:3:0.0"].join(",");

  try {
    await run(`ffmpeg -y -i ${q(i)} -vf ${q(vf)} -q:v ${quality} ${q(o)}`);
    return await fs.readFile(o);
  } finally {
    await cleanup(i, o);
  }
}

async function restore(buffer, opts = {}) {
  const t = await fromBuffer(buffer);
  const inExt = t?.ext || "jpg";
  const { upscale = 1.0, quality = 3 } = opts;
  const { i, o } = await prep(buffer, inExt, "jpg");
  const vf = IMG_RESTORE_CHAIN(upscale);

  try {
    await run(`ffmpeg -y -i ${q(i)} -vf ${q(vf)} -q:v ${quality} ${q(o)}`);
    return await fs.readFile(o);
  } finally {
    await cleanup(i, o);
  }
}

async function colorize(buffer, opts = {}) {
  const t = await fromBuffer(buffer);
  const inExt = t?.ext || "jpg";
  const { rs = 0.06, gs = 0.03, bs = -0.03, quality = 3 } = opts;
  const { i, o } = await prep(buffer, inExt, "jpg");
  const vf = `colorbalance=rs=${rs}:gs=${gs}:bs=${bs},eq=saturation=1.08:contrast=1.03:brightness=0.003`;

  try {
    await run(`ffmpeg -y -i ${q(i)} -vf ${q(vf)} -q:v ${quality} ${q(o)}`);
    return await fs.readFile(o);
  } finally {
    await cleanup(i, o);
  }
}

async function upscale(buffer, s = 2, opts = {}) {
  const t = await fromBuffer(buffer);
  const inExt = t?.ext || "jpg";
  const { quality = 3 } = opts;
  const { i, o } = await prep(buffer, inExt, "jpg");
  const vf = SCALE_UP(s);

  try {
    await run(`ffmpeg -y -i ${q(i)} -vf ${q(vf)} -q:v ${quality} ${q(o)}`);
    return await fs.readFile(o);
  } finally {
    await cleanup(i, o);
  }
}

module.exports = { hdvid, hd, hdr, enhance, restore, colorize, upscale };