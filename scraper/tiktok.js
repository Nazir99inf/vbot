const { fetch } = require("undici");

async function tt(url) {
  const f = await fetch(url, {
    headers: {
      authority: "www.tiktok.com",
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": `"Android"`,
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
      "upgrade-insecure-requests": 1,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "sec-ch-ua": `"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"`,
      "sec-fetch-site": "none",
      "sec-fetch-mode": "navigate",
      "sec-fetch-dest": "document",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7"
    }
  });
  const html = await f.text();
  const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
  if (!match) return null;
  const json = JSON.parse(match[1]);
  const data = json.__DEFAULT_SCOPE__["webapp.reflow.video.detail"].itemInfo.itemStruct;
  let download = data.imagePost
    ? data.imagePost.images.reduce((acc, img) => {
        return acc.concat(img.imageURL.urlList);
      }, [])
    : await fetch(`https://www.tiktok.com/player/api/v1/items?item_ids=${data.id}`)
        .then(a => a.json())
        .then(b => b.items[0].video_info.url_list[0]);
  return {
    id: data.id || data.aweme_id || null,
    like: data.stats.diggCount || 0,
    views: data.stats.playCount || data.play || 0,
    share: data.stats.shareCount || 0,
    comment: data.stats.commentCount || 0,
    isVideo: data.imagePost ? false : true,
    title: data.desc || data.suggestedWords?.[0] || "",
    region: data.locationCreated || null,
    duration: `${data.duration || data.music?.duration || 0} second`,
    download: download,
    author: {
      id: data.author.id || "",
      avatar: data.author?.avatarThumb,
      nickname: data.author?.nickname || "",
      username: data.author.uniqueId || "",
      followers: data.author.followerCount || 0,
      following: data.author.followingCount || 0,
      like: data.author.heartCount || 0,
      verified: data.author.verified,
      videoCount: data.author.videoCount || 0
    },
    music: {
      id: data.music?.id || null,
      title: data.music?.title || "",
      author: data.music?.authorName || "",
      thumbnail: data.music?.coverLarge || data.music?.coverMedium || data.music?.coverThumb || null,
      duration: data.music?.duration + " second" || "",
      url: data.music?.playUrl || null
    }
  };
}
module.exports = tt;
