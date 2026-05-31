/** @format */

const fs = require("fs");
const { exec } = require("child_process");
const { smsg } = require("./lib/serialize.js");
const { protoType } = require("./lib/protoType");
const rules = require("./lib/system-role.js");
const chalk = require("chalk");
const util = require("util");
const isNumber = x => typeof x === "number" && !isNaN(x);
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms));

module.exports = async (msg, conn) => {
    let JidName;
    let m = msg;
    if (m.chat.endsWith("@newsletter") || m.sender.endsWith("@newsletter")) return;
    await protoType();
    try {
        m.exp = 0;
        m.limit = false;
        try {
            await require("./lib/database.js")(m);
        } catch (e) {
            if (/(returnoverlimit|timed|timeout|users|item|time)/gi.test(e.message)) return;
            console.error(e);
        }
        const isROwner = Array.isArray(global.owner) ? global.owner.map(v => `${v}@s.whatsapp.net`).includes(m.sender) : false;
        const isOwner = isROwner || m.fromMe;
        const isMods = global.db.data.users[m.sender]?.moderator || false;
        const isPrems = global.db.data.users[m.sender]?.premium || false;
        if (m.isGroup && global.db.data.chats[m.chat]) {
            global.db.data.chats[m.chat].chat += 1;
        }
        if (global.db.data.users[m.sender]) {
            if (isROwner) {
                global.db.data.users[m.sender].premium = true;
                global.db.data.users[m.sender].premiumDate = "PERMANENT";
                global.db.data.users[m.sender].limit = "PERMANENT";
                global.db.data.users[m.sender].moderator = true;
            } else if (isPrems) {
                global.db.data.users[m.sender].limit = "PERMANENT";
            }
            global.db.data.users[m.sender].chat += 1;
        }
        if (typeof m.text !== "string") m.text = "";
        m.exp += Math.ceil(Math.random() * 1000);
        let usedPrefix;
        let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender];
        let groupMetadata = {};
        if (m.isGroup) {
            groupMetadata = db.data.store.groupMetadata[m.chat] || (await conn.groupMetadata(m.chat).catch(() => ({})));
        }
        const participants = m.isGroup ? groupMetadata.participants : [];
        const user = m.isGroup ? participants.find(u => conn.decodeJid(u.id) === m.sender) : m.sender;
        const bot = m.isGroup ? participants.find(u => conn.decodeJid(u.jid || u.phoneNumber || u.id) === conn.decodeJid(conn.user.id || conn.user.lid)) : conn.decodeJid(conn.user.jid || conn.user.phoneNumber || conn.user.id || conn.user.lid);
        const groupAdmin =
            m.isGroup &&
            participants.reduce(
                (memberAdmin, memberNow) =>
                    (memberNow.admin
                        ? memberAdmin.push({
                              user: memberNow.phoneNumber,
                              admin: memberNow.admin
                          })
                        : [...memberAdmin]) && memberAdmin,
                []
            );
        const isRAdmin = (m.isGroup && !!groupAdmin.find(member => member.user === m.sender && member.admin === "superadmin")) || false;
        const isAdmin = (m.isGroup && !!groupAdmin.find(member => member.user === m.sender)) || false;
        const isBotAdmin = (bot && bot.admin) || false;
        for (let name in global.plugins) {
            var plugin;
            if (typeof global.plugins[name].code === "function") {
                var ai = global.plugins[name];
                plugin = ai.code;
                for (var prop in ai) {
                    if (prop !== "run") {
                        plugin[prop] = ai[prop];
                    }
                }
            } else {
                plugin = global.plugins[name];
            }
            if (!plugin) continue;
            if (plugin.disabled) continue;
            if (typeof plugin.all === "function") {
                try {
                    await plugin.all.call(conn, m);
                } catch (e) {
                    if (/(overlimit|timed|timeout|users|item|time)/gi.test(e.message)) return;
                    console.error(e);
                }
            }
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
            let _prefix = new RegExp("^[" + "‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-".replace(/[|\\{}()[\]^$+*?.\-\^]/g, "\\$&") + "]");
            let match = (
                _prefix instanceof RegExp
                    ? [[_prefix.exec(m.text), _prefix]]
                    : Array.isArray(_prefix)
                      ? _prefix.map(p => {
                            let re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
                            return [re.exec(m.text), re];
                        })
                      : typeof _prefix === "string"
                        ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
                        : [[[], new RegExp()]]
            ).find(p => p[1]);
            if (typeof plugin.before === "function")
                if (
                    await plugin.before.call(conn, m, {
                        match,
                        conn: conn,
                        groupAdmin,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isROwner,
                        isOwner,
                        isRAdmin,
                        isAdmin,
                        isBotAdmin,
                        isPrems
                    })
                )
                    continue;
            if (await rules(m, { conn, isROwner, isOwner, isPrems, isBotAdmin, isAdmin, isRAdmin, groupMetadata })) return;
            const q = m.quoted ? m.quoted : m;
            if (match && m) {
                let result = (match[0] || "")[0];
                usedPrefix = result;
                let noPrefix;
                if (isOwner) {
                    noPrefix = !result ? m.text : m.text.replace(result, "");
                } else {
                    noPrefix = !result ? "" : m.text.replace(result, "").trim();
                }
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v);
                args = args || [];
                let _args = noPrefix.trim().split(" ").slice(1);
                let text = "";
                if (m.quoted && m.quoted.text && !_args) {
                    text = command ? m.quoted.text.slice(command.length + 1) : m.quoted.text;
                } else {
                    text = _args.join(" ");
                }
                command = (command || "").toLowerCase();
                let fail = plugin.fail || global.dfail;
                const prefixCommand = !result ? plugin.customPrefix || plugin.command : plugin.command;
                let isAccept = (prefixCommand instanceof RegExp && prefixCommand.test(command)) || (Array.isArray(prefixCommand) && prefixCommand.some(cmd => (cmd instanceof RegExp ? cmd.test(command) : cmd === command))) || (typeof prefixCommand === "string" && prefixCommand === command);
                m.prefix = !!result;
                usedPrefix = !result ? "" : result;
                if (!isAccept) continue;
                m.plugin = name;
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat];
                    let user = global.db.data.users[m.sender];
                }
                if (global.db.data.settings.blockcmd.includes(command)) {
                    fail("block", m, conn);
                    continue;
                }
                if (plugin.rowner && !isROwner) {
                    fail("rowner", m, conn);
                    continue;
                }
                if (plugin.owner && !isOwner) {
                    fail("owner", m, conn);
                    continue;
                }
                if (plugin.mods && !isMods) {
                    fail("mods", m, conn);
                    continue;
                }
                if (plugin.premium && !isPrems) {
                    fail("premium", m, conn);
                    continue;
                }
                if (plugin.group && !m.isGroup) {
                    fail("group", m, conn);
                    continue;
                } else if (plugin.botAdmin && !isBotAdmin) {
                    fail("botAdmin", m, conn);
                    continue;
                } else if (plugin.admin && !isAdmin) {
                    fail("admin", m, conn);
                    continue;
                }
                if (plugin.private && m.isGroup) {
                    fail("private", m, conn);
                    continue;
                }
                if (plugin.register && global.db.data.users[m.sender]?.registered === false) {
                    fail("unreg", m, conn);
                    continue;
                }
                let cmd;
                m.command = command;
                m.isCommand = true;
                if (m.isCommand) {
                    await conn.sendPresenceUpdate("composing", m.chat);
                }
                let xp = "exp" in plugin ? parseInt(plugin.exp) : 17;
                if (xp > 9999999999999999999999) m.reply("Ngecit -_-");
                else m.exp += xp;

                if (plugin.level > _user.level) {
                    let level = `*[ THE LEVEL IS NOT ENOUGH ]*\n> • _Kamu Perlu level *[ ${plugin.level} ]*, untuk mengakses ini, silahkan main minigame atau RPG untuk meningkatkan level anda_`;
                    conn.sendMessage(
                        m.chat,
                        {
                            text: level
                        },
                        { quoted: m }
                    );
                    continue;
                }

                let _limit = 0;
                if (plugin.limit === true) {
                    _limit = 1;
                } else if (typeof plugin.limit === "number" && plugin.limit > 0) {
                    _limit = plugin.limit;
                }
                let limitCost = _limit;

                if (!isPrems && _limit > 0) {
                    let currentLimit = global.db.data.users[m.sender]?.limit || 0;
                    if (typeof currentLimit === "number" && currentLimit < _limit) {
                        let limit = `*[ YOUR LIMIT HAS EXPIRED ]*\n> • _Limit anda telah habis atau tidak cukup. Dibutuhkan *${_limit}* limit untuk perintah ini. Limit Anda saat ini: *${currentLimit || 0}*.\nSilahkan tunggu 24 jam untuk mereset limit anda, atau upgrade ke premium untuk mendapatkan unlimited limit._`;
                        conn.sendMessage(m.chat, { text: limit }, { quoted: m });
                        continue;
                    }
                }
                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: conn,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems
                };
                try {
                    await plugin.call(conn, m, extra);

                    if (!isPrems && _limit > 0 && global.db.data.users[m.sender]) {
                        global.db.data.users[m.sender].limit -= limitCost;
                        m.limit = _limit;
                    }
                } catch (e) {
                    if (/(overlimit|timed|timeout|users|item|time)/gi.test(e.message)) return;
                    if (text.match("rate-overlimit")) return;
                    if (e.name) {
                        for (let jid of global.owner) {
                            let data = (await conn.onWhatsApp(jid))[0] || {};
                            if (data.exists)
                                conn.reply(
                                    data.jid,
                                    `*[ REPORT ERROR ]*
*• Name Plugins :* ${m.plugin}
*• From :* @${m.sender.split("@")[0]} *(wa.me/${m.sender.split("@")[0]})*
*• Jid Chat :* ${m.chat} 
*• Command  :* ${m.text}

*• Error Log :*
\`\`\`${util.format(e)}\`\`\`
`.trim(),
                                    m
                                );
                        }
                        m.reply("*[ system notice ]* Terjadi kesalahan pada bot !");
                    } else {
                        m.reply(e);
                    }
                } finally {
                    await conn.sendPresenceUpdate("available", m.chat);
                    if (typeof plugin.after === "function") {
                        try {
                            await plugin.after.call(conn, m, extra);
                        } catch (e) {
                            if (/(overlimit|timed|timeout|users|item|time)/gi.test(e.message)) return;
                            if (e.message.match("rate-overlimit")) return;
                        }
                    }
                }
                break;
            }
        }
    } catch (e) {
        if (/(overlimit|timed|timeout|users|item|time)/gi.test(e.message)) return;
        console.error(e);
    } finally {
        let stats = global.db.data.stats;
        if (m.plugin) {
            let now = +new Date();

            if (!(m.plugin in stats)) {
                stats[m.plugin] = {
                    total: 0,
                    success: 0,
                    last: 0,
                    lastSuccess: 0,
                    command: null
                };
            }
            stat = stats[m.plugin];
            stat.total += 1;
            stat.last = now;
            if (m.error == null) {
                stat.success += 1;
                stat.lastSuccess = now;
            }
            if (!stat.command) {
                stat.command = m.command;
            }
        }
        try {
            require("./lib/print.js")(m, conn, JidName);
        } catch (e) {
            console.log(m, m.quoted, e);
        }
    }
};
global.dfail = (type, m, conn) => {
    let msg = {
        rowner: `*– REAL OWNER ONLY*
Fitur ini hanya dapat digunakan oleh Real Owner bot saja !`,
        owner: `*– OWNER ONLY*
Fitur ini hanya dapat digunakan oleh Owner bot saja !`,
        mods: `*– MODERATOR ONLY*
Fitur ini hanya dapat digunakan oleh Moderator bot saja !`,
        group: `*– GROUP ONLY*
Fitur ini hanya dapat digunakan di dalam Grup saja !`,
        private: `*– PRIVATE ONLY*
Fitur ini hanya dapat digunakan di dalam Private Chat saja !`,
        admin: `*– ADMIN ONLY*
Fitur ini hanya dapat digunakan oleh Admin Grup saja !`,
        botAdmin: `*– BOT NOT ADMIN*
Jadikan bot sebagai admin untuk menggunakan fitur ini !`,
        block: `*– BLOCKED COMMAND*
Fitur ini telah di nonaktifkan oleh Owner !`,
        unreg: `*– REGISTER FIRST*
Silahkan daftar terlebih dahulu untuk menggunakan fitur ini !`,
        premium: `*– PREMIUM ONLY*
Fitur ini khusus untuk pengguna Premium saja !`
    }[type];
    if (msg) {
        return conn.sendMessage(
            m.chat,
            {
                text: msg
            },
            { quoted: m }
        );
    }
};

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log("Update 'handler.js'");
    delete require.cache[file];
    if (global.reloadHandler) console.log(global.reloadHandler());
});
