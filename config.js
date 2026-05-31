const axios = require("axios");

/*--------[ OWNER ]------------*/
global.owner = ["62882020203777", "6283189934621"];
global.ownername = "Nazir";

/*--------[ SYSTEM ]------------*/
global.sessionname = "sessions";

global.autodel = true; //auto delete media when interval
global.delinterval = 5 * 60 * 1000;//auti delete 

global.useProxy = true; //menggunakan proxy jika vps hosting seperti digital ocean dll
global.proxyUrl = "https://api.nazirr.space/proxy/";
  
/*--------[ Apikey ]------------*/
global.hf_token = ""; //dari https://huggingface.co/settings/tokens untuk ai btw



/*--------[ UTILITY ]------------*/
global.dash = "https://i.pinimg.com/736x/21/fb/82/21fb8233cd82f2524b435f78706019cb.jpg"; //masukin thumbnail daahboard menu #deprecated

global.namebot = "VBOT"; //Linked Your Name Bot
global.wait = "*( Loading )* please wait...";
global.eror = msg =>
    JSON.stringify(
        {
            [`@typeof/${namebot}`]: {
                error: true,
                message: msg
            }
        },
        null,
        2
    );
global.done = "> Status : `Success`";

/*--------[ STICKER ]------------*/
global.wm = "© Nazir";
global.author = "\nNazir";

/*--------[ FUNCITIONS ]------------*/
global.Func = new (require(process.cwd() + "/lib/func"))();
global.axios = require("axios");
global.cheerio = require("cheerio");
global.Uploader = require("./lib/uploader");

global.fakeDoc = Buffer.from("89504E470D0A1A0A0000000D4948445200000001000000010802000000907753DE0000000A4944415408D76360000000020001E226059B0000000049454E44AE426082", "hex"); //1px fake

function pickRandom(list) {
    return list[Math.floor(list.length * Math.random())];
}

let fs = require("fs");
let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log("Update config.js");
    delete require.cache[file];
    require(file);
});
