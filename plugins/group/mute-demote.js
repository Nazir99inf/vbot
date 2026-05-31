const handler = async (m, { conn, usedPrefix, command, text }) => {

  const groups = Object.values(await conn.groupFetchAllParticipating())
    .map(g => ({
      name: g.subject,
      id: g.id
    }))
  const isDemute = command.includes('demute')
  db.data.settings.mute = db.data.settings.mute || []
  if (!text) {
    let msg = `*List Available ${isDemute ? 'Demute' : 'Mute'} Bot*\n`
    groups.forEach((g, i) => {
      const muted = db.data.settings.mute.includes(g.id)
      msg += `${i + 1}. ${g.name} ${muted ? '🔇' : ''}\n`
    })
    msg += `\n*Example* : ${usedPrefix + command} 1`
    return m.reply(msg)
  }
  const index = parseInt(text) - 1

  if (isNaN(index) || !groups[index]) {
    return m.reply('')
  }
  const groupId = groups[index].id
  const groupName = groups[index].name
  if (isDemute) {
    if (!db.data.settings.mute.includes(groupId)) {
      return m.reply('this group has not been demoted yet')
    }
    db.data.settings.mute = db.data.settings.mute.filter(id => id !== groupId)

    return m.reply(`Demuted ${groupName} Successfully*`)
  }
  if (db.data.settings.mute.includes(groupId)) {
    return m.reply('this group already has been demoted')
  }
  db.data.settings.mute.push(groupId)
  m.reply(`Mute ${groupName} Successfully*`)
}

handler.help = ['mute', 'demute']
handler.tags = ['group']
handler.command = /^(mute|demute)$/i

module.exports = handler