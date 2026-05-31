const { fetch } = require("undici");
const crypto = require("node:crypto");
const { Buffer } = require("node:buffer");
const FormData = require("form-data");
const fs = require("node:fs");
const axios = require("axios");

async function imagen(prompt, input) {
  let buffer;
  if (Buffer.isBuffer(input)) buffer = input;
  else if (/^data:.*?;base64,/i.test(input)) buffer = Buffer.from(input.split(",")[1], "base64");
  else if (/^https?:\/\//.test(input)) {
    const res = await axios.get(input, { responseType: "arraybuffer" });
    buffer = Buffer.from(res.data);
  } else if (fs.existsSync(input)) buffer = fs.readFileSync(input);
  if (!prompt && !buffer) throw new Error("invalid image source");
  const session = crypto.randomBytes(6).toString("hex");
  const BASE = "https://luca115-qwen-image-edit-2509-turbo-lightning.hf.space";
  const form = new FormData();
  form.append("files", buffer, {
    filename: `${crypto.randomBytes(32).toString("hex")}.jpg`,
    contentType: "image/jpg"
  });

  const uploadRes = await axios.post(`${BASE}/gradio_api/upload`, form, {
    headers: { ...form.getHeaders() }
  });
  const path = uploadRes.data[0];
  await fetch(`${BASE}/gradio_api/queue/join`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-gradio-user": "api"
    },
    body: JSON.stringify({
      data: [[{ image: { path, meta: { _type: "gradio.FileData" } } }], prompt, 0, true, 3, 8, 1024, 1024, false],
      event_data: null,
      fn_index: 0,
      trigger_id: null,
      session_hash: session
    })
  });

  const sse = await fetch(`${BASE}/gradio_api/queue/data?session_hash=${session}`, { headers: { accept: "text/event-stream" } });
  const reader = sse.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const text = Buffer.from(value).toString();
    const m = text.match(/"url":"(.*?)"/);

    if (m) {
      return { imageurl: m[1] };
      break;
    }
  }
}
module.exports = imagen