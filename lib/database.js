module.exports = async m => {
  if (m.chat.endsWith("@newsletter") || m.sender.endsWith("@newsletter")) return
  const isNumber = x => typeof x === "number" && !isNaN(x);
  const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms));
  let user = global.db.data.users[m.sender];
  if (typeof user !== "object") global.db.data.users[m.sender] = {};
  if (user) {
    if (!isNumber(user.exp)) user.exp = 0;
    if (!isNumber(user.limit)) user.limit = 100;
    if (!isNumber(user.saldo)) user.saldo = 1000;
    if (!isNumber(user.money)) user.money = 100000;
    if (!isNumber(user.bank)) user.bank = 100000;
    if (!("registered" in user)) user.registered = false;
    if (!user.registered) {
      if (!("name" in user)) user.name = m.name;
      if (!isNumber(user.age)) user.age = -1;
      if (!isNumber(user.regTime)) user.regTime = -1;
    }
    if (!isNumber(user.afk)) user.afk = -1;
    if (!("afkReason" in user)) user.afkReason = "";
    if (!("premium" in user)) user.premium = false;
    if (!("moderator" in user)) user.moderator = false;
    if (!("banned" in user)) user.banned = false;
    if (!("groupMention" in user)) user.groupMention = false;
    if (!isNumber(user.warn)) user.warn = 0;
    if (!isNumber(user.level)) user.level = 1;
    if (!("link" in user)) user.LinkWarn = 0;
    if (!isNumber(user.chat)) user.chat = 0;
  } else
    global.db.data.users[m.sender] = {
      exp: 0,
      limit: 100,
      saldo: 1000,
      money: 100000,
      bank: 100000,
      registered: false,
      name: m.name,
      age: 0,
      regTime: -1,
      premium: false,
      moderator: false,
      banned: false,
      warn: 0,
      level: 1,
      link: 0,
      afk: -1,
      afkReason: "",
      chat: 0
    };
  if (m.chat.endsWith("g.us")) {
    let chat = global.db.data.chats[m.chat];
    if (typeof chat !== "object") global.db.data.chats[m.chat] = {};
    if (chat) {
      if (!("isBanned" in chat)) chat.isBanned = false;
      if (!("welcome" in chat)) chat.welcome = false;
      if (!("antibot" in chat)) chat.antibot = false;
      if (!("antiSticker" in chat)) chat.antiSticker = false;
      if (!("antiToxic" in chat)) chat.antiToxic = false;
      if (!("antiLink" in chat)) chat.antiLink = false;
      if (!("antiLinkCh" in chat)) chat.antiLinkCh = false;
      if (!("antiVideo" in chat)) chat.antiVideo = false;
      if (!("antiTagsw" in chat)) chat.antiTagsw = false
      if (!isNumber(chat.chat)) chat.chat = 0;
    } else {
      global.db.data.chats[m.chat] = {
        isBanned: false,
        welcome: false,
        antibot: false,
        antiSticker: false,
        antiTagsw: false,
        antiToxic: false,
        antiLinkCh: false,
        antiLink: false,
        antiVideo: false,
        chat: 0
      };
    }
  }
  let settings = global.db.data.settings;
  if (typeof settings !== "object") global.db.data.settings = {};
  if (settings) {
    if (!("autodownload" in settings)) settings.autodownload = false;
    if (!("gconly" in settings)) settings.gconly = false;
    if (!("anticall" in settings)) settings.anticall = true;
    if (!("blockcmd" in settings)) settings.blockcmd = [];
    if (!("pconly" in settings)) settings.pconly = false;
    if (!("self" in settings)) settings.self = false;
    if (!("nyimak" in settings)) settings.nyimak = false;
    if (!("swonly" in settings)) settings.swonly = false;
    if (!("autoread" in settings)) settings.autoread = false;
    if (!("alias" in settings)) settings.alias = {};
    if (!("input" in settings)) settings.input = {};
    if (!("mute" in settings)) settings.mute = [];
  } else
    global.db.data.settings = {
      autodownload: false,
      anticall: true,
      mute: [],
      self: false,
      gconly: false,
      swonly: false,
      autoread: false,
      pconly: false,
      proxy: false,
      nyimak: false,
      blockcmd: [],
      alias: {},
      input: {}
    };
};
