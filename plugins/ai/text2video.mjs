// Dibuat oleh UBED - Dilarang keras menyalin tanpa izin!
// Plugin ESM untuk mengonversi teks menjadi video menggunakan API GPT Text To Video.

import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const fkontak = {
        key: {
            participant: '0@s.whatsapp.net',
            remoteJid: "0@s.whatsapp.net",
            fromMe: false,
            id: "Halo",
        },
        message: {
            conversation: `🎥 Text to Video ${global.namebot || 'Bot'} ✨`
        }
    };

    const sendReaction = async (emoji) => {
        await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } });
    };

    if (!text) {
        await sendReaction("❓");
        return conn.reply(m.chat, `🤔 *Aduh, Kak! Aku butuh teks deskripsi untuk membuat videonya nih!* ✨\n\n*Contoh:*\n*${usedPrefix + command} seekor kucing yang sedang menari di atas panggung dengan lampu disko*\n\n> © ${global.namebot || 'Bot'} 2025`, m, { quoted: fkontak });
    }

    await sendReaction("⏳");

    try {
        const { data: keyResponse } = await axios.post('https://soli.aritek.app/txt2videov3', {
            deviceID: Math.random().toString(16).substr(2, 8) + Math.random().toString(16).substr(2, 8),
            prompt: text,
            used: [],
            versionCode: 51
        }, {
            headers: {
                authorization: 'eyJzdWIiwsdeOiIyMzQyZmczNHJ0MzR0weMzQiLCJuYW1lIjorwiSm9objMdf0NTM0NT',
                'content-type': 'application/json; charset=utf-8',
                'accept-encoding': 'gzip',
                'user-agent': 'okhttp/4.11.0'
            }
        });

        if (!keyResponse || !keyResponse.key) {
            await sendReaction("❌");
            throw new Error('Gagal mendapatkan kunci video dari API. Respon tidak valid.');
        }

        const { data: videoResponse } = await axios.post('https://soli.aritek.app/video', {
            keys: [keyResponse.key]
        }, {
            headers: {
                authorization: 'eyJzdWIiwsdeOiIyMzQyZmczNHJ0MzR0weMzQiLCJuYW1lIjorwiSm9objMdf0NTM0NT',
                'content-type': 'application/json; charset=utf-8',
                'accept-encoding': 'gzip',
                'user-agent': 'okhttp/4.11.0'
            }
        });

        if (!videoResponse || !videoResponse.datas || videoResponse.datas.length === 0 || !videoResponse.datas[0].url) {
            await sendReaction("❌");
            throw new Error('Tidak ada URL video yang ditemukan dari API.');
        }

        const videoUrl = videoResponse.datas[0].url;

        await conn.sendFile(m.chat, videoUrl, 'generated_video.mp4', `*🎥 Video berhasil dibuat!*
        
*Deskripsi:* ${text}

_Perlu diingat: Proses ini mungkin memakan waktu tergantung panjang dan kompleksitas deskripsi._

> © ${global.namebot || 'Bot'} 2025
        `.trim(), m, null, { quoted: fkontak });

        await sendReaction("✅");

    } catch (error) {
        console.error("Error Text to Video:", error);
        await sendReaction("❌");
        return conn.reply(m.chat, `❌ *Aduh, Kak! Gagal membuat video dari teks.* 😥
        
*Kemungkinan penyebab:*
- Deskripsi terlalu kompleks atau tidak jelas.
- API sedang sibuk atau ada masalah.
- Token otorisasi mungkin tidak valid atau kedaluwarsa.

*Error Detail:*
\`\`\`${error.message || error}\`\`\`

> © ${global.namebot || 'Bot'} 2025`, m, { quoted: fkontak });
    }
};

handler.help = ['txt2video <teks>', 'text2video <teks>', 'videogen <teks>'];
handler.tags = ['ai'];
handler.command = /^(txt2video|text2video|videogen)$/i;
handler.limit = true;

 handler.premium = true;

export default handler;