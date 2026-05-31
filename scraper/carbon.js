const fetch = require("node-fetch")

async function carbon(input) {
  let res = await fetch("https://carbonara.solopov.dev/api/cook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: input })
  })
  let blob = await res.blob()
  let arrayBuffer = await blob.arrayBuffer()
  return Buffer.from(arrayBuffer)
}
module.exports = carbon