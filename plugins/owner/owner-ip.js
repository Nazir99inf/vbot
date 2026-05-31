const axios = require("axios");

let handler = async (m, { conn }) => {
  try {
    const { data } = await axios.get("https://api.ipify.org");
    conn.reply(m.chat, `Your IP is ${data}`, m);
  } catch (e) {
    conn.reply(m.chat, "An error occurred while processing the request.", m);
    console.log(e);
  }
};

handler.help = ["myip"];
handler.tags = ["owner"];
handler.command = ["myip"];
handler.owner = true;

module.exports = handler;
