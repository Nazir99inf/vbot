//credit by nazir
//support sf.gl, sub2unlock, tinyurl, linkvertise dll

const crypto = require("crypto");

async function bypass(url, androidId = crypto.randomBytes(16).toString("hex")) {
  const deviceId = crypto.createHash("sha256").update(`bypasstools:${androidId}`).digest("hex");
  const { sessionToken } = await fetch("https://bypass.tools/api/mobile/init", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deviceId,
      platform: "android",
      appVersion: "1.0.0"
    })
  }).then(r => r.json());
  return fetch("https://bypass.tools/api/mobile/bypass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionToken}`,
      "X-Device-ID": deviceId
    },
    body: JSON.stringify({
      url,
      forceRefresh: false
    })
  }).then(async r => {
    const d = await r.json();
    if (!r.ok) throw new Error(d.message || "Bypass failed");
    return d.result;
  });
}

/*
bypass("https://linkvertise.com/546946/mYoUbm5Ro7gU?o=sharing")
  .then(console.log)
  .catch(console.error);
  */
module.exports = bypass