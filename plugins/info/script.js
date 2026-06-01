const axios = require("axios")
let handler = async (m, { conn }) => {
    let data = await axios.get("https://api.github.com/repos/Nazir99inf/vbot").then(a => a.data);

    let cap = "*– 乂 Informasi - Script Bot*\n\n";
    cap += `🧩 *Nama:* ${data.name}\n`;
    cap += `👤 *Pemilik:* ${data.owner.login}\n`;
    cap += `⭐ *Star:* ${data.stargazers_count}\n`;
    cap += `🍴 *Forks:* ${data.forks}\n`;
    cap += `📅 *Dibuat sejak:* ${Func.ago(data.created_at)}\n`;
    cap += `🔄 *Terakhir Update:* ${Func.ago(data.updated_at)}\n`;
    cap += `🔄 *Terakhir Publish:* ${Func.ago(data.pushed_at)}\n`;
    cap += `🔗 *Link Repository:* ${data.html_url}\n\n`;
    cap += "🔧 *Fitur Utama Script Bot:*\n" + "> ✅ *Support Plugins Cjs X Esm*\n" + "> ✅ *Ukuran Script Ringan*\n" + "> ✅ *100% Menggunakan Scrape*\n" + "> ✅ *Respon Append dan Alias*\n" + "> ✅ *Auto Delete Media dengan Interval*\n" + "> ✅ *Module Memerlukan dhisk sekitar 100mb*\n" + "> ✅ *Support Run Di Mana Saja*\n\n";
    cap += "Script ini gratis, boleh kalian recode dan jangan kalian jual ini script gratis";

    m.reply(cap);
};
handler.help = ["sc", "script", "source"].map(a => a + " [info script bot]");
handler.tags = ["info"];
handler.command = ["sc", "script", "source"];
module.exports = handler;
