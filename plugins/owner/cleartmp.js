const fs = require('fs');
const path = require('path');

let handler = async (m, { conn }) => {
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) return m.reply('Directory tmp tidak ditemukan');
    
    const files = fs.readdirSync(tmpDir);
    if (files.length === 0) return m.reply('Folder tmp sudah kosong');
    
    let deletedCount = 0;
    files.forEach(file => {
        const filePath = path.join(tmpDir, file);
        if (fs.statSync(filePath).isFile()) {
            fs.unlinkSync(filePath);
            deletedCount++;
        }
    });
    
    m.reply(`Berhasil menghapus ${deletedCount} file di folder tmp.`);
};

handler.help = ['cleartmp'];
handler.tags = ['owner'];
handler.command = /^(cleartmp)$/i;
handler.owner = true;

module.exports = handler;
