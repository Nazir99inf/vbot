let handler = async (m, { conn, usedPrefix, command }) => {
    let isGcOnly = global.db.data.settings.gconly
    global.db.data.settings.gconly = !isGcOnly
    conn.reply(m.chat, `Successfully ${!isGcOnly ? 'enabled' : 'disabled'} Group Only mode!`, m)
}
handler.help = ['gconly']
handler.tags = ['owner']
handler.command = /^(gconly)$/i
handler.owner = true

module.exports = handler
