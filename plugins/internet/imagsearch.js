const search = async (query) => {
    if (!query) throw Error(`kata pencarian tidak boleh kosong`)
    const usp = {
        "as_st": "y",
        "as_q": query,
        "as_epq": "",
        "as_oq": "",
        "as_eq": "",
        "imgsz": "l",
        "imgar": "",
        "imgcolor": "",
        "imgtype": "jpg",
        "cr": "",
        "as_sitesearch": "",
        "as_filetype": "",
        "tbs": "",
        "udm": "2"
    }
    const headers = {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36"
    }
    const response = await fetch("https://www.google.com/search?" + new URLSearchParams(usp).toString(), {
        headers
    })
    if (!response.ok) throw Error(`gagal hit api ${response.status} ${response.statusText}\n${await response.text() || null}`)
    const html = await response.text()
    const match = html.match(/var m=(.*?);var a=m/)?.[1] || null
    if (!match) throw Error("no match found!")
    const json = JSON.parse(match)
    const images = Object.entries(json).filter(v => v[1]?.[1]?.[3]?.[0]).slice(0, 10).map(v =>
    ({
        title: v[1]?.[1]?.[25]?.[2003]?.[3] || null,
        imageUrl: v[1][1][3][0] || null,
        height: v[1][1][3][1] || null,
        width: v[1][1][3][2] || null,
        imageSize: v[1]?.[1]?.[25]?.[2000]?.[2] || null,
        referer: v[1]?.[1]?.[25]?.[2003]?.[2] || null,
        aboutUrl: v[1]?.[1]?.[25]?.[2003]?.[33] || null
    })
    )

    if (!images.length) throw Error(`hasil pencarian ${query} kosong.`)
    images.pop()
    return { total: images.length, images }

}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) throw `* *Example :* ${usedPrefix+command} walpaper hd`;
  let data = await search(text);
  const items = data.images.map((media, i) => ({
      image: { url: media.imageUrl },
      caption: i === 0 ? `[ Google Search Image ]\n\n - total : ${data.total}\n © Google Research` : undefined
    }))
  await conn.sendAlbum(m.chat, items, {
      quoted: m,
      delay: 500,
      delete: true,
      time: 300000
    })
}
handler.help = ['searchimg', 'gsearchimg', 'googleimage'].map(a => a+' [query]')
handler.tags = ['internet']
handler.command = ['searchimg', 'gsearchimg', 'googleimage'];

module.exports = handler