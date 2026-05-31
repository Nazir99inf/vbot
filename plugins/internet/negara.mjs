let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return m.reply(`* *Example :* ${usedPrefix + command} Indonesia`);
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });
        const query = text.toLowerCase().trim();
        const listUrl = "https://restcountries.com/v3.1/all?fields=name,cca2,cca3";
        const listRes = await fetch(listUrl);

        if (!listRes.ok) {
            return m.reply("🍂 *Gagal mengambil daftar negara.*");
        }
        const listData = await listRes.json();

        const country = listData.find(v =>
            v?.name?.common?.toLowerCase() === query ||
            v?.name?.official?.toLowerCase() === query
        );

        if (!country) {
            return m.reply(`🍂 *Negara* "${text}" *tidak ditemukan.*`);
        }

        const code = country.cca2 || country.cca3;
        const detailUrl = `https://restcountries.com/v3.1/alpha/${code}`;
        const detailRes = await fetch(detailUrl);

        if (!detailRes.ok) {
            return m.reply("🍂 *Gagal mengambil detail negara.*");
        }

        const [detail] = await detailRes.json();

        const name = detail.name.common;
        const official = detail.name.official;
        const capital = detail.capital?.join(", ") || "Tidak tersedia";
        const region = detail.region || "Tidak diketahui";
        const subregion = detail.subregion || "Tidak diketahui";
        const population = detail.population?.toLocaleString("id-ID") || "Tidak diketahui";
        const area = detail.area ? `${detail.area.toLocaleString("id-ID")} km²` : "Tidak diketahui";
        const currencies = detail.currencies
            ? Object.values(detail.currencies).map(v => `${v.name} (${v.symbol})`).join(", ")
            : "Tidak tersedia";
        const languages = detail.languages
            ? Object.values(detail.languages).join(", ")
            : "Tidak tersedia";
        const flagImg = detail.flags?.png || "";
        const flagDesc = detail.flags?.alt || "Deskripsi bendera tidak tersedia";

        let caption = `🌍 *Rest Countries*\n\n`;
        caption += `🏳️ *Negara:* ${name}\n`;
        caption += `📜 *Nama Resmi:* ${official}\n`;
        caption += `🏙️ *Ibu Kota:* ${capital}\n`;
        caption += `🌎 *Region:* ${region} (${subregion})\n`;
        caption += `👥 *Populasi:* ${population}\n`;
        caption += `📐 *Luas Wilayah:* ${area}\n`;
        caption += `💰 *Mata Uang:* ${currencies}\n`;
        caption += `🗣️ *Bahasa:* ${languages}\n\n`;
        caption += `📝 *Deskripsi Bendera:*\n${flagDesc}`;

        if (flagImg) {
            await conn.sendMessage(
                m.chat,
                {
                    image: { url: flagImg },
                    caption
                },
                { quoted: m }
            );
        } else {
            await m.reply(`${caption}\n\n🍂 *Gambar bendera tidak tersedia.*`);
        }
    } catch (e) {
        await m.reply("🍂 *Terjadi kesalahan saat memproses data negara.*");
    } finally {
        await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
    }
};

handler.help = ["countries", "negara", 'country'].map(a => a+ ' [country]');
handler.tags = ["info"];
handler.command = ['countries', 'negara', 'country']
handler.limit = true;
handler.register = false; 

export default handler;