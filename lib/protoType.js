const FileType = require("file-type");
const fs = require("fs");
const path = require("path");
const pino = require("pino");

const { Uguu } = require("./uploader");

exports.protoType = () => {
    // Converts a Buffer to ArrayBuffer
    Buffer.prototype.toArrayBuffer = function toArrayBufferV2() {
        const ab = new ArrayBuffer(this.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < this.length; ++i) {
            view[i] = this[i];
        }
        return ab;
    };

    // Converts an ArrayBuffer to Buffer
    ArrayBuffer.prototype.toBuffer = function toBuffer() {
        return Buffer.from(new Uint8Array(this));
    };

    // Identifies the file type of a Uint8Array, ArrayBuffer, or Buffer
    Uint8Array.prototype.getFileType =
    ArrayBuffer.prototype.getFileType =
    Buffer.prototype.getFileType =
    async function getFileType() {
        return await FileType.fromBuffer(this);
    };

    // Checks if a string or number is numeric
    String.prototype.isNumber = Number.prototype.isNumber = isNumber;
    
    function isNumber() {
        const int = parseInt(this);
        return typeof int === "number" && !isNaN(int);
    }

    // Capitalizes the first character of a string
    String.prototype.capitalize = function capitalize() {
        return this.charAt(0).toUpperCase() + this.slice(1, this.length);
    };

    // Capitalizes each word in a string
    String.prototype.capitalizeV2 = function capitalizeV2() {
        const str = this.split(" ");
        return str.map(v => v.capitalize()).join(" ");
    };

    // Decodes a JID (Jabber ID)
    String.prototype.decodeJid = function decodeJid() {
        const jidDecode = (jid) => {
            const sepIdx = typeof jid === "string" ? jid.indexOf("@") : -1;
            if (sepIdx < 0) return undefined;

            const server = jid.slice(sepIdx + 1);
            const userCombined = jid.slice(0, sepIdx);

            const deviceIdx = userCombined.indexOf(":");
            const user = deviceIdx >= 0 ? userCombined.slice(0, deviceIdx) : userCombined;
            const device = deviceIdx >= 0 ? userCombined.slice(deviceIdx + 1) : undefined;

            const agentIdx = user.indexOf("_");
            const userOnly = agentIdx >= 0 ? user.slice(0, agentIdx) : user;
            const agent = agentIdx >= 0 ? user.slice(agentIdx + 1) : undefined;

            return {
                user: userOnly,
                server,
                device,
                agent
            };
        };

        if (/:\d+@/gi.test(this)) {
            const decode = jidDecode(this) || {};
            return (
                (decode.user && decode.server && decode.user + "@" + decode.server) ||
                this
            ).trim();
        } else return this.trim();
    };

    // Converts milliseconds into a human-readable time string
    Number.prototype.toTimeString = function toTimeString() {
        const seconds = Math.floor((this / 1000) % 60);
        const minutes = Math.floor((this / (60 * 1000)) % 60);
        const hours = Math.floor((this / (60 * 60 * 1000)) % 24);
        const days = Math.floor(this / (24 * 60 * 60 * 1000));
        return (
            (days ? `${days} day(s) ` : "") +
            (hours ? `${hours} hour(s) ` : "") +
            (minutes ? `${minutes} minute(s) ` : "") +
            (seconds ? `${seconds} second(s)` : "")
        ).trim();
    };

    // Picks a random item from an array or a string
    Number.prototype.getRandom =
    String.prototype.getRandom =
    Array.prototype.getRandom =
    getRandom;

    function getRandom() {
        if (Array.isArray(this) || this instanceof String)
            return this[Math.floor(Math.random() * this.length)];
        return Math.floor(Math.random() * this);
    }

    // Detect if a string is a URL
    String.prototype.isUrl = function isUrl() {
        return this.match(
            new RegExp(
                /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/,
                "gi"
            )
        );
    };

    // Dynamically import a module
    String.prototype.import = function aselole() {
        return module.require(this);
    };
  
 /**
 * Check if a string is a valid email
 * @returns {Boolean}
 */
String.prototype.isValidEmail = function ValidEmail() {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(this);
  };
  /**
  * Get Size File with Numbers
  * @returns {Numbers}
  */
 String.prototype.getSize = async function getSize() {
    let header = await (await axios.get(this)).headers;
    return this.formatSize(header["content-length"]);
  }
 Buffer.prototype.upload = async function upload() {
      return Uguu(this)
   }
};

