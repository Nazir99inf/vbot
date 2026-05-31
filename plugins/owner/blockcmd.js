let handler = async (m, { conn, text }) => {
    if (!text) throw 'Enter the command you want to block!'
    let blockcmd = global.db.data.settings.blockcmd
    if (blockcmd.includes(text)) {
        blockcmd.splice(blockcmd.indexOf(text), 1)
        conn.reply(m.chat, `Successfully unblocked command: ${text}`, m)
    } else {
        blockcmd.push(text)
        conn.reply(m.chat, `Successfully blocked command: ${text}`, m)
    }
}
handler.help = ['blockcmd']
handler.tags = ['owner']
handler.command = /^(blockcmd)$/i
handler.owner = true

module.exports = handler
