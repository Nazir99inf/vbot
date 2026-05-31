let handler = async (m, { conn, isROwner, text }) => {
  let { spawn } = require('child_process');
  if (isROwner) {
    await m.reply('Sedang Merestart Bot...\nMohon tunggu sekitar 1 menit');
    process.exit(0);
  } else throw '_eeeeeiiittsssss..._'
}

handler.help = ['restart']
handler.tags = ['owner']
handler.command = /^(srvrestart|restart)$/i

handler.rowner = true

module.exports = handler