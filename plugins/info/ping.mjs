export default {
  command: ["ping"],
  help: ["ping"],
  tags: ["info"],
  code: async (m, { conn }) => {
    const start = Date.now();
    const msg = await conn.sendMessage(m.chat, {
      text: "Testing response..."
    });
    await conn.sendMessage(m.chat, {
      text: `🏁 Response ${Date.now() - start} ms`
    }, {
      quoted: msg
    });
  }
};