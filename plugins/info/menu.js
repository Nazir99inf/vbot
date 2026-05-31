const fs = require("fs");
const { createCanvas, GlobalFonts } = require("@napi-rs/canvas");
try {
    GlobalFonts.registerFromPath(process.cwd() + "/media/remixicon.ttf", "RemixIcon");
    GlobalFonts.registerFromPath(process.cwd() + "/media/roboto.ttf", "RO");
} catch (e) {}
function timeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);

    if (seconds < 60) return `${seconds} secs ago`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return `${days} days ago`;
}
module.exports = {
    help: ["menu"].map(a => a + " *[view main menu]*"),
    tags: ["main"],
    command: ["menu"],
    code: async (m, { conn, usedPrefix, command, args, isOwner, isPrems }) => {
        const { generateWAMessageFromContent, generateWAMessageContent, proto } = await import("baileys");
        let perintah = args[0] || "home",
            totalfitur = 0;
        const tagCount = {},
            tagHelpMapping = {};

        Object.keys(global.plugins || {}).forEach(plugin => {
            const p = global.plugins[plugin] || {};
            if (p.help) totalfitur++;
            const t = Array.isArray(p.tags) ? p.tags : [];
            const c = Array.isArray(p.command) ? p.command : p.command ? [p.command] : [];
            const atr = p.owner ? "🅞" : p.premium ? "🅟" : p.limit ? "🅛" : "";
            if (t.length > 0 && c.length > 0) {
                t.forEach(tag => {
                    if (!tag) return;
                    if (!tagCount[tag]) {
                        tagCount[tag] = 0;
                        tagHelpMapping[tag] = [];
                    }
                    tagCount[tag]++;
                    c.forEach(cmd => {
                        if (cmd && typeof cmd === "string") tagHelpMapping[tag].push(`${usedPrefix}${cmd} ${atr}`);
                    });
                });
            }
        });

        const icons = { main: "\uee1c", internet: "\uEDCF", tools: "\uF21A", downloader: "\uec5a", voice: "\uF586", ai: "\uF36D", game: "\udf3e", owner: "\uF28E", group: "\uEDE3", sticker: "\uef8b", info: "\uEE59", stats: "\uf191", db: "\uec1e", check: "\uebb3", other: "\uf1b7" };

        const topTags = Object.entries(tagCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, total]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), icon: icons[name.toLowerCase()] || icons.other, total }));

        const WIDTH = 1080,
            HEIGHT = 608;
        const canvas = createCanvas(WIDTH, HEIGHT);
        const ctx = canvas.getContext("2d");
        const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#06b6d4", "#14b8a6"];
        const rC = () => colors[Math.floor(Math.random() * colors.length)];
        const hexToRgba = (h, a) => `rgba(${parseInt(h.slice(1, 3), 16)},${parseInt(h.slice(3, 5), 16)},${parseInt(h.slice(5, 7), 16)},${a})`;

        ctx.fillStyle = "#0b0f17";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= WIDTH; x += 60) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, HEIGHT);
            ctx.stroke();
        }
        for (let y = 0; y <= HEIGHT; y += 60) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(WIDTH, y);
            ctx.stroke();
        }

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px RO";
        ctx.fillText("Dashboard", 40, 60);

        const drawStatBox = (x, y, icon, text) => {
            const c = rC();
            ctx.fillStyle = "#111827";
            ctx.strokeStyle = hexToRgba(c, 0.4);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(x, y, 140, 50, 12);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = c;
            ctx.font = "24px RemixIcon";
            ctx.fillText(icon, x + 15, y + 32);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 20px RO";
            ctx.fillText(text, x + 55, y + 32);
        };

        drawStatBox(590, 20, "\uF264", Object.keys(db.data.users).length.toString());
        drawStatBox(750, 20, "\uF18F", totalfitur.toString());
        drawStatBox(
            910,
            20,
            "\uEEAA",
            Object.values(db.data.stats)
                .reduce((sum, item) => sum + item.total, 0)
                .toString()
        );

        ctx.textAlign = "center";
        ctx.font = "bold 80px RO";
        const grad = ctx.createLinearGradient(WIDTH / 2 - 100, 0, WIDTH / 2 + 100, 0);
        grad.addColorStop(0, rC());
        grad.addColorStop(1, rC());
        ctx.fillStyle = grad;
        ctx.fillText(global.namebot, WIDTH / 2 - 50, 230);
        ctx.fillStyle = "#ffffff";
        ctx.font = "20px RO";
        ctx.fillText(`Powered By ${ownername}`, WIDTH / 2 - 50, 260);

        const bw = 320,
            bx = (WIDTH - bw) / 2 - 50,
            by = 350;
        const textDesc = "Ini adalah bot multifungsi yang dirancang untuk membantu aktivitas harian secara otomatis, cepat, dan efisien.";
        ctx.font = "16px RO";
        let lines = [],
            currentLine = textDesc.split(" ")[0];
        for (let i = 1; i < textDesc.split(" ").length; i++) {
            if (ctx.measureText(currentLine + " " + textDesc.split(" ")[i]).width < 256) currentLine += " " + textDesc.split(" ")[i];
            else {
                lines.push(currentLine);
                currentLine = textDesc.split(" ")[i];
            }
        }
        lines.push(currentLine);

        const descColor = rC();
        ctx.fillStyle = "rgba(17, 24, 39, 0.8)";
        ctx.strokeStyle = hexToRgba(descColor, 0.4);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, lines.length * 25 + 60, 12);
        ctx.fill();
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.fillStyle = descColor;
        ctx.font = "bold 20px RO";
        ctx.fillText("Description", bx + bw / 2, by + 30);
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "16px RO";
        lines.forEach((line, i) => ctx.fillText(line, bx + bw / 2, by + 60 + i * 25));
        ctx.textAlign = "left";

        const features = Object.values(db.data.stats)
            .sort((a, b) => b.last - a.last)
            .slice(0, 5)
            .map(item => ({
                name: item.command,
                time: timeAgo(item.last),
                total: item.total.toString()
            }));
        ctx.fillStyle = "white";
        ctx.font = "bold 22px RO";
        ctx.fillText("Recent Activities", 680, 320);
        features.forEach((item, index) => {
            const c = rC(),
                y = 340 + index * 52;
            ctx.fillStyle = "rgba(17, 24, 39, 0.8)";
            ctx.strokeStyle = hexToRgba(c, 0.3);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(680, y, 370, 40, 10);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 18px RO";
            ctx.fillText(item.name, 700, y + 26);
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.font = "14px RO";
            ctx.fillText(item.time, 860, y + 26);
            ctx.fillStyle = hexToRgba(c, 0.2);
            ctx.beginPath();
            ctx.roundRect(960, y + 7, 70, 26, 6);
            ctx.fill();
            ctx.fillStyle = c;
            ctx.font = "bold 14px RO";
            ctx.textAlign = "center";
            ctx.fillText(item.total, 995, y + 25);
            ctx.textAlign = "left";
        });

        ctx.fillStyle = "rgba(17, 24, 39, 0.7)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(35, 310, 220, topTags.length * 46 + 50, 14);
        ctx.fill();
        ctx.stroke();

        topTags.forEach((item, i) => {
            const c = rC(),
                y = 350 + i * 46;
            ctx.fillStyle = "rgba(255,255,255,0.03)";
            ctx.beginPath();
            ctx.roundRect(45, y - 25, 190, 38, 8);
            ctx.fill();
            ctx.fillStyle = c;
            ctx.font = "20px RemixIcon";
            ctx.fillText(item.icon, 55, y);
            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 16px RO";
            ctx.fillText(item.name, 85, y);
            ctx.fillStyle = hexToRgba(c, 0.2);
            ctx.beginPath();
            ctx.roundRect(182, y - 20, 45, 22, 6);
            ctx.fill();
            ctx.fillStyle = c;
            ctx.font = "bold 13px RO";
            ctx.textAlign = "center";
            ctx.fillText(item.total.toString(), 205, y - 4);
            ctx.textAlign = "left";
        });

        const totalTop = topTags.reduce((acc, f) => acc + f.total, 0);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px RO";
        ctx.fillText("Total:", 50, 350 + topTags.length * 46 - 8);
        ctx.fillStyle = rC();
        ctx.font = "bold 20px RO";
        ctx.fillText(totalTop.toString(), 120, 350 + topTags.length * 46 - 8);

        const imgBuffer = canvas.toBuffer("image/png");
        const runtime = s => [Math.floor(s / 86400) ? `${Math.floor(s / 86400)}d` : null, Math.floor((s % 86400) / 3600) ? `${Math.floor((s % 86400) / 3600)}h` : null, Math.floor((s % 3600) / 60) ? `${Math.floor((s % 3600) / 60)}m` : null, `${Math.floor(s % 60)}s`].filter(Boolean).join(" ");
        const init =
            `*Hi!* @${m.sender.split("@")[0]}\n\n*《 USER INFO 》*\n✪ Name  : ${m.name || conn.getName(m.sender) || conn.user.name}\n✆ Phone : ${m.sender.split("@")[0]}\n☽ Time    : ${new Date().toLocaleString("id-ID")}\n◊ Role      : ${isOwner ? "Owner" : isPrems ? "Premium" : "User"}\n\n✧ *《 BOT STATUS 》* ✧\n𑁍 Botname   : ${global.namebot || "V Bot"}\n⌘ Feature       : ${totalfitur}\n♆ Running      : Baileys Official\n⟲ Runtime     : ${runtime(process.uptime())}\n∴ Language    : Node.js, FFMPEG\n℣ Version        : 1.0.0 Beta`.trim();

        if (perintah.includes("home")) {
            let isiMenu = Object.entries(tagCount).map(([key]) => ({ title: `MENU ${key}`.toUpperCase(), description: `Lihat perintah ${key} dari ${tagCount[key]}`, id: `${usedPrefix}menu ${key}` }));
            let msg = generateWAMessageFromContent(
                m.chat,
                {
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        contextInfo: {
                            mentionedJid: [m.sender]
                        },

                        body: proto.Message.InteractiveMessage.Body.create({ text: init }),
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: (await generateWAMessageContent({ image: imgBuffer }, { upload: conn.waUploadToServer })).imageMessage }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            messageParamsJson: JSON.stringify({ limited_time_offer: { text: "VBOT Multi Device", url: "https://api.nazirr.space", copy_code: "Powered By Nazir", expiration_time: Date.now() + 86400000 } }),
                            buttons: [
                                {
                                    name: "single_select",
                                    buttonParamsJson: JSON.stringify({
                                        title: "Explore",
                                        sections: [
                                            {
                                                title: "Explpre Category Feature",
                                                rows: [
                                                    { header: "All Menu", title: "Lihat semua fitur yang tersedia", id: `${usedPrefix}menu all` },
                                                    { header: "Develover<3", title: "Ketahui pembuat Dan Pengelola Bot", id: `${usedPrefix}owner` },
                                                    { header: "Source", title: "Lihat Source Code Bot Dari Repository", id: `${usedPrefix}sc` }
                                                ]
                                            },
                                            { title: "Explore Menu By List", rows: isiMenu }
                                        ]
                                    })
                                }
                            ]
                        })
                    })
                },
                { quoted: m }
            );
            await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id, additionalNodes: [{ tag: "biz", attrs: {}, content: [{ tag: "interactive", attrs: { type: "native_flow", v: "1" }, content: [{ tag: "native_flow", attrs: { v: "9", name: "mixed" } }] }] }] });
        } else if (args[0] && tagCount[perintah]) {
            await conn.sendMessage(m.chat, { image: imgBuffer, caption: init + "\n\n⟡・゜✧ *MENU " + perintah.toUpperCase() + "* ✧゜・⟡\n" + tagHelpMapping[perintah].map(h => `★ ${h}`).join("\n") + "\n⟡・゜・—————————————・゜⟡" });
        } else if (perintah.includes("all")) {
            const all = Object.keys(tagCount)
                .sort()
                .map(tag => `☽✧ ${tag.toUpperCase()} ✧☾\n${(tagHelpMapping[tag] || []).map(h => `々 ${h}`).join("\n")}\n✦⋆┈┈┈┈┈┈┈⋆✦`)
                .join("\n\n");
            await conn.sendMessage(m.chat, { image: imgBuffer, caption: init + "\n\n" + all });
        }
    }
};
