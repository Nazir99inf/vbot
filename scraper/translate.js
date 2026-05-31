const axios = require("axios")

async function listLanguage() {
  const res = await axios.get(
    "https://translate.google.com/translate_a/l?client=webapp&sl=auto&tl=en&v=1.0&hl=en&pv=1&tk=&source=bh&ssel=0&tsel=0&kc=1&tk=626515.626515&q="
  )
  const data = res.data.sl
  return Object.entries(data).map(([code, name]) => ({ code, name }))
}

async function translate(text, lang) {
  const result = await axios.get(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(
      text
    )}`
  )
  return result.data[0][0][0]
}
module.exports = { translate, listLanguage };