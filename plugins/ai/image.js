const ChatGPT = require("../../scraper/images.js");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const { fromBuffer } = require("file-type");

const tmp = path.join(process.cwd(), "tmp");
let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || "";
  if (!/image/.test(mime)) throw `* *Example :* ${usedPrefix+command} [Reply Or Send Image]`;
  if (!text) throw `* *Example :* ${usedPrefix+command} input your prompt`;

  await m.react("🪄");
  let chatgpt = new ChatGPT({ useAuth:
      "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5MzQ0ZTY1LWJiYzktNDRkMS1hOWQwLWY5NTdiMDc5YmQwZSIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSJdLCJjbGllbnRfaWQiOiJhcHBfWDh6WTZ2VzJwUTl0UjNkRTduSzFqTDVnSCIsImV4cCI6MTc3MzgwMTU3NiwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9hdXRoIjp7ImNoYXRncHRfYWNjb3VudF9pZCI6IjIwM2E4OTdhLWMyYmEtNDIyOS1iYTZhLWQ3YzQ0ODQwYjEyMiIsImNoYXRncHRfYWNjb3VudF91c2VyX2lkIjoidXNlci1hYkxoWWlQSUlEM29lVXplZGdMcDRZVXVfXzIwM2E4OTdhLWMyYmEtNDIyOS1iYTZhLWQ3YzQ0ODQwYjEyMiIsImNoYXRncHRfY29tcHV0ZV9yZXNpZGVuY3kiOiJub19jb25zdHJhaW50IiwiY2hhdGdwdF9wbGFuX3R5cGUiOiJ0ZWFtIiwiY2hhdGdwdF91c2VyX2lkIjoidXNlci1hYkxoWWlQSUlEM29lVXplZGdMcDRZVXUiLCJ1c2VyX2lkIjoidXNlci1hYkxoWWlQSUlEM29lVXplZGdMcDRZVXUifSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9wcm9maWxlIjp7ImVtYWlsIjoibmF6aXI5OWlxQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwiaWF0IjoxNzcyOTM3NTc1LCJpc3MiOiJodHRwczovL2F1dGgub3BlbmFpLmNvbSIsImp0aSI6IjdmMzZkNTA1LWNiZTgtNGM0Yy1iODA2LTVhZGU2MTFlOThkMCIsIm5iZiI6MTc3MjkzNzU3NSwicHdkX2F1dGhfdGltZSI6MTc3MjkzNzU3NDUwNSwic2NwIjpbIm9wZW5pZCIsImVtYWlsIiwicHJvZmlsZSIsIm9mZmxpbmVfYWNjZXNzIiwibW9kZWwucmVxdWVzdCIsIm1vZGVsLnJlYWQiLCJvcmdhbml6YXRpb24ucmVhZCIsIm9yZ2FuaXphdGlvbi53cml0ZSJdLCJzZXNzaW9uX2lkIjoiYXV0aHNlc3NfekJMTTJUcFJXVlFlYTVSV3FGeENsMXhWIiwic2wiOnRydWUsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTAwOTgyNzIzNDA4NzU4NjE0NjY3In0.jhIIEyTm4Kcw7VHYFTFsu9xpFAyKz36fucQQrYefgS7yZPWOwaO0fkzUBE0s0gDs6XdH3Tf-sAkn7-9iIVNzzCoX-VUyGaSkCTUjHXQEKmbwh_PWzIM8zu2Fb-_xOfStIfADnW-bkGoGlhYU_kWxdCZgzuHfOpwqgyQXeyq6IDs7PlDTH1XD13XBKCCE5IMLLiXeQGHJ3kEYQhxG3kFfLBKVzMWU5gIU-cw7iCzUJyCKtGWDPVJ22EwGt2B-zrvRzXJhyrA9XK57v1di9RTOh9_aFZ0vUOkaCgzKvXv5QQRC1jurVN3625n7WwqaPaXpj2PjmfaaiXfJ4xMrdJCm_HztqTYoa3tXRs7kVeyHIpWCxlz40XQp__XmaQnwErx1UZ9r6SXTrvLDlYzG0atpHXfQ8sIIz6UMthyrQowYfgw_DpO6wfBsf_i-u9qM982mxzCvtLAvkD0Y_tWo2KfKsVpQMv5V97p8y3D7LQyw11YbqwylolwIGZ0KbVjGpQWWwIlnJm2zAVa_EWQ3ZHNNeQpBngkKUHk0cRmLVaHoGSUu4T3za40gvmf-qw0iuIKlNdcsMmecLMCEiQixUsC4pVBkEEInXHg8D38IcLqxCAVC7KnlztV-w7YZhDJjbECkCGHTD5WqI1X1XievfNR72rwywqhajkCgmn0bry8WZBE"
  });
  try {
    let img = await q.download();
    const inExt = await fromBuffer(img);
    const id = crypto.randomBytes(6).toString("hex");
    const i = path.join(tmp, `${id}.${inExt}`);
    await fs.writeFile(i, img);
    let result = await chatgpt.runImageEdit(text, i);
    let hasil = await chatgpt.getMedia(result.file_id)
    await conn.sendMessage(m.chat, { image: hasil, caption: `Here @${m.sender.split('@')[0]}, ${result.subtitle || ""}`, mentions: [m.sender ]}, { quoted: m })
  } catch (e) {
    console.log(e)
    m.reply(e.message);
  }
};

handler.help = ["editimg", "imagen", "nanobanana", "img2img"].map(a => a + " [Prompt]");
handler.tags = ["ai", "tools"];
handler.command = ["editimg", "imagen", "nanobanana", "img2img"];
handler.limit = true;

module.exports = handler;
