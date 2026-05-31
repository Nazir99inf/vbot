const fs = require("fs");
const path = require("path");

const handler = async m => {
    const directory = path.join(process.cwd(), global.sessionname);
    try {
        const files = fs.readdirSync(directory);
        let totalDeleted = 0;

        files.forEach(file => {
            if (file !== "creds.json") {
                fs.unlinkSync(path.join(directory, file));
                totalDeleted++;
            }
        });

        m.reply(`Success Delete File Trash Total: *[ ${totalDeleted} ]*`);
    } catch (err) {
        console.error(err);
        m.reply("Terjadi kesalahan saat membersihkan sesi.");
    }
};

handler.help = ["csessi", "clearsessi"].map(a => a + " *[clear trash]*");
handler.tags = ["owner"];
handler.command = ["csessi", "clearsessi"];
handler.owner = true;

module.exports = handler;
