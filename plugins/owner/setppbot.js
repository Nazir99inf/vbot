const fs = require('fs')
const { spawn } = require('child_process')

let handler = async (m, { conn, command, usedPrefix }) => {
	let q = m.quoted ? m.quoted : m
	let mime = (q.msg || q).mimetype || q.mediaType || ''

	if (/image/g.test(mime) && !/webp/g.test(mime)) {
		try {
			let media = await q.download()

			fs.writeFileSync('./pp.jpg', media)

			await new Promise((resolve, reject) => {
				const ffmpeg = spawn('ffmpeg', [
					'-i', './pp.jpg',
					'-vf',
					'scale=500:500:force_original_aspect_ratio=increase,crop=500:500',
					'-q:v', '15',
					'-pix_fmt', 'yuvj420p',
					'-y',
					'./pp-out.jpg'
				])

				ffmpeg.on('close', code => {
					if (code !== 0) return reject(new Error('FFmpeg error'))
					resolve()
				})

				ffmpeg.on('error', reject)
			})

			let data = fs.readFileSync('./pp-out.jpg')
			await conn.query({
				tag: 'iq',
				attrs: {
				  target: conn.decodeJid(conn.user.id),
					to: 's.whatsapp.net',
					type: 'set',
					xmlns: 'w:profile:picture',
				},
				content: [
					{
						tag: 'picture',
						attrs: {
							type: 'image'
						},
						content: Buffer.from(data)
					}
				]
			})
			fs.unlinkSync('./pp.jpg')
			fs.unlinkSync('./pp-out.jpg')

			m.reply('Sukses mengganti Profile Icon')
		} catch (e) {
			console.log(e)
			m.reply(`Terjadi kesalahan: ${e.message}`)
		}
	} else {
		m.reply(`Kirim gambar dengan caption *${usedPrefix + command}* atau tag gambar yang sudah dikirim`)
	}
}

handler.help = ['setpp', 'setbotpp', 'ppbot'].map(a => a + ' [media]')
handler.tags = ['owner']
handler.command = ['setpp', 'setbotpp', 'ppbot']

handler.owner = true

module.exports = handler