const axios = require("axios");
const cheerio = require("cheerio");

async function lirik(title) {
  const searchUrl = global.useProxy ? global.proxyUrl + encodeURIComponent("https://api.genius.com/search") : "https://api.genius.com/search";
  const searchRes = await axios.get(searchUrl, {
    headers: {
      Authorization: `Bearer vvoeY3OJDpj182Za5ln2FFTTKg5vv1Aio5hHSn1I_KdnYUfw7jVJ0u17qahH4RQp`
    },
    params: { q: title }
  });
  if (!searchRes.data.response.hits.length) {
    throw new Error("Song not found!");
  }
  const song = searchRes.data.response.hits[0].result;
  const lyricsUrl = global.useProxy ? global.proxyUrl + encodeURIComponent(song.url) : song.url;
  const lyricsRes = await axios.get(lyricsUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
    }
  });
  const $ = cheerio.load(lyricsRes.data);
  let lyrics = "";

  $('[data-lyrics-container="true"]').each((i, elem) => {
    $(elem).find('[data-exclude-from-selection="true"]').remove();
    let html = $(elem)
      .html()
      .replace(/<br\s*\/?>/gi, "\n");

    lyrics += $(`<div>${html}</div>`).text();
  });

  return {
    title: song.title,
    author: song.primary_artist.name,
    url: song.url,
    image: song.header_image_thumbnail_url,
    release: song.release_date_for_display,
    lirik: lyrics.trim()
  };
}
module.exports = lirik;
