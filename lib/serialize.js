const util = require("util");
const chalk = require("chalk");
const {proto} = require("baileys")
const WAJIDDomains = {
  WHATSAPP: 0,
  LID: 1,
  HOSTED: 128,
  HOSTED_LID: 129
};

const jidEncode = (user, server, device, agent) => {
  return `${user || ""}${agent ? `_${agent}` : ""}${device ? `:${device}` : ""}@${server}`;
};

const jidDecode = jid => {
  const sepIdx = typeof jid === "string" ? jid.indexOf("@") : -1;
  if (sepIdx < 0) return undefined;

  const server = jid.slice(sepIdx + 1);
  const userCombined = jid.slice(0, sepIdx);

  const parts = userCombined.split(":");
  const userAgent = parts[0];
  const device = parts[1];

  const ua = (userAgent || "").split("_");
  const user = ua[0];
  const agent = ua[1];

  let domainType = WAJIDDomains.WHATSAPP;
  if (server === "lid") domainType = WAJIDDomains.LID;
  else if (server === "hosted") domainType = WAJIDDomains.HOSTED;
  else if (server === "hosted.lid") domainType = WAJIDDomains.HOSTED_LID;
  else if (agent) domainType = parseInt(agent, 10);

  return {
    server,
    user,
    domainType,
    device: device ? Number(device) : undefined
  };
};

const jidNormalizedUser = jid => {
  const result = jidDecode(jid);
  if (!result) return "";
  const { user, server } = result;
  return jidEncode(user, server === "c.us" ? "s.whatsapp.net" : server);
};

const areJidsSameUser = (jid1, jid2) => {
  const a = jidDecode(jid1);
  const b = jidDecode(jid2);
  return (a && a.user) === (b && b.user);
};

const normalizeMessageContent = content => {
  if (!content) {
    return undefined;
  }
  for (let i = 0; i < 5; i++) {
    const inner = getFutureProofMessage(content);
    if (!inner) {
      break;
    }
    content = inner.message;
  }
  return content;
  function getFutureProofMessage(message) {
    return (
      (message && message.ephemeralMessage) ||
      (message && message.viewOnceMessage) ||
      (message && message.documentWithCaptionMessage) ||
      (message && message.viewOnceMessageV2) ||
      (message && message.viewOnceMessageV2Extension) ||
      (message && message.editedMessage) ||
      (message && message.associatedChildMessage) ||
      (message && message.groupStatusMessage) ||
      (message && message.groupStatusMessageV2)
    );
  }
};

const extractMessageContent = content => {
  const extractFromTemplateMessage = msg => {
    if (msg.imageMessage) {
      return { imageMessage: msg.imageMessage };
    } else if (msg.documentMessage) {
      return { documentMessage: msg.documentMessage };
    } else if (msg.videoMessage) {
      return { videoMessage: msg.videoMessage };
    } else if (msg.locationMessage) {
      return { locationMessage: msg.locationMessage };
    } else {
      return {
        conversation: "contentText" in msg ? msg.contentText : "hydratedContentText" in msg ? msg.hydratedContentText : ""
      };
    }
  };

  content = normalizeMessageContent(content);

  if (content && content.buttonsMessage) {
    return extractFromTemplateMessage(content.buttonsMessage);
  }

  if (content && content.templateMessage && content.templateMessage.hydratedFourRowTemplate) {
    return extractFromTemplateMessage(content.templateMessage.hydratedFourRowTemplate);
  }

  if (content && content.templateMessage && content.templateMessage.hydratedTemplate) {
    return extractFromTemplateMessage(content.templateMessage.hydratedTemplate);
  }

  if (content && content.templateMessage && content.templateMessage.fourRowTemplate) {
    return extractFromTemplateMessage(content.templateMessage.fourRowTemplate);
  }

  return content;
};
const getContentType = content => {
  if (content) {
    const keys = Object.keys(content);
    const key = keys.find(k => (k === "conversation" || k.endsWith("Message") || k.includes("V2") || k.includes("V3")) && k !== "senderKeyDistributionMessage");
    return key;
  }
};

function escapeRegExp(string) {
  return string.replace(/[.*=+:\-?^${}()|[\\]\\]|\s/g, "\\$&");
}

function getPn(inputs) {
  if (!inputs) return null
  if (inputs.endsWith("@s.whatsapp.net")) {
    return inputs
  }
  for (const group of Object.values(db.data.store.groupMetadata || {})) {
    for (const p of group.participants || []) {
      if (p.id === inputs || p.jid === inputs) {
        if (p.phoneNumber) {
          return p.phoneNumber
        }
        return jidNormalizedUser(p.jid || p.id)
      }
    }
  }
  return jidNormalizedUser(inputs) || jidNormalizedUser(conn.user.id) || inputs
}
function parseMessage(content, extractMessageContent) {
  content = extractMessageContent(content);
  if (content && content.viewOnceMessageV2Extension) {
    content = content.viewOnceMessageV2Extension.message;
  }
  if (content && content.protocolMessage && content.protocolMessage.type == 14) {
    let type = getContentType(content.protocolMessage);
    content = content.protocolMessage[type];
  }
  if (content && content.message) {
    let type = getContentType(content.message);
    content = content.message[type];
  }
  return content;
}
exports.jidDecode = jidDecode;
exports.jidEncode = jidEncode;
exports.jidNormalizedUser = jidNormalizedUser;
exports.areJidsSameUser = areJidsSameUser;
exports.normalizeMessageContent = normalizeMessageContent;
exports.extractMessageContent = extractMessageContent;
exports.getContentType = getContentType;
exports.parseMessage = parseMessage;
exports.getPn = getPn;
exports.escapeRegExp = escapeRegExp;
exports.smsg = (messages, conn) => {
  const m = {};
  if (!messages.message) return;
  m.message = parseMessage(messages.message, extractMessageContent);
  if (messages.key) {
    let keys = JSON.parse(JSON.stringify(messages.key));
    m.key = {
      remoteJid: keys.remoteJid || jidNormalizedUser(conn.user.id) || "",
      remoteJidAlt: keys.remoteJidAlt ? keys.remoteJidAlt : keys.remoteJid || jidNormalizedUser(conn.user.id),
      fromMe: keys.fromMe || false,
      id: messages.key.id,
      participant: keys.participant ? keys.participant : jidNormalizedUser(conn.user.lid),
      participantAlt: keys.participantAlt ? keys.participantAlt : jidNormalizedUser(conn.user.id),
      addressingMode: keys.addressingMode || "lid"
    };
    m.isGroup = m.key.remoteJid.endsWith("@g.us");
    m.chat = m.isGroup ? jidNormalizedUser(m.key.remoteJid) : jidNormalizedUser(m.key.remoteJidAlt || conn.user.id);
    m.sender = m.isGroup ? jidNormalizedUser(m.key.participantPn || m.key.participantAlt || getPn(m.key.participant) || conn.user.id) : m.chat;
    m.fromMe = m.key.fromMe;
    m.id = messages.key.id;
    m.device = /^3A/.test(m.id) ? "ios" : m.id.startsWith("3EB") ? "web" : /^.{21}/.test(m.id) ? "android" : /^.{18}/.test(m.id) ? "desktop" : "unknown";
    m.isBaileys = m.id.startsWith("7EPP") || m.id.startsWith("3EB") || !["android", "ios"].includes(m.device);
  }
  m.name = m.key.fromMe ? conn.user.name : conn.getName(m.sender) || messages.pushName
  if (m.message) {
    m.mtype = getContentType(m.message) || Object.keys(m.message)[0];
    m.msg = parseMessage(m.message[m.mtype], extractMessageContent) || m.message[m.mtype];
    const rawMentioned = [...(m.msg?.contextInfo?.mentionedJid || []), ...(m.msg?.contextInfo?.groupMentions?.map(v => v.groupJid) || [])];
    m.mentionedJid = rawMentioned
      .map(jid => {
        try {
          return getPn(jid);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    m.text = m.msg?.text || m.msg?.conversation || m.msg?.caption || m.message?.conversation || m.msg?.selectedButtonId || m.msg?.singleSelectReply?.selectedRowId || m.msg?.selectedId || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || m.msg?.name || "";
    m.prefix = new RegExp("^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]", "gi").test(m.text) ? m.text.match(new RegExp("^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]", "gi"))[0] : "";
    m.command = m.text.trim().replace(m.prefix, "").trim().split(/ +/).shift();
    m.args =
      m.text
        .trim()
        .replace(new RegExp("^" + escapeRegExp(m.prefix), "i"), "")
        .replace(m.command, "")
        .split(/ +/)
        .filter(a => a) || [];
    m.input = m.args.join(" ").trim();
    m.expiration = m.msg?.contextInfo?.expiration || 0;
    m.timestamps = typeof messages.messageTimestamp === "number" ? messages.messageTimestamp * 1000 : m.msg.timestampMs * 1000;
    m.isMedia = !!m.msg?.mimetype || !!m.msg?.thumbnailDirectPath;
    m.isQuoted = false;
    if (m.isMedia) {
      m.download = (saveToFile = false) => {
        return conn.downloadM(m.msg, m.mtype.replace(/message/i, ""), saveToFile);
      };
    }
    if (m.msg?.contextInfo?.quotedMessage) {
      m.isQuoted = true;
      m.quoted = {};
      m.quoted.message = parseMessage(m.msg?.contextInfo?.quotedMessage, extractMessageContent);
      if (m.quoted.message) {
        m.quoted.mtype = getContentType(m.quoted.message) || Object.keys(m.quoted.message)[0];
        m.quoted.msg = parseMessage(m.quoted.message[m.quoted.mtype], extractMessageContent) || m.quoted.message[m.quoted.mtype];
        m.quoted.key = {
          remoteJid: m.msg?.contextInfo?.remoteJid || m.chat,
          participant: jidNormalizedUser(m.msg?.contextInfo?.participant),
          fromMe: areJidsSameUser(jidNormalizedUser(m.msg?.contextInfo?.participant), jidNormalizedUser(conn?.user?.id)),
          id: m.msg?.contextInfo?.stanzaId
        };
        const qm = m.msg?.contextInfo?.quotedMessage || {};
        const qt = Object.keys(qm)[0];
        const qMentioned = [...(qm[qt]?.contextInfo?.mentionedJid || []), ...(qm[qt]?.contextInfo?.groupMentions?.map(v => v.groupJid) || [])];
        m.quoted.mentionedLid = qMentioned;
        m.quoted.mentionedJid = qMentioned
          .map(jid => {
            try {
              return getPn(jid);
            } catch {
              return null;
            }
          })
          .filter(Boolean);
        m.quoted.sender = getPn(m.quoted.key.participant) || m.quoted.key.remoteJid || null;
        m.quoted.chat = /g\.us|status/.test(m.msg?.contextInfo?.remoteJid) ? m.quoted.key.participant : m.quoted.key.remoteJid;
        m.quoted.fromMe = m.quoted.key.fromMe;
        m.quoted.id = m.msg?.contextInfo?.stanzaId;
        m.quoted.device = /^3A/.test(m.quoted.id) ? "ios" : /^3E/.test(m.quoted.id) ? "web" : /^.{21}/.test(m.quoted.id) ? "android" : /^.{18}/.test(m.quoted.id) ? "desktop" : "unknown";
        m.quoted.isMedia = !!m.quoted.msg?.mimetype || !!m.quoted.msg?.thumbnailDirectPath;
        m.quoted.isGroup = m.quoted.chat.endsWith("@g.us");
        m.quoted.participant = jidNormalizedUser(m.msg?.contextInfo?.participant);
        m.quoted.text = m.quoted.msg?.text || m.quoted.msg?.caption || m.quoted?.message?.conversation || m.quoted.msg?.selectedButtonId || m.quoted.msg?.singleSelectReply?.selectedRowId || m.quoted.msg?.selectedId || m.quoted.msg?.contentText || m.quoted.msg?.selectedDisplayText || m.quoted.msg?.title || m.quoted?.msg?.name || "";
        m.quoted.prefix = new RegExp("^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]", "gi").test(m.quoted.text) ? m.quoted.text.match(new RegExp("^[°•π÷×¶∆£¢€¥®™+✓=|/~!?@#%^&.©^]", "gi"))[0] : "";
        m.quoted.command = m.quoted.text && m.quoted.text.replace(m.quoted.prefix, "").trim().split(/ +/).shift();
        m.quoted.args =
          m.quoted.text
            .trim()
            .replace(new RegExp("^" + escapeRegExp(m.quoted.prefix), "i"), "")
            .replace(m.quoted.command, "")
            .split(/ +/)
            .filter(a => a) || [];
        m.quoted.input = m.quoted.args.join(" ").trim() || m.quoted.text;
        m.quoted.react = async emot => {
          await conn.sendMessage(m.chat, {
            react: {
              text: emot,
              key: m.quoted.key
            }
          });
        };
        if (m.quoted.isMedia) {
          m.quoted.download = (saveToFile = false) => {
            return conn.downloadM(m.quoted.msg, m.quoted.mtype.replace(/message/i, ""), saveToFile);
          };
        }
        m.quoted.reply = (text, chatId, options) => conn.reply(chatId ? chatId : m.chat, text, m.quoted, options);
        m.quoted.copy = () => exports.smsg(messages, conn);
        m.quoted.fakeObj = proto.WebMessageInfo.create({
                key: {
                    fromMe: m.quoted.fromMe,
                    remoteJid: m.quoted.chat,
                    id: m.quoted.id
                },
                message: m.quoted.msg,
                ...(m.isGroup ? { participant: m.quoted.sender } : {})
            })
        m.quoted.forward = (jid, forceForward = false) => conn.forwardMessage(jid, m.quoted.msg, forceForward);
        m.quoted.copyNForward = (jid, forceForward = true, options = {}) => conn.copyNForward(jid, m.quoted.message, forceForward, options);
        m.quoted.cMod = (jid, text = "", sender = m.quoted.sender, options = {}) => conn.cMod(jid, m.quoted.msg, text, sender, options);
        m.quoted.delete = () =>
          conn.sendMessage(m.chat, {
            delete: m.quoted.key
          });
      }
    }
  }

  m.copy = () => exports.smsg(messages, conn);
  m.forward = (jid, forceForward = false) => conn.forwardMessage(jid, m.msg, forceForward);
  m.copyNForward = (jid, forceForward = true, options = {}) => conn.copyNForward(jid, m.message, forceForward, options);
  m.cMod = (jid, text = "", sender = m.sender, options = {}) => conn.cMod(jid, m.quoted.msg, text, sender, options);
  m.delete = () =>
    conn.sendMessage(m.chat, {
      delete: m.key
    });
  m.react = async emot => {
    await conn.sendMessage(m.chat, {
      react: {
        text: emot,
        key: m.key
      }
    });
  };
  m.reply = async (pesan, options) => {
    const a = {
      contextInfo: {
        mentionedJid: conn.parseMention(pesan)
      }
    };
    try {
      if (options && pesan) {
        conn.sendFile(m.chat, options, null, pesan, m, null, a);
      } else {
        if (pesan) {
          if (typeof pesan === "object") {
            conn.sendMessage(
              m.chat,
              {
                ...pesan
              },
              {
                quoted: m
              }
            );
          } else {
            conn.reply(m.chat, pesan, m, a);
          }
        } else {
          conn.reply(m.chat, options, m, a);
        }
      }
    } catch (e) {
      conn.reply(m.chat, util.inspect(pesan, { showHidden: false, depth: 3, colors: false }), m, a);
    }
  };
  return m;
};
