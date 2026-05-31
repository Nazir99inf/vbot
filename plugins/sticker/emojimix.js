let handler = async (m, {
    conn,
    text,
    args
}) => {
    if (!args[0]) throw "*• Example :* .emojimix 😠+😂";
    let [a, b] = text.split`+`;
    try {
        let response = await fetch(`https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(a)}_${encodeURIComponent(b)}`);

        let buffer = (await response.json()).results;
        return conn.sendImageAsSticker(m.chat, await Func.fetchBuffer(buffer[0].url), m, {
            packname: global.packname,
            author: global.author,
        });
    } catch (error) {
        console.error("Error fetching from Tenor API:", error);
    }
}

handler.help = ["emojimix"].map((a) => a + " *[emoji1+emoji2]*");
handler.tags = ["sticker"];
handler.command = ["emojimix"];
handler.limit = true;
module.exports = handler