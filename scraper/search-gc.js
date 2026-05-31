const cheerio = require("cheerio")
const axios = require("axios")

async function carigroup(query) {
  try {
    query = query.trim().replace(/\s+/g, "-")
    const { data } = await axios.get("https://groupsor.link/group/searchmore/" + query)
    const $ = cheerio.load(data)
    const groups = []
    $(".maindiv#results").each((index, element) => {
      const mainDiv = $(element)
      const name = mainDiv.find("img.image").attr("alt")?.trim()
      const link = mainDiv
        .find('a[href*="/group/invite/"]')
        .first()
        .attr("href")
        .replace(/^https:\/\/groupsor\.link\/group\/invite\//, "https://chat.whatsapp.com/")
      const image = mainDiv.find("img.image").attr("src")
      const category = mainDiv.find('a[href*="/group/category/"]').text().trim()
      const country = mainDiv.find('a[href*="/group/country/"]').text().trim()
      let description = mainDiv.find("p.descri").text().trim()
      description = description.replace(/ \.\.\. continue reading$/, "")

      groups.push({
        name,
        link,
        image,
        category,
        country,
        description
      })
    })
    return groups
  } catch (error) {
    console.error("Terjadi kesalahan:", error.message)
  }
}
module.exports = carigroup