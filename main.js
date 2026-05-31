require("./config");
const starting = require("./lib/logstart.js")
const Client = require("./app");
const { Low, TextFile } = require("lowdb");
const path = require("node:path");
const { promisify } = require("node:util");
const { pathToFileURL } = require("node:url");
const cron = require("node-cron");
const fs = require("fs");
const baileys = require("baileys");
const chokidar = require("chokidar");
const { smsg, getPn } = require("./lib/serialize.js");
const chalk = require("chalk")
const dbPath = path.join(__dirname, "database.json");
const tmpPath = path.join(__dirname, "tmp");
const PLUGIN_DIR = path.resolve(__dirname, "plugins");

const stat = promisify(fs.stat);
const dbStructure = {
    users: {},
    chats: {},
    stats: {},
    settings: {},
    store: {
        contacts: {},
        groupMetadata: {},
        chats: {}
    }
};

if (!fs.existsSync(tmpPath))
    fs.mkdirSync(tmpPath, {
        recursive: true
    });

class DbConfig {
    constructor(filename) {
        this.adapter = new TextFile(filename);
    }
    async read() {
        const data = await this.adapter.read();
        return data === null ? null : JSON.parse(data);
    }
    async write(obj) {
        return this.adapter.write(JSON.stringify(obj));
    }
}

(async () => {
    starting();
    const dirPath = path.join(__dirname, "tmp");
    if (!fs.existsSync(dirPath))
        fs.mkdirSync(dirPath, {
            recursive: true
        });
    const dbFilePath = path.join(__dirname, "database.json");
    const adapter = new DbConfig(dbFilePath);
    global.db = new Low(adapter, dbStructure);
    global.loadDatabase = async () => {
        try {
            await global.db.read();
            global.db.data = global.db.data || dbStructure;
            if (global.db.data) {
                global.db.data.users = global.db.data.users || {};
                global.db.data.chats = global.db.data.chats || {};
                global.db.data.stats = global.db.data.stats || {};
                global.db.data.settings = global.db.data.settings || {};
                global.db.data.store = global.db.data.store || {
                    contacts: {},
                    groupMetadata: {},
                    chats: {}
                };
            }
            setInterval(async () => {
                await global.db.write();
            }, 5000);
        } catch {
            global.db.data = dbStructure;
        }
    };
    loadDatabase();
    loadAllplugin();
    const config = {
        sessions: global.sessionname,
        pairing: true,
        browsers: baileys.Browsers.macOS("Safari")
    };
    let bot = new Client(config, baileys);
    let conn = await bot.connect();
    global.conn = conn;
    cron.schedule(
        "0 6 * * *",
        async () => {
            let users = global.db.data.users;
            let groups = Object.keys(db.data.store.groupMetadata);
            let resetCount = 0;

            Object.keys(users).forEach(id => {
                if (users[id].limit < 100) {
                    users[id].limit = 100;
                    resetCount++;
                }
            });

            if (resetCount > 0) {
                for (let jid of groups) {
                    await conn
                        .sendMessage(jid, {
                            text: `*乂 R E S E T - L I M I T*\n\nLimit telah direset menjadi *100* untuk semua user.`
                        })
                        .catch(() => null);
                }
            }
        },
        {
            scheduled: true,
            timezone: "Asia/Makassar"
        }
    );
    function BindBot(conn) {
        conn.ev.on("contacts.update", update => {
            for (let contact of update) {
                let id = baileys.jidNormalizedUser(getPn(contact.id));
                if (db.data.store && db.data.store.contacts) {
                    db.data.store.contacts[id] = {
                        ...(db.data.store.contacts?.[id] || {}),
                        ...(contact || {})
                    };
                }
            }
        });
        conn.ev.on("contacts.upsert", update => {
            for (let contact of update) {
                let id = baileys.jidNormalizedUser(contact.id);
                if (db.data.store && db.data.store.contacts) db.data.store.contacts[id] = { ...(contact || {}), isContact: true };
            }
        });
        conn.ev.on("groups.update", async updates => {
            for (const update of updates) {
                try {
                    const id = update.id;
                    if (!id) continue;
                    const metadata = await conn.groupMetadata(id).catch(() => null);
                    if (!metadata) continue;
                    db.data.store.groupMetadata[id] = {
                        ...(db.data.store.groupMetadata[id] || {}),
                        ...(update || {}),
                        ...metadata
                    };
                } catch (e) {
                    console.error("Error update group metadata:", e);
                }
            }
        });
      conn.ev.on("group-participants.update", async anu => {
            try {
                const { id, participants, action } = anu;
                const metadata = await conn.groupMetadata(id).catch(() => null);
                if (!metadata) return;
    
                db.data.store.groupMetadata[id] = {
                    ...(db.data.store.groupMetadata[id] || {}),
                    ...metadata
                };
    
                for (let jid of participants) {
                    let jidStr = typeof jid === 'string' ? jid : (jid.id || jid.jid || "");
                    jidStr = conn.decodeJid(jidStr);
                    if (!jidStr || typeof jidStr !== "string") continue;
                }
            } catch (e) {
                console.error(e);
            }
        });
        conn.ev.on("messages.upsert", async cht => {
            if (cht.messages.length === 0) return;
            const chatUpdate = cht.messages[0];
            if (!chatUpdate.message) return;
            if (chatUpdate.message?.protocolMessage) return
            chatUpdate.message = Object.keys(chatUpdate.message)[0] === "ephemeralMessage" ? chatUpdate.message.ephemeralMessage.message : chatUpdate.message;
            let m = smsg(chatUpdate, conn);
            await require("./handler.js")(m, conn);
        });
    }

    BindBot(conn);
    bot.onReconnect = (newConn) => {
        global.conn = newConn;
        BindBot(newConn);
    };
    process.on("uncaughtException", console.error);
    process.on("unhandledRejection", console.error);

    async function loadAllplugin(t) {
        let plugins = {};
        let isReady = false;
        let frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
        let i = 0;
        
        let spinner = setInterval(() => {
            if (!isReady) {
                process.stdout.write(`\r${chalk.cyan(frames[i])} Loading plugins...`);
                i = (i + 1) % frames.length;
            }
        }, 100);

        async function loadPlugin(file) {
            const resolved = path.resolve(file);
            const key = path.relative(process.cwd(), resolved).replace(/\\/g, "/");
            const isESM = resolved.endsWith(".mjs");
            delete plugins[key];
            try {
                let mod;
                if (isESM) {
                    mod = await import(pathToFileURL(resolved).href + "?t=" + Date.now());
                    mod = mod.default ?? mod;
                } else {
                    try {
                        delete require.cache[require.resolve(resolved)];
                    } catch {}
                    mod = require(resolved);
                }
                plugins[key] = mod;
                global.plugins = plugins;
            } catch (err) {
                if (isReady) {
                    console.error("\n[ PLUGIN ERROR ]", key);
                    console.error(err);
                }
                delete plugins[key];
            }
        }

        function unloadPlugin(file) {
            const key = path.relative(process.cwd(), path.resolve(file)).replace(/\\/g, "/");
            delete plugins[key];
            try {
                delete require.cache[require.resolve(file)];
            } catch {}
            global.plugins = plugins;
        }

        const watcher = chokidar.watch(PLUGIN_DIR, {
            persistent: true,
            ignoreInitial: false,
            awaitWriteFinish: false
        });
      
        watcher.on("add", file => {
            if (!/\.(js|mjs)$/.test(file)) return;
            loadPlugin(file);
            if (isReady) {
                console.log(chalk.cyan.bold(`[ Load ] `) + chalk.white(file.split('plugins/')[1]));
            }
        });
      
        watcher.on("change", file => {
            if (!/\.(js|mjs)$/.test(file)) return;
            loadPlugin(file);
            console.log(chalk.yellow.bold(`[ CHANGE ] `) + chalk.white(file.split('plugins/')[1]));
        });
      
        watcher.on("unlink", file => {
            if (!/\.(js|mjs)$/.test(file)) return;
            unloadPlugin(file);
            console.log(chalk.red.bold(`[ DELETE ] `) + chalk.white(file.split('plugins/')[1]));
        });

        watcher.on("ready", () => {
            isReady = true;
            clearInterval(spinner);
            const count = Object.keys(plugins).length;
            process.stdout.write(`\r${chalk.green("✓")} loaded ${count} plugins\n`);
            plugins = Object.fromEntries(Object.entries(plugins).sort(([a], [b]) => a.localeCompare(b)));
            global.plugins = plugins;
        });
    }
})();
