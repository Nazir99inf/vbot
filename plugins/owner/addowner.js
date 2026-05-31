let handler = async (m, { conn, text }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    else who = m.chat
    if (!who) throw 'Tag or mention the person you want to add as owner!'
    let user = who.split('@')[0]
    if (global.owner.includes(user)) throw 'This person is already an owner!'
    global.owner.push(user)
    conn.reply(m.chat, `Successfully added @${user} as owner!`, m, { mentions: [who] })
}
handler.help = ['addowner']
handler.tags = ['owner']
handler.command = /^(addowner)$/i
handler.rowner = true

module.exports = handler
