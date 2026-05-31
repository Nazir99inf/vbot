const readline = require("readline");
const fs = require("fs");
const path = require("path");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const util = require("util");
const crypto = require("crypto");
const chalk = require("chalk");
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require("./lib/exif");
const { fileTypeFromBuffer, fromBuffer } = require("file-type");

class Client {
    constructor(config, baileys) {
        this.config = config;
        this.conn = null;
        this.bail = baileys;
        this.isAskingNumber = false;
    }
    async restartConnection() {
        try {
            if (this.conn?.ws) {
                this.conn.ws.close();
            }
            if (this.conn?.ev) {
                this.conn.ev.removeAllListeners();
            }
        } catch (e) {
            console.log(e);
        }
        let newConn = await this.connect();
        if (this.onReconnect) this.onReconnect(newConn);
        return newConn;
    }
    async connect() {
        const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, Browsers, DisconnectReason, jidDecode, generateWAMessage, generateWAMessageFromContent, proto, prepareWAMessageMedia, downloadContentFromMessage } = this.bail;
        const { version, isLatest } = await fetchLatestBaileysVersion();
        const sessionDir = this.config.sessions || this.config.session || "sessions";
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

        this.conn = this.bail.default({
            version,
            auth: state,
            browser: this.config.browser || Browsers.macOS("Safari"),
            printQRInTerminal: false,
            generateHighQualityLinkPreview: true,
            syncFullHistory: false,
            markOnlineOnConnect: true,
            logger: pino({ level: "silent" })
        });

        let loadingInterval = null;
        const spinFrames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
        if (!this.conn.authState.creds.registered) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            const question = t => new Promise(r => rl.question(t, r));
            console.log(chalk.cyan.bold("\n( Input Number )") + chalk.white.bold(" Please Input For Example 628xxx"));
            const phoneNumber = await question(chalk.yellow.bold("Your Number : "));
            rl.close();
            let code = await this.conn.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-");
            console.clear();
            console.log(chalk.green.bold("Your Pairing : ") + chalk.white.bold(code));

            let i = 0;
            loadingInterval = setInterval(() => {
                process.stdout.write(`\r\x1b[K${chalk.yellow(spinFrames[i])} Waiting For Connect...`);
                i = (i + 1) % spinFrames.length;
            }, 100);
        }
        this.conn.ev.on("connection.update", async update => {
            try {
                const { connection, lastDisconnect } = update;
                if (connection === "open") {
                    if (loadingInterval) {
                        clearInterval(loadingInterval);
                        process.stdout.write("\r\x1b[K");
                    }
                    console.log(`Bot Connected on ${conn.decodeJid(conn.user.id).split("@")[0]}`);
                    conn.user.name = JSON.parse(
    fs.readFileSync(`./${global.sessionname}/creds.json`, "utf8")
).me.name
                    if (!conn.alias) conn.alias = {};
                    db.data.store.groupMetadata = await this.conn.groupFetchAllParticipating();
                }
                if (connection === "close") {
                    if (loadingInterval) {
                        clearInterval(loadingInterval);
                        process.stdout.write("\r\x1b[K");
                    }
                    let reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
                    if (reason === DisconnectReason.badSession) {
                        console.log(`[ ⚠ ] Sesi buruk, harap hapus folder ${sessionDir} dan pindai lagi.`);
                        if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
                        await this.restartConnection();
                    } else if (reason === DisconnectReason.connectionClosed) {
                        console.log(`[ ⚠ ] Sambungan ditutup, menyambung kembali...`);
                        await this.restartConnection();
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log(`[ ⚠ ] Kehilangan koneksi ke server, menghubungkan kembali...`);
                        await this.restartConnection();
                    } else if (reason === DisconnectReason.connectionReplaced) {
                        console.log(`[ ⚠ ] Koneksi diganti, sesi baru lainnya telah dibuka. Silakan keluar dari sesi saat ini terlebih dahulu.`);
                        await this.restartConnection();
                    } else if (reason === DisconnectReason.loggedOut) {
                        console.log(`[ ⚠ ] Koneksi ditutup, harap hapus folder ${sessionDir} dan pindai lagi.`);
                        if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });
                        await this.restartConnection();
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log(`[ ⚠ ] Restart Diperlukan, menyambung kembali...`);
                        await this.restartConnection();
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log(`[ ⚠ ] Koneksi terputus (Timed Out), menghubungkan ulang...`);
                        await this.restartConnection();
                    } else {
                        console.log(`[ ⚠ ] Koneksi Terputus ⚠️. ${reason || ""}: ${connection || ""}`);
                        await this.restartConnection();
                    }
                }
            } catch (err) {
                console.error("[ CONNECTION UPDATE ERROR ]", err);
            }
        });
        this.conn.ev.on("creds.update", saveCreds);
        this.conn.decodeJid = jid => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                const decode = jidDecode(jid) || {};
                return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
            }
            return jid;
        };
        this.conn.getBuffer = async media => {
            let buffer = null;
            if (Buffer.isBuffer(media)) {
                buffer = media;
            } else if (/^data:.*?\/.*?;base64,/i.test(media)) {
                buffer = Buffer.from(media.split(",")[1], "base64");
            } else if (/^https?:\/\//.test(media)) {
                const res = await fetch(media);
                if (!res.ok) {
                    throw new Error(`Failed to fetch: ${res.status}`);
                }
                buffer = Buffer.from(await res.arrayBuffer());
            } else if (fs.existsSync(media)) {
                buffer = fs.readFileSync(media);
            } else {
                buffer = Buffer.alloc(0);
            }
            return buffer;
        };
        this.conn.getFile = async (pathUrl, save) => {
            let buffer, filename;
            let extension = "bin";
            let mime = "application/octet-stream";
            try {
                if (Buffer.isBuffer(pathUrl)) {
                    buffer = pathUrl;
                } else if (/^data:.*?\/.*?;base64,/i.test(pathUrl)) {
                    buffer = Buffer.from(pathUrl.split(",")[1], "base64");
                } else if (/^https?:\/\//.test(pathUrl)) {
                    const res = await fetch(pathUrl);
                    buffer = Buffer.from(await res.arrayBuffer());
                } else if (fs.existsSync(pathUrl)) {
                    filename = pathUrl;
                    buffer = fs.readFileSync(pathUrl);
                } else {
                    buffer = Buffer.alloc(0);
                }
                const type = await fromBuffer(buffer);
                if (type) {
                    mime = type.mime;
                    extension = type.ext;
                }
                if (save) {
                    filename = path.join(process.cwd(), `/tmp/${Date.now()}.${extension}`);
                    fs.writeFileSync(filename, buffer);
                }
            } catch (error) {
                console.error("GetFile Error:", error);
            }
            return { res: buffer, filename, mime, ext: extension, data: buffer };
        };
        this.conn.sendAliasMessage = async (jid, mess = {}, alias = [], quoted = null) => {
            try {
                function check(arr) {
                    if (!Array.isArray(arr)) return false;
                    if (!arr.length) return false;
                    for (const item of arr) {
                        if (typeof item !== "object" || item === null) return false;
                        if (!("alias" in item)) return false;
                        if (!Array.isArray(item.alias) && typeof item.alias !== "string") return false;
                        if ("cmd" in item && typeof item.cmd !== "string") return false;
                        if ("eval" in item && typeof item.eval !== "string") return false;
                    }
                    return true;
                }

                if (!check(alias)) return "Alias format is not valid!";
                const message = await this.conn.sendMessage(jid, mess, { quoted });
                if (!conn.alias[jid]) conn.alias[jid] = {};
                conn.alias[jid][message.key.id] = {
                    chat: jid,
                    id: message.key.id,
                    alias
                };

                return message;
            } catch (e) {
                return m.reply(e.message);
            }
        };
        this.conn.delete = async (messageKey, delay = 500) => {
            setTimeout(async () => {
                try {
                    await this.conn.sendMessage(messageKey.remoteJid, {
                        delete: messageKey
                    });
                } catch (err) {
                    console.error(err);
                }
            }, delay);
        };
        this.conn.sendAlbum = async (jid, input = [], opts = {}, qt = null) => {
            const quoted = {
                key: {
                    remoteJid: qt.key.remoteJid || qt.chat,
                    participant: qt.key.participant || this.conn.user.id,
                    fromMe: qt.key.fromMe || true,
                    id: qt.key.id
                },
                message: qt.message
            };

            const urls = Array.isArray(input) ? input : [input];
            const medias = [];

            for (let url of urls) {
                if (typeof url !== "string" && !Buffer.isBuffer(url)) continue;

                const file = await this.conn.getFile(url);
                const mime = file.mime.split("/")[0];

                if (mime === "image" || mime === "video") {
                    medias.push({
                        [mime]: file.data,
                        caption: opts.caption || ""
                    });
                    continue;
                }

                if (urls.length === 1) {
                    const msg = await this.conn.sendMessage(
                        jid,
                        mime === "audio"
                            ? {
                                  audio: file.data,
                                  mimetype: file.mime,
                                  ptt: opts.ptt || false
                              }
                            : {
                                  document: file.data,
                                  mimetype: file.mime,
                                  fileName: `file.${file.ext}`
                              },
                        { quoted }
                    );

                    if (opts.delete) this.conn.delete(msg.key, opts.time || global.delinterval);
                    return msg;
                }
            }

            if (medias.length <= 1) {
                const msg = await this.conn.sendMessage(jid, { ...medias[0] }, { quoted });
                if (opts.delete) this.conn.delete(msg.key, opts.time || global.delinterval);
                return msg;
            }

            const delayMs = !isNaN(opts.delay) ? opts.delay : 500;

            const album = generateWAMessageFromContent(
                jid,
                {
                    messageContextInfo: { messageSecret: crypto.randomBytes(32) },
                    albumMessage: {
                        expectedImageCount: medias.filter(v => v.image).length,
                        expectedVideoCount: medias.filter(v => v.video).length,
                        ...(qt
                            ? {
                                  contextInfo: {
                                      remoteJid: quoted.key.remoteJid,
                                      fromMe: quoted.key.fromMe,
                                      stanzaId: quoted.key.id,
                                      participant: quoted.key.participant || quoted.key.remoteJid,
                                      quotedMessage: quoted.message,
                                      ...(opts.mentions
                                          ? {
                                                mentionedJid: opts.mentions
                                            }
                                          : {})
                                  }
                              }
                            : {})
                    }
                },
                {
                    userJid: this.conn.user.id,
                    upload: this.conn.waUploadToServer
                }
            );
            await this.conn.relayMessage(album.key.remoteJid, album.message, {
                messageId: album.key.id
            });

            for (let m of medias) {
                const msg = await generateWAMessage(jid, m, {
                    upload: this.conn.waUploadToServer
                });

                msg.message.messageContextInfo = {
                    messageSecret: crypto.randomBytes(32),
                    messageAssociation: {
                        associationType: 1,
                        parentMessageKey: album.key
                    }
                };

                await this.conn.relayMessage(msg.key.remoteJid, msg.message, {
                    messageId: msg.key.id
                });

                if (opts.delete) this.conn.delete(msg.key, opts.time || 120000);
                await sleep(delayMs);
            }

            return album;
        };
        this.conn.sendButton = async (jid, array, quoted, json) => {
            const result = [];
            for (const pair of array) {
                const obj = {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: pair[0],
                        id: pair[1]
                    })
                };
                result.push(obj);
            }

            if (json.url) {
                let file = await this.conn.getFile(json.url, true);
                let mime = file.mime.split("/")[0];
                if (mime === "image") {
                    let msg = generateWAMessageFromContent(
                        jid,
                        {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    interactiveMessage: proto.Message.InteractiveMessage.create({
                                        body: proto.Message.InteractiveMessage.Body.create({
                                            text: json.body
                                        }),
                                        footer: proto.Message.InteractiveMessage.Footer.create({
                                            text: json.footer
                                        }),
                                        header: proto.Message.InteractiveMessage.Header.create({
                                            hasMediaAttachment: true,
                                            ...(await prepareWAMessageMedia({ image: { url: json.url } }, { upload: this.conn.waUploadToServer }))
                                        }),
                                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                            buttons: result
                                        }),
                                        contextInfo: {
                                            mentionedJid: [...this.conn.parseMention(json.body)],
                                            ...(quoted
                                                ? {
                                                      stanzaId: quoted.key.id,
                                                      remoteJid: quoted.isGroup ? quoted.sender : quoted.key.remoteJid,
                                                      participant: quoted.key.participant || quoted.sender,
                                                      fromMe: quoted.key.fromMe,
                                                      quotedMessage: quoted.message
                                                  }
                                                : {})
                                        }
                                    })
                                }
                            }
                        },
                        {}
                    );

                    return this.conn.relayMessage(msg.key.remoteJid, msg.message, {
                        messageId: msg.key.id
                    });
                } else if (mime === "video") {
                    let msg = generateWAMessageFromContent(
                        jid,
                        {
                            viewOnceMessage: {
                                message: {
                                    messageContextInfo: {
                                        deviceListMetadata: {},
                                        deviceListMetadataVersion: 2
                                    },
                                    interactiveMessage: proto.Message.InteractiveMessage.create({
                                        body: proto.Message.InteractiveMessage.Body.create({
                                            text: json.body
                                        }),
                                        footer: proto.Message.InteractiveMessage.Footer.create({
                                            text: json.footer
                                        }),
                                        header: proto.Message.InteractiveMessage.Header.create({
                                            hasMediaAttachment: true,
                                            ...(await prepareWAMessageMedia({ video: { url: json.url } }, { upload: this.conn.waUploadToServer }))
                                        }),
                                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                            buttons: result || [{ text: "" }]
                                        }),
                                        contextInfo: {
                                            mentionedJid: [...this.conn.parseMention(json.body)],
                                            ...(quoted
                                                ? {
                                                      stanzaId: quoted.key.id,
                                                      remoteJid: quoted.isGroup ? quoted.sender : quoted.key.remoteJid,
                                                      participant: quoted.key.participant || quoted.sender,
                                                      fromMe: quoted.key.fromMe,
                                                      quotedMessage: quoted.message
                                                  }
                                                : {})
                                        }
                                    })
                                }
                            }
                        },
                        {}
                    );

                    return this.conn.relayMessage(msg.key.remoteJid, msg.message, {
                        messageId: msg.key.id
                    });
                }
            } else {
                let msg = generateWAMessageFromContent(
                    jid,
                    {
                        viewOnceMessage: {
                            message: {
                                messageContextInfo: {
                                    deviceListMetadata: {},
                                    deviceListMetadataVersion: 2
                                },
                                interactiveMessage: proto.Message.InteractiveMessage.create({
                                    body: proto.Message.InteractiveMessage.Body.create({
                                        text: json.body
                                    }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({
                                        text: json.footer
                                    }),
                                    header: proto.Message.InteractiveMessage.Header.create({
                                        hasMediaAttachment: false
                                    }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        buttons: result || [{ text: "" }]
                                    }),
                                    contextInfo: {
                                        mentionedJid: [...this.conn.parseMention(json.body)],
                                        ...(quoted
                                            ? {
                                                  stanzaId: quoted.key.id,
                                                  remoteJid: quoted.isGroup ? quoted.sender : quoted.key.remoteJid,
                                                  participant: quoted.key.participant || quoted.sender,
                                                  fromMe: quoted.key.fromMe,
                                                  quotedMessage: quoted.message
                                              }
                                            : {})
                                    }
                                })
                            }
                        }
                    },
                    {}
                );
                return this.conn.relayMessage(msg.key.remoteJid, msg.message, {
                    messageId: msg.key.id
                });
            }
        };
        this.conn.getName = param => {
            let jid = this.conn.decodeJid(param);
            if (!jid) return "";
            if (jid.endsWith("@g.us")) {
                return db.data.store?.groupMetadata?.[jid]?.subject;
            } else if (jid.endsWith("@s.whatsapp.net")) {
                let contactData = db.data.store?.contacts?.[jid];
                if (contactData) {
                    return contactData.notify || contactData.verifiedName || jid;
                }
            } else if (jid.endsWith("@lid")) {
                const contact = Object.entries(db.data.store.contacts).find(([jid, data]) => data.id === jid);
                if (contact) {
                    return contact?.[1]?.notify || contact?.[1]?.verifiedName || jid;
                }
            } else {
                return jid;
            }
        };
        this.conn.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
            let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], "base64") : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
            let buffer;
            if (options && (options.packname || options.author)) {
                buffer = await writeExifImg(buff, options);
            } else {
                buffer = await imageToWebp(buff);
            }

            await this.conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
            return buffer;
        };
        this.conn.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
            let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], "base64") : /^https?:\/\//.test(path) ? await (await fetch(path)).buffer() : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0);
            let buffer;
            if (options && (options.packname || options.author)) {
                buffer = await writeExifVid(buff, options);
            } else {
                buffer = await videoToWebp(buff);
            }

            await this.conn.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted });
            return buffer;
        };
        this.conn.sendCarousel = async (jid, messages, quoted, json = {}, options = {}) => {
            let cards = [];

            for (let [body, footer, image, button = [], copy = [], url = []] of messages) {
                let file = await this.conn.getFile(image);
                let mimeType = file.mime.split("/")[0];
                let buttonArray = button.map(i => ({
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: i[0],
                        id: i[1]
                    })
                }));

                buttonArray.push(
                    ...copy.map(i => ({
                        name: "cta_copy",
                        buttonParamsJson: JSON.stringify({
                            display_text: i[0],
                            copy_code: i[1]
                        })
                    }))
                );

                buttonArray.push(
                    ...url.map(i => ({
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: i[0],
                            url: i[1],
                            merBott_url: i[1]
                        })
                    }))
                );

                let mediaData = await prepareWAMessageMedia(
                    mimeType === "image"
                        ? { image: file.data }
                        : mimeType === "video"
                          ? { video: file.data }
                          : {
                                document: file.data,
                                mimetype: file.mime,
                                fileName: `${crypto.randomUUID()}.${file.ext}`
                            },
                    { upload: await this.conn.waUploadToServer }
                );

                let msg = {
                    body: proto.Message.InteractiveMessage.Body.create({ text: body }),
                    footer: proto.Message.InteractiveMessage.Footer.create({
                        text: footer
                    }),
                    header: proto.Message.InteractiveMessage.Header.create({
                        hasMediaAttachment: true,
                        ...mediaData
                    }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                        buttons: buttonArray
                    }),
                    ...options,
                    contextInfo: {
                        mentionedJid: [...this.conn.parseMention(body), ...this.conn.parseMention(footer)]
                    }
                };

                cards.push(msg);
            }

            // Create the carousel message.
            let carouselMessage = await generateWAMessageFromContent(
                jid,
                {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: proto.Message.InteractiveMessage.create({
                                body: proto.Message.InteractiveMessage.Body.create({
                                    text: json.body
                                }),
                                footer: proto.Message.InteractiveMessage.Footer.create({
                                    text: json.footer
                                }),
                                header: proto.Message.InteractiveMessage.Header.create({
                                    hasMediaAttachment: false
                                }),
                                carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                                    cards
                                }),
                                ...options,
                                contextInfo: {
                                    mentionedJid: [...this.conn.parseMention(json.body), ...this.conn.parseMention(json.footer)]
                                }
                            })
                        }
                    }
                },
                {
                    userJid: this.conn.user.jid,
                    quoted: quoted,
                    upload: this.conn.waUploadToServer,
                    ...options
                }
            );
            await this.conn.relayMessage(jid, carouselMessage.message, {
                messageId: carouselMessage.key.id
            });
            return carouselMessage;
        };
        this.conn.reply = (jid, text = "", quoted, options) => {
            return Buffer.isBuffer(text)
                ? this.conn.sendFile(jid, text, "file", "", quoted, false, options)
                : this.conn.sendMessage(
                      jid,
                      { ...options, text, mentions: this.conn.parseMention(text) },
                      {
                          quoted,
                          ...options,
                          mentions: this.conn.parseMention(text)
                      }
                  );
        };
        this.conn.sendFile = async (jid, pathUrl, filename = "", caption = "", quoted, ptt = false, options = {}) => {
            const type = await this.conn.getFile(pathUrl, true);
            let { mime, data: buffer, ext } = type;
            let messageType = "";
            let mimetype = mime;
            if (options.asDocument) messageType = "document";
            else if (options.asSticker || /webp/.test(mime)) messageType = "sticker";
            else if (/image/.test(mime)) messageType = "image";
            else if (/video/.test(mime)) messageType = "video";
            else if (/audio/.test(mime)) {
                messageType = "audio";
                if (ptt) mimetype = "audio/ogg; codecs=opus";
            } else {
                messageType = "document";
            }
            const body = {
                [messageType]: buffer,
                caption: caption,
                mimetype: mimetype,
                fileName: filename,
                ...options
            };
            if (ptt) body.ptt = true;
            return await this.conn.sendMessage(jid, body, { quoted, ...options });
        };
        this.conn.downloadM = async (m, type, saveToFile) => {
            if (!m || !(m.url || m.directPath)) return Buffer.alloc(0);
            const stream = await downloadContentFromMessage(m, type);
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            if (saveToFile) var { filename } = await this.conn.getFile(buffer, true);
            return saveToFile && fs.existsSync(filename) ? filename : buffer;
        };
        this.conn.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
            let quoted = message.msg ? message.msg : message;
            let mime = (message.msg || message).mimetype || "";
            let messageType = message.mtype ? message.mtype.replace(/Message/gi, "") : mime.split("/")[0];

            const stream = await downloadContentFromMessage(quoted, messageType);
            let buffer = Buffer.from([]);

            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            let type = await fromBuffer(buffer);
            let trueFileName = attachExtension && type?.ext ? `${filename}.${type.ext}` : filename;

            await fs.writeFileSync(trueFileName, buffer);
            return trueFileName;
        };
        this.conn.parseMention = (text = "") => {
            let regex = /@([0-9]{5,16}|0)/g;
            let result = [];
            let match;
            while ((match = regex.exec(text)) !== null) {
                result.push(match[1] + "@s.whatsapp.net");
            }
            return result;
        };
        this.conn.format = (...args) => {
            return util.format(...args);
        };
        return this.conn;
    }
}
module.exports = Client;
