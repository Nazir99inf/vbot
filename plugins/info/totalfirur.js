const { createCanvas, GlobalFonts } = require('@napi-rs/canvas')
const moment = require('moment-timezone')
const path = require('path')
const fs = require('fs')

const FONT_RI = path.join(__dirname, '../../media/remixicon.ttf')
if (fs.existsSync(FONT_RI)) GlobalFonts.registerFromPath(FONT_RI, 'RemixIcon')

const THEME = {
    bg: '#0a0e14', card: '#161b22', primary: '#00d4ff', secondary: '#7c3aed',
    accent: '#10b981', text: '#ffffff', textMuted: '#94a3b8',
    colors: ['#00d4ff', '#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#ef4444']
}

const RI = {
    main: '\uee1c', internet: '\uEDCF', tools: '\uF21A', downloader: '\uec5a',
    voice: '\uF586', ai: '\uF36D', game: '\udf3e', owner: '\uF28E',
    group: '\uEDE3', sticker: '\uef8b', info: '\uEE59', stats: '\uf191',
    db: '\uec1e', check: '\uebb3', other: '\uf1b7'
}

async function drawPremiumChart(stats, total, enabled) {
    const scale = 2
    const W = 900, H = 600
    const canvas = createCanvas(W * scale, H * scale)
    const ctx = canvas.getContext('2d')
    
    ctx.scale(scale, scale)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    
    const font = (s, b = '') => `${b} ${s}px Arial`

    ctx.fillStyle = THEME.bg  
    ctx.fillRect(0, 0, W, H)  

    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 1  
    for (let i = 0; i < W; i += 50) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke() }  
    for (let i = 0; i < H; i += 50) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke() }  

    ctx.fillStyle = THEME.primary; ctx.font = '32px RemixIcon'; ctx.fillText(RI.info, 40, 55)  
    ctx.fillStyle = THEME.text; ctx.font = font(26, 'bold'); ctx.fillText('COMMAND DISTRIBUTION', 85, 50)  

    const boxes = [  
        { l: 'TOTAL', v: total, c: THEME.primary, i: RI.stats },  
        { l: 'ACTIVE', v: enabled, c: THEME.accent, i: RI.check },  
        { l: 'STORAGE', v: Object.keys(stats).length, c: THEME.secondary, i: RI.db }  
    ]  

    boxes.forEach((b, i) => {  
        const x = 520 + (i * 120)  
        ctx.fillStyle = THEME.card; ctx.beginPath(); ctx.roundRect(x, 25, 105, 55, 8); ctx.fill()  
        ctx.fillStyle = b.c; ctx.font = '18px RemixIcon'; ctx.fillText(b.i, x + 12, 58)  
        ctx.font = font(16, 'bold'); ctx.fillText(b.v, x + 38, 58)  
    })  

    const pieX = 180, pieY = 320, pieR = 140  
    let start = -Math.PI / 2  
    const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]).slice(0, 7)  

    sorted.forEach(([cat, count], i) => {  
        const slice = (count / total) * Math.PI * 2  
        ctx.beginPath(); ctx.moveTo(pieX, pieY); ctx.arc(pieX, pieY, pieR, start, start + slice)  
        ctx.fillStyle = THEME.colors[i % THEME.colors.length]; ctx.fill()  
        start += slice  
    })  

    ctx.beginPath(); ctx.arc(pieX, pieY, 70, 0, Math.PI * 2); ctx.fillStyle = THEME.bg; ctx.fill()  
    ctx.fillStyle = THEME.text; ctx.textAlign = 'center'; ctx.font = font(30, 'bold'); ctx.fillText(total, pieX, pieY + 5)  
    ctx.font = font(12); ctx.fillStyle = THEME.textMuted; ctx.fillText('CMDS', pieX, pieY + 22)  
    ctx.textAlign = 'left'  

    const barX = 350, barY = 160, barW = 280, labelSpace = 150
    sorted.forEach(([cat, count], i) => {  
        const y = barY + (i * 55), color = THEME.colors[i % THEME.colors.length], pct = ((count / total) * 100).toFixed(1)  

        ctx.fillStyle = color; ctx.font = '22px RemixIcon'; ctx.fillText(RI[cat] || RI.other, barX, y + 18)  
        ctx.fillStyle = THEME.text; ctx.font = font(14, 'bold'); ctx.fillText(cat.toUpperCase(), barX + 35, y + 15)  

        ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.roundRect(barX + labelSpace, y + 5, barW, 14, 4); ctx.fill()  
        ctx.fillStyle = color  
        const fillW = (count / total) * barW
        ctx.beginPath(); ctx.roundRect(barX + labelSpace, y + 5, fillW, 14, 4); ctx.fill()  

        ctx.fillStyle = THEME.textMuted; ctx.font = font(13)  
        ctx.fillText(`${count} (${pct}%)`, barX + labelSpace + barW + 12, y + 16)  
    })  

    return canvas.toBuffer('image/png')
}

let handler = async (m, { conn }) => {
    const plugins = Object.values(global.plugins)
    const stats = {}
    let total = 0, enabled = 0

    plugins.forEach(p => {  
        const cfg = p.config || p  
        if (cfg.help) {  
            const cat = cfg.category || (cfg.tags ? cfg.tags[0] : 'other')  
            const count = Array.isArray(cfg.help) ? cfg.help.length : 1  
            stats[cat] = (stats[cat] || 0) + count  
            total += count  
            if (cfg.isEnabled !== false) enabled += count  
        }  
    })  

    await m.react('📊')  
    const img = await drawPremiumChart(stats, total, enabled)  
    const db = global.db.data  
    
    let caption = `📊 *D I S T R I B U S I  F I T U R*\n\n`  
    caption += `┌  ◦  Total Fitur: *${total}*\n│  ◦  Aktif: *${enabled}*\n`  
    caption += `│  ◦  User: *${Object.keys(db.users || {}).length}*\n└  ◦  Grup: *${Object.keys(db.chats || {}).length}*\n\n`  

    Object.entries(stats).sort((a,b) => b[1] - a[1]).slice(0, 7).forEach(([c, n]) => {  
        caption += `◦ ${c.toUpperCase()}: *${n}*\n`  
    })  

    await conn.sendMessage(m.chat, { image: img, caption: caption + `\n> ${moment().tz('Asia/Jakarta').format('HH:mm')}` }, { quoted: m })
}

handler.help = ['totalfitur']
handler.tags = ['main']
handler.command = ['totalfitur', 'stats', 'totalcmd']

module.exports = handler