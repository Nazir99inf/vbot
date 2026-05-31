const { proto, generateWAMessageFromContent } = require("baileys");

let handler = async (m, { conn, usedPrefix, command, args, isOwner }) => {
    let settings = global.db.data.settings;

    if (args.length > 0) {
        let type = args[0].toLowerCase();
        let status = args[1] ? args[1].toLowerCase() : null;

        if (type === 'autodownload') {
            global.db.data.settings.autodownload = status === 'on';
            return m.reply(`Auto Download successfully turned ${status === 'on' ? 'ON' : 'OFF'}!`);
        } else if (type === 'anticall') {
            global.db.data.settings.anticall = status === 'on';
            return m.reply(`Anti Call successfully turned ${status === 'on' ? 'ON' : 'OFF'}!`);
        } else if (type === 'nyimak') {
            global.db.data.settings.nyimak = status === 'on';
            return m.reply(`Nyimak mode successfully turned ${status === 'on' ? 'ON' : 'OFF'}!`);
        } else if (type === 'autoread') {
            global.db.data.settings.autoread = status === 'on';
            return m.reply(`Auto Read successfully turned ${status === 'on' ? 'ON' : 'OFF'}!`);
        }
    }
    
    const listConfig = [
        {
            title: "Self Mode",
            key: "self",
            description: "Mengatur bot hanya untuk owner atau publik.",
            on: ".public",
            off: ".self"
        },
        {
            title: "Auto Download",
            key: "autodownload",
            description: "Download media otomatis dari link yang dikirim.",
            on: ".setting autodownload off",
            off: ".setting autodownload on"
        },
        {
            title: "Group Only",
            key: "gconly",
            description: "Bot hanya merespon di dalam grup.",
            on: ".gconly",
            off: ".gconly"
        },
        {
            title: "Private Only",
            key: "pconly",
            description: "Bot hanya merespon di chat pribadi.",
            on: ".pconly",
            off: ".pconly"
        },
        {
            title: "Anti Call",
            key: "anticall",
            description: "Otomatis memblokir orang yang menelepon bot.",
            on: ".setting anticall off",
            off: ".setting anticall on"
        },
        {
            title: "Nyimak Mode",
            key: "nyimak",
            description: "Bot hanya akan membaca pesan tanpa merespon.",
            on: ".setting nyimak off",
            off: ".setting nyimak on"
        },
        {
            title: "Auto Read",
            key: "autoread",
            description: "Otomatis membaca pesan yang masuk.",
            on: ".setting autoread off",
            off: ".setting autoread on"
        }
    ];

    let rows = listConfig.map(v => {
        let status = settings[v.key];
        return {
            header: v.title,
            title: status ? "Status: [ ON ]" : "Status: [ OFF ]",
            description: status ? `Klik untuk mematikan ${v.title}` : `Klik untuk menyalakan ${v.title}`,
            id: status ? v.on : v.off
        };
    });

    const msg = generateWAMessageFromContent(
        m.chat,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: {
                            text: "Berikut adalah daftar pengaturan bot yang tersedia. Silahkan pilih pengaturan yang ingin Anda ubah."
                        },
                        footer: {
                            text: `Powered By ${global.namebot || "Nazir"}`
                        },
                        header: {
                            title: "⚙️ BOT SETTINGS",
                            hasMediaAttachment: false
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "Pilih Pengaturan",
                                        sections: [
                                            {
                                                title: "Settings Menu",
                                                rows: rows
                                            }
                                        ]
                                    })
                                }
                            ]
                        }
                    })
                }
            }
        },
        { quoted: m }
    );

    await conn.relayMessage(
        m.chat,
        msg.message,
        { 
            messageId: msg.key.id,  
            additionalNodes: [
                { 
                    tag: "biz", 
                    attrs: {}, 
                    content: [
                        { 
                            tag: "interactive", 
                            attrs: { type: "native_flow", v: "1" }, 
                            content: [
                                { 
                                    tag: "native_flow", 
                                    attrs: { v: "9", name: "mixed" } 
                                }
                            ] 
                        }
                    ] 
                }
            ] 
        }
    );
};

handler.help = ["setting"];
handler.tags = ["owner"];
handler.command = ["setting"];
handler.owner = true;

module.exports = handler;
