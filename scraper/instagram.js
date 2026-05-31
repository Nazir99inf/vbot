const axios = require("axios")

async function instagram(url) {
  const headers = { "X-IG-App-ID": "936619743392459" }
  if (url.includes("/stories/")) {
    try {
    const [, user, id] = new URL(url).pathname.split("/").filter(Boolean)
    const html = await fetch(url).then(r => r.text())
    const usr = JSON.parse(html.match(/"user":({.*?})/)[1])
    const { data } = await axios.get(
      `https://i.instagram.com/api/v1/feed/user/${usr.id}/story/`,
      { headers: { ...headers, Cookie: "sessionid=73826068448%3ADgDR5B27lWO3jj%3A29%3AAYhfMw1MuDgYDu4EV5lEBpjiYhlCTozFlQioMyFHxA;" } }
    )
    const item = data.reel.items.find(v => v.id.split("_")[0] === id)
    if (!item) throw "Story tidak ditemukan"
    const media = item.video_versions
      ? item.video_versions[0].url
      : item.image_versions2.candidates[0].url
    return {
      type: "story",
      author: {
        username: usr.username,
        name: data.reel.user.full_name,
        id: usr.id,
        pp: usr.profile_pic_url
      },
      uploadAt: new Date(item.taken_at * 1000).toLocaleString("id-ID"),
      media
    }
    } catch { throw new Error("Konten bermasalah / bersifat private") }
  } else {
    const code = url.match(/instagram\.com\/(?:p|reel|tv)\/([^/?#]+)/)?.[1]
    if (!code) throw "URL tidak valid"
    const q = new URLSearchParams({
      doc_id: "8845758582119845",
      variables: JSON.stringify({ shortcode: code })
    })
    const res = await fetch(
      `https://www.instagram.com/graphql/query/?${q}`,
      { headers }
    )
    const j = await res.json()
    const m = j.data.xdt_shortcode_media
    if (!m) throw "Konten private / followers only"
    const side = m.edge_sidecar_to_children?.edges || []
    const media = side.length
      ? side.map(x => x.node.video_url || x.node.display_url)
      : m.video_url || m.display_url
    return {
      type: side.length ? "slide" : m.is_video ? "video" : "photo",
      author: {
        username: m.owner.username,
        name: m.owner.full_name,
        followers: m.owner.edge_followed_by?.count,
        pp: m.owner.profile_pic_url
      },
      caption: m.edge_media_to_caption.edges[0]?.node.text || "",
      stats: {
        like: m.edge_media_preview_like.count,
        comments: m.edge_media_preview_comment.count,
        views: m.video_view_count || m.video_play_count || null,
        duration: m.video_duration || null
      },
      media
    }
  }
}
module.exports = instagram