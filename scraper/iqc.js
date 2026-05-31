/** @format */

const { createCanvas, loadImage, GlobalFonts } = require("@napi-rs/canvas")
const fs = require("fs")
const path = require("path")

GlobalFonts.registerFromPath(path.join(__dirname, "SanFransisco.ttf"), "SF")
GlobalFonts.registerFromPath(path.join(__dirname, "IOS.ttf"), "Apple Emoji")
const isEmoji = c => /\p{Extended_Pictographic}/u.test(c)

const drawBubble = (c, t, img, m, x, y, o = {}) => {
  const { size: s = 16, maxWidth: mw = 280, padding: p = 10, radius: r = 12, fillColor: fc = "#ECE5DD", textColor: tc = "#000", align: a = "left", time: tm = null } = o
  const mW = txt => {
    let w = 0
    for (const ch of [...txt]) {
      c.font = isEmoji(ch) ? `${s * 0.8}px Apple Emoji` : `${s}px SF`
      w += c.measureText(ch).width
    }
    return w
  }
  const ln = []
  for (const pr of t.split("\n")) {
    let l = ""
    for (const wd of pr.split(" ")) {
      const ts = l ? l + " " + wd : wd
      if (mW(ts) <= mw - p) l = ts
      else if (!l) {
        let pt = ""
        for (const ch of [...wd]) {
          if (mW(pt + ch) > mw - p) {
            if (pt) ln.push(pt)
            pt = ch
          } else pt += ch
        }
        if (pt) l = pt
      } else {
        ln.push(l)
        l = wd
      }
    }
    if (l) ln.push(l)
  }
  const lh = Math.round(s * 1.3)
  const bw = Math.ceil(Math.min(mw, Math.max(...ln.map(n => mW(n))) + p * 3))
  const bh = Math.ceil(ln.length * lh + p + (tm ? Math.round(s * 1) : 0))
  const ax = a === "right" ? c.canvas.width - x - bw : x
  c.fillStyle = fc
  c.beginPath()
  c.moveTo(ax + r, y)
  c.lineTo(ax + bw - r, y)
  c.arcTo(ax + bw, y, ax + bw, y + r, r)
  c.lineTo(ax + bw, y + bh - 10 - r)
  c.arcTo(ax + bw, y + bh - 10, ax + bw - r, y + bh - 10, r)
  c.lineTo(ax + r, y + bh - 10)
  c.arcTo(ax, y + bh - 10, ax, y + bh + 100 - r, r)
  c.lineTo(ax, y + r)
  c.arcTo(ax, y, ax + r, y, r)
  c.closePath()
  c.fill()
  c.fillStyle = tc
  ln.forEach((n, i) => {
    let cx = ax + p
    for (const ch of [...n]) {
      const isEmo = isEmoji(ch)
      c.font = isEmo ? `${s * 0.8}px Apple Emoji` : `${s}px SF`
      let w = c.measureText(ch).width
      c.fillText(ch, cx, y + p + 10 + i * lh)
      cx += w
    }
  })
  if (tm) {
    c.font = `${Math.round(s * 0.7)}px "SF"`
    c.fillText(tm, ax + bw - p - c.measureText(tm).width, y + bh - p - 5)
  }
  c.drawImage(img, x, y - 60, 278, 57)
  c.drawImage(m, x, y + bh, 281, 311)
}
function blurCanvas(ctx, width, height, radius = 10) {
  ctx.filter = `blur(${radius}px)`
  ctx.drawImage(ctx.canvas, 0, 0, width, height)
  ctx.globalAlpha = 0.45
  ctx.fillStyle = "#373737"
  ctx.fillRect(0, 0, width, height)
  ctx.globalAlpha = 1
  ctx.filter = "none"
}
function dbt(c, x, y, s, r, p, rt = 2) {
  p = Math.max(0, Math.min(p, 100))
  const w = s,
    h = s / rt,
    fw = w * (p / 100)
  r = Math.min(r, w / 2, h / 2)
  c.beginPath()
  c.fillStyle = "#888"
  c.moveTo(x + r, y)
  c.lineTo(x + w - r, y)
  c.quadraticCurveTo(x + w, y, x + w, y + r)
  c.lineTo(x + w, y + h - r)
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  c.lineTo(x + r, y + h)
  c.quadraticCurveTo(x, y + h, x, y + h - r)
  c.lineTo(x, y + r)
  c.quadraticCurveTo(x, y, x + r, y)
  c.closePath()
  c.fill()
  if (p > 0) {
    c.beginPath()
    c.fillStyle = "#fff"
    c.moveTo(x + r, y)
    if (p < 100) {
      c.lineTo(x + fw, y)
      c.lineTo(x + fw, y + h)
      c.lineTo(x + r, y + h)
      c.quadraticCurveTo(x, y + h, x, y + h - r)
      c.lineTo(x, y + r)
      c.quadraticCurveTo(x, y, x + r, y)
    } else {
      c.lineTo(x + w - r, y)
      c.quadraticCurveTo(x + w, y, x + w, y + r)
      c.lineTo(x + w, y + h - r)
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
      c.lineTo(x + r, y + h)
      c.quadraticCurveTo(x, y + h, x, y + h - r)
      c.lineTo(x, y + r)
      c.quadraticCurveTo(x, y, x + r, y)
    }
    c.closePath()
    c.fill()
  }
  const hw = w * 0.08
  c.fillStyle = "#888"
  c.fillRect(x + w + 2, y + h / 3, hw, h / 3)
  c.fillStyle = "#000"
  c.font = `bold ${h * 0.9}px SF`
  c.fillText(`${p}`, x + w / 2 - 12, y + h / 2 + 5)
}
function createPP(ctx, pp, x = 77, y = 44.5) {
  ctx.beginPath()
  let size = 48
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(pp, x, y, 50, 50)
  ctx.restore()
}
function Createtxt(c, x, y, txt, s, color) {
  let cursorX = x
  for (const ch of [...txt]) {
    c.fillStyle = "white"
    c.font = isEmoji(ch) ? `${s * 0.8}px Apple Emoji` : `bold ${s}px SF`
    c.fillText(ch, cursorX, y)
    cursorX += c.measureText(ch).width
  }
}
async function serialize(opts) {
  let bg = await loadImage(fs.readFileSync(path.join(__dirname, "bg.png")))
  const emoji = await loadImage(fs.readFileSync(path.join(__dirname, "emoji.png")))
  const menu = await loadImage(fs.readFileSync(path.join(__dirname, "menu.png")))
  const canvas = createCanvas(bg.width, bg.height)
  const ctx = canvas.getContext("2d")
  ctx.drawImage(bg, 0, 0)
  blurCanvas(ctx, canvas.width, canvas.height, 10)
  ctx.drawImage(bg, 0, 0, bg.width, 100, 0, 0, bg.width, 100)
  ctx.save()
  if (opts.pp) {
    const image = await loadImage(`data:image/jpeg;base64,${opts.pp.toString("base64")}`)
    createPP(ctx, image)
  }
  dbt(ctx, 362, 10, 30, 5, opts.battery || Math.floor(Math.random() * 100) + 1)
  Createtxt(ctx, 131, 67, opts.name || "Nazirganz", 16, "white")
  Createtxt(ctx, 18, 20, opts.time || "12.00", 16, "white")
  drawBubble(ctx, opts.text || "hello word", emoji, menu, 24, 330, { size: 18, maxWidth: 320, fillColor: "#373737", textColor: "#ffffff", align: "left", time: opts.msgTime || "12:00" })
  return canvas.toBuffer("image/png")
}
module.exports = serialize