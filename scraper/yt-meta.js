const axios = require('axios')
const cheerio = require('cheerio')

async function yts(query) {
  const { data } = await axios.get(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
    {
      headers: {
        'user-agent': 'Mozilla/5.0',
        'accept-language': 'id-ID,id;q=0.9'
      }
    }
  )

  const $ = cheerio.load(data)
  let initial
  $('script').each((_, el) => {
    const t = $(el).html()
    if (!initial && t?.includes('ytInitialData')) {
      const m = t.match(/ytInitialData\s*=\s*(\{.*?\});/s)
      if (m) initial = JSON.parse(m[1])
    }
  })
  const sections = initial?.contents
      ?.twoColumnSearchResultsRenderer
      ?.primaryContents
      ?.sectionListRenderer
      ?.contents || []
  const videos = sections.flatMap(s =>
    (s.itemSectionRenderer?.contents || [])
      .map(i => i.videoRenderer)
      .filter(Boolean)
      .map(v => {
        return {
          videoId: v.videoId,
          url: `https://youtu.be/${v.videoId}`,
          title: v.title.runs?.map(x => x.text).join('') || '',
          thumbnail: v.thumbnail?.thumbnails?.at(-1)?.url || null,
          duration: v.lengthText?.simpleText || null,
          ago: v.publishedTimeText?.simpleText || null,
          views: Number((v.viewCountText?.simpleText || '0').replace(/[^\d]/g, '')) || 0,
          author: v.ownerText?.runs?.[0]?.text || ''
        }
      })
  )
  return videos
}
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000)
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value)
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? 's' : ''} ago`
    }
  }
  return 'just now'
}
function formatDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

  const hours = parseInt(match[1] || 0)
  const minutes = parseInt(match[2] || 0)
  const seconds = parseInt(match[3] || 0)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  }

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}
async function ytm(videoId) {
  const { data } = await axios.get(
    'https://www.googleapis.com/youtube/v3/videos',
    {
      params: {
        key: "AIzaSyDESfs7_UBPT7CXOlWH7f3zkotwFVpSUdQ", //legal dari googleapis
        id: videoId,
        part: 'snippet,statistics,contentDetails'
      }
    }
  )

  const video = data.items?.[0]
  if (!video) return null
  const { snippet, statistics, contentDetails } = video
  return {
    title: snippet.title,
    videoId,
    url: `https://www.youtu.be/${videoId}`,
    duration: formatDuration(contentDetails.duration),
    thumbnail: snippet.thumbnails?.high?.url || null,
    ago: timeAgo(snippet.publishedAt),
    views: Number(statistics.viewCount || 0),
    likes: Number(statistics.likeCount || 0),
    comments: Number(statistics.commentCount || 0),
    author: snippet.channelTitle,
  }
}

module.exports = { yts, ytm }