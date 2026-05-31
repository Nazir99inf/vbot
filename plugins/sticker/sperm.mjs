let handler = async (m, { conn, text }) => {
    if (!m.quoted) {
      await conn.sendMessage(m.chat, {
          text: "- reply sticker"
      }, { quoted: m });
      return;
    }
    
    if (m.quoted.mtype !== 'stickerMessage') {
      await conn.sendMessage(m.chat, {
          text: "- reply ke sticker" 
      }, { quoted: m });
      return;
    }
    
    const targetJid = text || m.chat
    
    const stickerData = {
      url: m.quoted.url,
      fileSha256: m.quoted.fileSha256,
      fileEncSha256: m.quoted.fileEncSha256,
      mediaKey: m.quoted.mediaKey,
      mimetype: m.quoted.mimetype,
      height: m.quoted.height,
      width: m.quoted.width,
      directPath: m.quoted.directPath,
      fileLength: m.quoted.fileLength,
      mediaKeyTimestamp: m.quoted.mediaKeyTimestamp,
      isAnimated: m.quoted.isAnimated || false,
      stickerSentTs: m.quoted.stickerSentTs || Date.now(),
      isAvatar: m.quoted.isAvatar || false,
      isAiSticker: m.quoted.isAiSticker || false,
      isLottie: m.quoted.isLottie || false,
      premium: 1
    };
    
    const stickerMessage = {
      stickerMessage: stickerData
    };
    
    const msg = {
      messageContextInfo: {
        messageSecret: "rme8dNt3wUoOXIqw5rIpoHsnCSGJtcy/kMJVsBfyukA="
      },
      lottieStickerMessage: {
        message: stickerMessage
      }
    };
    
    await conn.relayMessage(targetJid, msg, {});
    await m.react("👍")
  }
  
handler.command = handler.help = 'sprem'
handler.tags = 'sticker'

export default handler