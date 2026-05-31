const FormData = require("form-data");
const axios = require("axios")
const crypto = require("crypto")
const stream = require("stream")

async function whatmusic(buffer) {
const form = new FormData();

form.append("file", buffer, {
filename: "lagu.mp3",
contentType: "audio/mpeg"
});
try {

const headers = {
...form.getHeaders(),
Origin: "https://www.aha-music.com",
Referer: "https://www.aha-music.com/",
"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
};

const up = await fetch("https://api.doreso.com/upload", {
method: "POST",
headers,
body: form
});
console.log(await up.text())
const upJson = await up.json();
await new Promise(r => setTimeout(r, 15000));

const get = await fetch(`https://api.doreso.com/file/${upJson.data.id}`);
const getJson = await get.json();

const music = getJson.data[0].results.music[0].result;

return {
title: music.title,
album: music.album?.name,
artists: music.artists?.map(a => a.name),
genres: music.genres?.map(g => g.name),
label: music.label,
release_date: music.release_date,
duration_ms: music.duration_ms,
play_offset_ms: music.play_offset_ms,
score: music.score,
upc: music.external_ids?.upc,
isrc: music.external_ids?.isrc,
youtube: music.external_metadata?.youtube
? `https://www.youtube.com/watch?v=${music.external_metadata.youtube.vid}`
: null,
spotify: music.external_metadata?.spotify
? `https://open.spotify.com/track/${music.external_metadata.spotify.track.id}`
: null,
deezer: music.external_metadata?.deezer
? `https://www.deezer.com/track/${music.external_metadata.deezer.track.id}`
: null
};

} catch (e) {
console.log(e);
}
}

const acrcloud = require("acrcloud");

const acr = new acrcloud({
  host: "identify-us-west-2.acrcloud.com",
  access_key: "a0b3ae6fdd41810d0679925a50cdc9d6",
  access_secret: "vK2Zr1NpFZbS7yENJTW2oyGMBznyXlkVdqIq8BrB",
});

async function whatmusic2(buffer) {
  let response = await acr.identify(buffer);
  let metadata = response.metadata;
  if (!metadata || !metadata.music) return [];

  return metadata.music.map((song) => ({
    title: song.title,
    artist: song.artists.map((a) => a.name)[0],
    score: song.score,
    release: new Date(song.release_date).toLocaleDateString("id-ID"),
    duration: toTime(song.duration_ms),
    url: Object.keys(song.external_metadata)
      .map((key) =>
        key === "youtube"
          ? "https://youtu.be/" + song.external_metadata[key].vid
          : key === "deezer"
            ? "https://www.deezer.com/us/track/" +
              song.external_metadata[key].track.id
            : key === "spotify"
              ? "https://open.spotify.com/track/" +
                song.external_metadata[key].track.id
              : "",
      )
      .filter(Boolean),
  }));
}

function toTime(ms) {
  let minutes = Math.floor(ms / 60000) % 60;
  let seconds = Math.floor(ms / 1000) % 60;
  return [minutes, seconds].map((v) => v.toString().padStart(2, "0")).join(":");
}

module.exports ={  whatmusic, whatmusic2 };