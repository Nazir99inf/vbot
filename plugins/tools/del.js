let handler = async (m, { conn, command }) => {
    if (!m.quoted) throw '* *Example :* .del [reply message]';
  await conn.sendMessage(m.chat, { delete: m.quoted.key });
};
handler.help = ['del', 'delete'];
handler.tags = ['tools'];
handler.botaadmin = true;
handler.command = ['del', 'delete', 'unsend'];

module.exports = handler;