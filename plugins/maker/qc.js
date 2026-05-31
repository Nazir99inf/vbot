const moment = require("moment-timezone");
const axios = require("axios");
const { proto, generateWAMessageFromContent } = require("baileys");

const colorMap = {
  pink: "#f68ac9", blue: "#6cace4", red: "#f44336", green: "#4caf50",
  yellow: "#ffeb3b", purple: "#9c27b0", darkblue: "#0d47a1", lightblue: "#03a9f4",
  ash: "#9e9e9e", orange: "#FF7F50", black: "#000000", white: "#ffffff",
  teal: "#008080", lightpink: "#FFC0CB", chocolate: "#A52A2A", salmon: "#FFA07A",
  magenta: "#FF00FF", tan: "#D2B48C", wheat: "#F5DEB3", deeppink: "#FF1493",
  fire: "#B22222", skyblue: "#00BFFF", brightskyblue: "#1E90FF", hotpink: "#FF69B4",
  lightskyblue: "#87CEEB", seagreen: "#20B2AA", darkred: "#8B0000", orangered: "#FF4500",
  cyan: "#48D1CC", violet: "#BA55D3", mossgreen: "#00FF7F", darkgreen: "#008000",
  navyblue: "#191970", darkorange: "#FF8C00", darkpurple: "#9400D3", fuchsia: "#FF00FF",
  darkmagenta: "#8B008B", darkgray: "#2F4F4F", peachpuff: "#FFDAB9", darkishgreen: "#BDB76B",
  darkishred: "#DC143C", goldenrod: "#DAA520", darkishgray: "#696969",
  darkishpurple: "#483D8B", gold: "#FFD700", silver: "#C0C0C0"
};

const handler = async (m, { conn, usedPrefix, text, args, command }) => {
  if (!args[0]) throw `* *Example :* ${usedPrefix + command} Hello Word\nAtau ${usedPrefix + command} blue Hello Word`
  
  let color = colorMap.white; // Default white
  let messageText = text;

  if (colorMap[args[0].toLowerCase()]) {
    color = colorMap[args[0].toLowerCase()];
    messageText = args.slice(1).join(" ");
  }

  // If after checking for color, there's no message text, or if the user didn't specify a color
  // we show the list message to pick a color
  if (!messageText || !colorMap[args[0].toLowerCase()]) {
    // If user provided text but no valid color as first arg
    const finalMessage = messageText || text;
    
    const colorRows = Object.keys(colorMap).map(c => ({
        header: c.toUpperCase(),
        title: `Pilih warna ${c}`,
        description: `Gunakan warna ${c} untuk Quote Chat`,
        id: `${usedPrefix + command} ${c} ${finalMessage}`
    }));

    const msg = generateWAMessageFromContent(
        m.chat,
        {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: {
                            text: `Silahkan pilih warna untuk Quote Chat Anda:\n\n*Pesan:* ${finalMessage}`
                        },
                        footer: {
                            text: "Powered By Nazir"
                        },
                        header: {
                            title: "🎨 QC COLOR PICKER",
                            hasMediaAttachment: false
                        },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "Pilih Warna",
                                        sections: [
                                            {
                                                title: "Daftar Warna",
                                                rows: colorRows
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

    return await conn.relayMessage(
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
  }

  if (messageText.length > 70) return m.reply(`Maksimal 70 teks!`);

  const pp = await conn.profilePictureUrl(m.sender, "image").catch(() => "https://telegra.ph/file/320b066dc81928b782c7b.png");

  const obj = {
    type: "quote",
    format: "png",
    backgroundColor: color,
    width: 512,
    height: 768,
    scale: 2,
    messages: [
      {
        entities: [],
        avatar: true,
        from: {
          id: 1,
          name: m.name || "Pengguna",
          photo: { url: pp }
        },
        text: messageText,
        replyMessage: {}
      }
    ]
  };

  const { data } = await axios.post("https://qc.botcahx.eu.org/generate", obj, {
    headers: { "Content-Type": "application/json" }
  });
  
  const buffer = Buffer.from(data.result.image, "base64");
  const now = moment().tz("Asia/Jakarta").format("YYYY/MM/DD");
  const packname = m.name || global.namebot || "V Bot";
  const author = "\n"+now;
  
  await conn.sendImageAsSticker(m.chat, buffer, m, {
    packname,
    author
  });
};

handler.help = ["qc", "quickchat"].map((a) => a + " *[color] [teks]*");
handler.tags = ["tools", "internet"];
handler.command = ["qc", "quickchat"];

module.exports = handler;
