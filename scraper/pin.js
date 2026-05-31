const axios = require("axios")
const cheerio = require("cheerio")

class Pin {
  constructor() {
    this.base = "https://www.pinterest.com"
    this.searchPath = "/resource/BaseSearchResource/get/"
    this.headers = {
      "accept": "application/json, text/javascript, */*, q=0.01",
      "referer": this.base,
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "x-app-version": "a9522f",
      "x-pinterest-appstate": "active",
      "x-pinterest-pws-handler": "www/[username]/[slug].js",
      "x-requested-with": "XMLHttpRequest"
    }
  }

  async getCookies() {
    try {
      const res = await axios.get(this.base, {
        headers: { "User-Agent": this.headers["user-agent"] }
      })
      const cookies = res.headers["set-cookie"]?.map(c => c.split(";")[0].trim()).join("; ")
      return cookies || null
    } catch {
      return null
    }
  }

  async search(query) {
    if (!query) return { status: false, message: "Query kosong." }
    try {
      const cookies = await this.getCookies()
      if (!cookies) return { status: false, message: "Gagal ambil cookies." }

      const params = {
        source_url: `/search/pins/?q=${query}`,
        data: JSON.stringify({
          options: {
            isPrefetch: false,
            query,
            scope: "pins",
            bookmarks: [""],
            no_fetch_context_on_resource: false,
            page_size: 10
          },
          context: {}
        }),
        _: Date.now()
      }

      const res = await axios.get(`${this.base}${this.searchPath}`, {
        headers: { ...this.headers, cookie: cookies },
        params
      })

      const results = res.data.resource_response.data.results
        .filter(v => v.images?.orig)
        .map(v => ({
          id: v.id,
          title: v.title || "",
          description: v.description || "",
          image: v.images.orig.url,
          url: `${this.base}/pin/${v.id}/`
        }))

      return results.length ? results : { status: false, message: `Tidak ada hasil untuk "${query}"` }
    } catch (e) {
      return { status: false, error: e.message }
    }
  }

  async dl(url) {
    try {
      const res = await axios.get(url, {
        headers: { "User-Agent": this.headers["user-agent"] }
      })
      const $ = cheerio.load(res.data)
      const tag = $('script[data-test-id="video-snippet"]')
      if (tag.length) {
        const data = JSON.parse(tag.text())
        if (!data?.contentUrl) return { status: false, message: "Data video tidak ditemukan." }
        return {
          type: "video",
          title: data.name,
          username: "@" + data.creator.name,
          url: data.contentUrl,
          thumb: data.thumbnailUrl
        }
      }
      const title = $('meta[property="og:title"]').attr("content") || $("title").text()
      const imageUrl = $('meta[property="og:image"]').attr("content")
      const pinnerUrl = $('meta[property="pinterestapp:pinner"]').attr("content")
      const username = pinnerUrl ? pinnerUrl.split("/").filter(Boolean).pop() : "unknown"
      return {
        type: "image",
        title: title,
        username: "@" + username,
        url: imageUrl
      }
    } catch (e) {
      return { status: false, error: e.message }
    }
  }
}
module.exports = Pin