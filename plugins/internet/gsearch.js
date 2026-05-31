const google = require('../../scraper/gsearch.js')
const handler = async (m, { text, usedPrefix, command}) => {
  try {
    if (!text) throw `${usedPrefix + command} who is sundar pichai?`
    const result = await google.search(text)
   await conn.sendMessage(m.chat, {
      text: result.trim(),
      contextInfo: {
        externalAdReply: {
          title: "NotebookLM",
          body: "Powered by Google DeepMind",
          thumbnailUrl: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/notebooklm-icon.png",
          sourceUrl: "https://notebooklm.google/",
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m });
  } catch (e) {
    m.reply(`Error: ${e}`)
  }
}

handler.command = ['gsearch', 'aisearch', 'google', 'searchai']
handler.tags = ['ai', 'internet']
handler.help = ['gsearch', 'aisearch', 'google', 'searchai'].map(a => a + ' [queru]')

module.exports = handler