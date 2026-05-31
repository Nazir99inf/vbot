let handler = async (m, { conn, usedPrefix, command }) => {
    let isPcOnly = global.db.data.settings.pconly
    global.db.data.settings.pconly = !isPcOnly
    conn.reply(m.chat, `Successfully ${!isPcOnly ? 'enabled' : 'disabled'} Private Chat Only mode!`, m)
}
handler.help = ['pconly']
handler.tags = ['owner']
handler.command = /^(pconly)$/i
handler.owner = true

module.exports = handler
