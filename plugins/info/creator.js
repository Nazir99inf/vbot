let handler = async (m, { conn }) => {
    let contacts = global.owner.map(number => ({
        displayName: number,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${number}\nTEL;type=CELL;type=VOICE;waid=${number}:+${number}\nEND:VCARD`
    }));

    let caption = `*[ BERIKUT ADALAH PEMILIK SAYA ]*\n\n${(
        await Promise.all(
            global.owner.map(async (num, i) => {
                let name = await conn.getName(num + "@s.whatsapp.net");
                return `*${i + 1}.* @${num} *[ ${name} ]*`;
            })
        )
    ).join("\n")}\n\n[ INFORMATION ]\n\n«• Jangan Spam nomor Owner [ Sanksi Blokir ]\n«• Jangan Call Nomor Owner [ Sanksi Blokir ]`;

    await conn.sendMessage(
        m.chat,
        {
            contacts: {
                displayName: `${contacts.length} Owner`,
                contacts
            }
        },
        { quoted: m }
    );

    await conn.sendMessage(
        m.chat,
        {
            text: caption,
            mentions: global.owner.map(v => v + "@s.whatsapp.net")
        },
        { quoted: m }
    );
};

handler.help = ["owner", "creator", "developer"];
handler.tags = ["info"];
handler.command = ["owner", "creator", "developer"];

module.exports = handler;
