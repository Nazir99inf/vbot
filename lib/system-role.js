module.exports = async (m, { conn, isROwner, isOwner, isMods, isPrems, isBotAdmin, isAdmin, isRAdmin, groupMetadata }) => {
    const chat = global.db.data.chats[m.chat];
    const settings = global.db.data.settings;

    if (m.isBaileys && !m.fromMe && m.isGroup && isBotAdmin && chat?.antibot) {
        return await conn.sendMessage(m.chat, { delete: m.key });
    }

    if (settings?.autoread) {
        conn.readMessages([m.key]);
    }
    if (settings?.self && !isOwner) return true;
    if (settings?.nyimak && isOwner) return true;
    if (settings?.pconly && m.chat.endsWith("g.us")) return true;
    if (settings?.gconly && !m.fromMe && m.chat.endsWith("@s.whatsapp.net") && !isOwner && !isPrems) return true;
    if (settings?.swonly && m.chat !== "status@broadcast") return true;
    if (m.isBaileys) return true;
    if (settings?.mute?.includes(m.chat) && !isOwner) return true;

    if (chat?.antiToxic && !isAdmin && ["anjing", "kontol", "memek", "bangsat", "goblok", "idiot", "tolol", "babi", "ngentot", "pantek", "kampang", "fuck", "bitch", "cunt", "shit", "asshole", "dick"].includes(m.text?.toLowerCase())) {
        return await conn.sendMessage(m.chat, { delete: m.key });
    }

    if (m.isGroup && chat?.antiVideo && m.mtype === "videoMessage" && !isAdmin && isBotAdmin) {
        return await conn.sendMessage(m.chat, { delete: m.key });
    }

    if (m.isGroup && chat?.antiLink && !isAdmin && isBotAdmin && /chat\.whatsapp\.com\/|wa\.me\/|whatsapp\.com\/channel\//i.test(m.text || "")) {
        return await conn.sendMessage(m.chat, { delete: m.key });
    }

    if (m.isGroup && chat?.antiLinkCh && isBotAdmin && !isAdmin && /https:\/\/whatsapp\.com\/channel\/[A-Za-z0-9]{22}/.test(m.text || "")) {
        return await conn.sendMessage(m.chat, { delete: m.key });
    }
    if (m.quoted) {
        const quotedId = m.quoted?.id || m.quoted?.key?.id || m.msg?.contextInfo?.stanzaId;
        const aliasData = conn.alias?.[m.chat]?.[quotedId];
        if (aliasData) {
            const text = (m.text || "").trim().toLowerCase();
            for (const aliasObj of aliasData.alias) {
                const aliases = Array.isArray(aliasObj.alias) ? aliasObj.alias.map(v => v.toLowerCase()) : [aliasObj.alias.toLowerCase()];
                if (!aliases.includes(text)) continue;
                if (aliasObj.cmd) {
                    const fakeMsg = {
                        key: {
                            remoteJid: m.chat,
                            fromMe: false,
                            id: m.key?.id
                        },
                        message: {
                            conversation: aliasObj.cmd
                        },
                        messageTimestamp: Math.floor(Date.now() / 1000),
                        pushName: m.pushName || m.name || "User",
                        participant: m.sender,
                        sender: m.sender
                    };
                    conn.ev.emit("messages.upsert", { messages: [fakeMsg], type: "notify" });
                }
                delete conn.alias[m.chat][quotedId];
                break;
            }
        }
    }
    if (m.mtype === "interactiveResponseMessage") return conn.appendTextMessage(m, JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id);
    if (m.mtype === "templateButtonReplyMessage") return conn.appendTextMessage(m, m.msg.selectedId);
    if (m.isBaileys) return true;
};
