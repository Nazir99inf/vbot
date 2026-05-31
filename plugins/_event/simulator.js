const { generateWAMessageFromContent, proto,prepareWAMessageMedia } = require("baileys");
const nanoQuickButton = (displayText, id) => ({
name: "quick_reply",
buttonParamsJson: JSON.stringify({
display_text: displayText,
id
})
})
let saluran = "https://whatsapp.com/channel/0029VbB4spI8vd1RoXcWXm0w"
async function sendNanoButtonMenu(chat, teks, listnye, jm) {
    let msg = generateWAMessageFromContent(
        chat,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 999999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363418977603376@newsletter",
                                newsletterName: `Channel`,
                                serverMessageId: 145
                            }
                        },
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: teks
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `akup`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: "",
                            thumbnailUrl: "",
                            gifPlayback: true,
                            subtitle: "",
                            hasMediaAttachment: true,
                            ...(await prepareWAMessageMedia({ image: { url: global.dash } }, { upload: conn.waUploadToServer }))
                        }),
                        gifPlayback: true,
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            messageParamsJson: JSON.stringify({
                                limited_time_offer: {
                                    text: saluran,
                                    url: saluran,
                                    copy_code: "nazir",
                                    expiration_time: Date.now() * 999
                                },
                                bottom_sheet: {
                                    in_thread_buttons_limit: 2,
                                    divider_indices: [1, 2, 3, 4, 5, 999],
                                    list_title: `Command Center`,
                                    button_title: "𝐒𝐡𝐨𝐰 𝐅𝐢𝐭𝐮𝐫"
                                },
                                tap_target_configuration: {
                                    title: "▸ NanoBotzID ◂",
                                    description: "nazir",
                                    canonical_url: "https://whatsapp.com",
                                    domain: "whatsapp.com",
                                    button_index: 0
                                }
                            }),
                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({ has_multiple_buttons: true })
                                },
                                {
                                    name: "call_permission_request",
                                    buttonParamsJson: JSON.stringify({ has_multiple_buttons: true })
                                },
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        ...listnye,
                                        has_multiple_buttons: true
                                    })
                                },
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: `𝘊𝘳𝘦𝘥𝘪𝘵𝘴`,
                                        id: "123456789",
                                        copy_code: "nazir"
                                    })
                                },
                                nanoQuickButton("MAIN MENU", "menu"),
                                nanoQuickButton("ALL MENU", "allmenu"),
                                nanoQuickButton("MENU GAME", "gamemenu"),
                                nanoQuickButton("OWNER MENU", "ownermenu"),
                                nanoQuickButton("AI MENU", "aimenu"),
                                nanoQuickButton("DOWNLOAD", "downloadmenu"),
                                nanoQuickButton("GROUP MENU", "groupmenu"),
                                nanoQuickButton("STORE MENU", "storemenu"),
                                nanoQuickButton("BUG MENU", "bugmenu"),
                                nanoQuickButton("OWNER", "owner")
                            ]
                        })
                    })
                }
            }
        },
        { quoted: jm }
    );
    await conn.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id
    });
}
const bet = {
  title: "NANO COMMAND CENTER",
  sections: [
    {
      title: `Akses Cepat`, 
      highlight_label: `Recommended`,
      rows: [
        {
          title: "⚡ All Menu",
          description: "Lihat semua fitur NanoBotzID",
          id: `allmenu`, 
        },
      ]
    },
    {
      title: `Kategori Fitur`, 
      highlight_label: ``,
      rows: [
        {
          title: "📜 Baca Peraturan",
          description: "Aturan penggunaan bot",
          id: `bacaperaturan`, 
        },
        {
          title: "📜 Sertifikat Maker",
          description: "Buat sertifikat lucu",
          id: `sertifikatmenu`, 
        },
      ]
    },
    {
      title: `Dokumentasi asli dari script ini`, 
      highlight_label: ``,
      rows: [
        {
          title: "Script",
          description: "💳 script ini gratis 100%",
          id: `script`, 
        },
        {
          title: "Info Bot",
          description: "📋 Informasi total fitur dan lainnya",
          id: `infobot`, 
        },
      ]
    }
  ]
}
await sendNanoButtonMenu(m.chat, 
                         "tes", bet, m)