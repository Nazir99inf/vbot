const os = require("os");

module.exports = {
    help: ["os"],
    tags: ["info"],
    command: ["os"],
    code: async (m, { conn }) => {
        const start = Date.now();
        const cpus = os.cpus();
        const latency = Date.now() - start;
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const usedMem = (totalMem - freeMem).toFixed(2);
        const cpuModel = cpus[0].model;
        const cpuCore = cpus.length;
        const cpuSpeed = cpus[0].speed;
        const uptime = (os.uptime() / 3600).toFixed(1);
        const teks = `
╭━━━〔 SYSTEM INFO 〕━━━⬣
┃ 🏓 Response : ${latency} ms
┃ 💻 Platform : ${os.platform()}
┃ 🖥️ OS : ${os.type()} ${os.release()}
┃ 📦 NodeJS : ${process.version}
┃ 🌐 Hostname : ${os.hostname()}
┃
┃ 🧠 CPU : ${cpuModel}
┃ ⚡ Speed : ${cpuSpeed} MHz
┃ 🧩 Core : ${cpuCore}
┃
┃ 💾 RAM : ${usedMem} GB / ${totalMem} GB
┃ ⏳ Uptime : ${uptime} Jam
╰━━━━━━━━━━━━━━━━⬣
`;
        m.reply(teks);
    }
};