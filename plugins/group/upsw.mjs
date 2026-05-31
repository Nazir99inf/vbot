/* Implementasi Fitur Status Grub < Beta Function WhatsApp >
By: RexxHayanasi 
Support Baileys: @rexxhayanasi/elaina-bail
*/

const handler = async (m, { conn, prefix = ".", command }) => {
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ""
    
    const textToParse = m.text || m.body || ''
    const caption = textToParse.replace(new RegExp(`^\\${prefix}${command}\\s*`, "i"), "").trim()
    
    const jid = m.chat

    try {
        if (!mime && !caption) {
            return await m.reply(`Reply media atau tambahkan teks.\nContoh: ${prefix}${command} (reply image/video/audio) Hai ini saya`)
        }

        let payload = {}

        if (/image/.test(mime)) {
            const buffer = await quoted.download()
            payload = {
                groupStatusMessage: {
                    image: buffer,
                    caption
                }
            }
        } else if (/video/.test(mime)) {
            const buffer = await quoted.download()
            payload = {
                groupStatusMessage: {
                    video: buffer,
                    caption
                }
            }
        } else if (/audio/.test(mime)) {
            const buffer = await quoted.download()
            payload = {
                groupStatusMessage: {
                    audio: buffer,
                    mimetype: "audio/mp4"
                }
            }
        } else if (caption) {
            payload = {
                groupStatusMessage: {
                    text: caption
                }
            }
        } else {
            return await m.reply(`Reply media atau tambahkan teks.\nContoh: ${prefix}${command} (reply image/video/audio) Hai ini saya`)
        }

        await conn.sendMessage(jid, payload, { quoted: m })
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
    } catch (err) {
        console.error("❌ Error di .upswgc:", err)
        await m.reply("❌ Terjadi kesalahan saat mengirim status grup.")
    }
}

handler.command = ['upswgc', 'swgc', 'swgrup']
handler.owner = true

export default handler