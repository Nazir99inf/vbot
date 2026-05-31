const chalk = require("chalk");
const moment = require("moment-timezone");
const fs = require("fs");

function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

module.exports = async (m, conn) => {
    if (!m) return;
    try {
        const type = m.mtype || "unknown";

        const name = m.isGroup ? global.db?.data?.store?.groupMetadata?.[m.chat]?.subject || "Unknown Group" : m.name || conn.getName(m.chat) || conn.user.name || JSON.parse(fs.readFileSync(`./${global.sessionname}/creds.json`, "utf8"))?.me?.name;
        const number = "+" + (m.sender?.split("@")[0] || "Unknown");
        const plugin = m.plugin || "";
        const logContent = m.text || "";
        const log = chalk.white.bold;
        let body = `${log(`- Name       : ${name}`)}\n`;
        body += `${log(`- Sender     : ${number}`)}\n`;
        if (plugin) body += `${log(`- Plugin     : ${plugin}`)}\n`;
        body += `${log(`- Time       : ${moment.tz("Asia/Makassar").format("DD/MM/YYYY HH:mm:ss")}`)}\n`;
        if (m.isMedia) {
            body += `${log(`- Mimetype   : ${m.msg?.mimetype || "Unknown"}`)}\n`;
            body += `${log(`- Size       : ${m.msg?.fileLength ? formatBytes(m.msg.fileLength) : "Unknown"}`)}\n`;
        } else {
            body += `${log(`- Mimetype   : ${m.mtype}`)}`;
        }
        console.log(`\n--------------------------------------\n${body}\n--------------------------------------\n${log(logContent)}`);
    } catch (e) {
        console.error("Error in print.js:", e);
    }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log("Update 'print.js'");
    delete require.cache[file];
    require(file);
});
