const crypto = require("crypto");
const { fetch } = require("undici");
const util = require("util");
const fs = require("fs")
function size(b){
  if(b[0]===0x89&&b[1]===0x50&&b[2]===0x4e&&b[3]===0x47) return {width:b.readUInt32BE(16),height:b.readUInt32BE(20)};
  if(b.toString("ascii",0,3)==="GIF") return {width:b.readUInt16LE(6),height:b.readUInt16LE(8)};
  if(b.toString("ascii",0,4)==="RIFF"&&b.toString("ascii",8,12)==="WEBP"){
    const h=b.toString("ascii",12,16);
    if(h==="VP8X") return {width:1+b.readUIntLE(24,3),height:1+b.readUIntLE(27,3)};
    if(h==="VP8 ") return {width:b.readUInt16LE(26)&0x3fff,height:b.readUInt16LE(28)&0x3fff};
    if(h==="VP8L"){
      const b0=b[21],b1=b[22],b2=b[23],b3=b[24];
      return {width:1+(((b1&0x3f)<<8)|b0),height:1+(((b3&0x0f)<<10)|(b2<<2)|((b1&0xc0)>>6))};
    }
  }
  if(b[0]===0xff&&b[1]===0xd8){
    let i=2;
    while(i<b.length){
      if(b[i]!==0xff){i++;continue}
      while(b[i]===0xff)i++;
      const m=b[i];
      if(m===0xd8||m===0xd9||m===0x01||(m>=0xd0&&m<=0xd7)){i++;continue}
      const l=b.readUInt16BE(i+1);
      if((m>=0xc0&&m<=0xc3)||(m>=0xc5&&m<=0xc7)||(m>=0xc9&&m<=0xcb)||(m>=0xcd&&m<=0xcf))
        return {height:b.readUInt16BE(i+4),width:b.readUInt16BE(i+6)};
      i+=1+l;
    }
  }
  throw Error("Unsupported");
}
class ChatGpt {
  constructor(c = {}) {
    this.useAuth = c.useAuth || false;
    this.baseUrl = "https://chatgpt.com";
    this.user_agent = c.user_agent || "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Mobile Safari/537.36";
    this.msgid = c.msg_id || crypto.randomUUID();
    this.oai_did = c.did || "06aed942-07f3-4c91-aa8c-3ec6299e612d" || crypto.randomUUID();
    this.screen_width = c.width || 1920;
    this.screen_height = c.height || 1080;
    this.lang = c.lang || "en-US";
    this.build_number = c.build_number || "prod-2294c45e1eaa6a898633916fa7682b2e6b912617";
  }
  web_headers(extra = {}) {
    return {
      "OAI-Device-Id": this.oai_did,
      accept: "*/*",
      ...(this.useAuth ? { authorization: `Bearer ${this.useAuth}` } : {}),
      "User-Agent": this.user_agent,
      "accept-language": "en-US,en;q=0.9,id-ID;q=0.8,id;q=0.7",
      "content-type": "application/json",
      "sec-ch-ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
      "sec-ch-ua-mobile": "?1",
      "sec-ch-ua-platform": '"Android"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      Referer: "https://chatgpt.com",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      ...extra
    };
  }
  qh(t) {
    return Buffer.from(JSON.stringify(t)).toString("base64");
  }
  nce(t) {
    let e = 2166136261;
    for (let n = 0; n < t.length; n++) {
      e ^= t.charCodeAt(n);
      e = Math.imul(e, 16777619) >>> 0;
    }
    e ^= e >>> 16;
    e = Math.imul(e, 2246822507) >>> 0;
    e ^= e >>> 13;
    e = Math.imul(e, 3266489909) >>> 0;
    e ^= e >>> 16;
    return (e >>> 0).toString(16).padStart(8, "0");
  }
  createBrowserConfig() {
    return [this.screen_width + this.screen_height, "" + new Date(), 2172649472, Math.random(), this.user_agent, null, this.build_number, this.lang, `${this.lang},en`, Math.random(), "contacts−[object ContactsManager]", "_reactListening6506zq7cxya", "Nazir", performance.now(), this.msgid, "", 8, performance.timeOrigin, 0, 0, 0, 0, 0, 0, 0];
  }
  runCheck(s, seed, d, config, a) {
    config[3] = a;
    config[9] = Math.round(performance.now() - s);
    const x = this.qh(config);
    return this.nce(seed + x).substring(0, d.length) <= d ? x + "~S" : null;
  }
  getPow(seed, difficulty, config) {
    const s = performance.now();
    for (let r = 0; r < 500000; r++) {
      const a = this.runCheck(s, seed, difficulty, config, r);
      if (a) return "gAAAAAB" + a;
    }
    return "wQ8Lk5FbGpA2NcR9dShT6gYjU7VxZ4De";
  }
  getRequirementsTokenBlocking() {
    const n = performance.now();
    const config = this.createBrowserConfig();
    config[3] = 1;
    config[9] = performance.now() - n;
    return "gAAAAAC" + this.qh(config);
  }
  async generateTkn() {
    const pData = this.getRequirementsTokenBlocking();
    const config = this.createBrowserConfig();
    const prepareRes = await fetch(`${this.baseUrl}/backend-anon/sentinel/chat-requirements/prepare`, {
      method: "POST",
      headers: this.web_headers(),
      body: JSON.stringify({ p: pData })
    }).then(r => r.json());
    let powToken = null;
    let turnstileToken = null;
    if (prepareRes.proofofwork?.required) powToken = this.getPow(prepareRes.proofofwork.seed, prepareRes.proofofwork.difficulty, config);
    turnstileToken = crypto
      .randomBytes(Math.floor((2256 / 4) * 3))
      .toString("base64")
      .slice(0, 2256);
    const finalizeBody = { prepare_token: prepareRes.prepare_token || "" };
    if (powToken) finalizeBody.proofofwork = powToken;
    if (turnstileToken) finalizeBody.turnstile = turnstileToken;
    const finalizeRes = await fetch(`${this.baseUrl}/backend-anon/sentinel/chat-requirements/finalize`, { method: "POST", headers: this.web_headers(), body: JSON.stringify(finalizeBody) }).then(r => r.json());
    return { pow: powToken, turnstile: turnstileToken, prepare_token: finalizeRes.token || null };
  }
  async upload(filePath) {
    const stats = fs.statSync(filePath);
    const fileName = filePath.split("/").pop();
    const data = await fetch(`${this.baseUrl}/backend-api/files`, {
      method: "POST",
      headers: this.web_headers(),
      body: JSON.stringify({
        file_name: fileName,
        file_size: stats.size,
        use_case: "multimodal",
        timezone_offset_min: -480,
        reset_rate_limits: false,
        store_in_library: true
      })
    });
    let res = await data.json();
    console.log(res);
    const buffer = fs.readFileSync(filePath);
    let hasil = await fetch(res.upload_url, {
      method: "PUT",
      headers: this.web_headers({
        "Content-Type": "image/jpg",
        "Content-Length": stats.size,
        "X-Ms-Blob-Type": "BlockBlob",
        "X-Ms-Version": "2020-04-08"
      }),
      body: buffer
    });
    console.log(await hasil.text());

    const messageId = crypto.randomUUID();
    const threadId = crypto.randomUUID();

    const response = await fetch("https://chatgpt.com/backend-api/files/process_upload_stream", {
      method: "POST",
      headers: this.web_headers(),
      body: JSON.stringify({
        file_id: res.file_id,
        use_case: "multimodal",
        index_for_retrieval: false,
        file_name: fileName,
        metadata: {
          library_file_info: {
            origination_message_id: messageId,
            origination_thread_id: threadId
          }
        }
      })
    });
    console.log(await response.text());
    let getratio = size(buffer);
    return {
      height: getratio.height,
      width: getratio.width,
      size: stats.size,
      filename: fileName,
      id: res.file_id,
      url: res.upload_url
    };
  }
  async runImageEdit(prompt, path) {
    const upl = await this.upload(path)
    const req = await this.generateTkn();
    const res = await fetch("https://chatgpt.com/backend-anon/f/conversation", {
      method: "POST",
      headers: this.web_headers({
        "OAI-Language": "en-US",
        "Content-Type": "application/json",
        "OpenAI-Sentinel-Chat-Requirements-Token": req.prepare_token,
        "OpenAI-Sentinel-Turnstile-Token": req.turnstile,
        "OpenAI-Sentinel-Proof-Token": req.pow,
        //"X-Conduit-Token": conduit,
        accept: "text/event-stream"
      }),
      body: JSON.stringify({
        action: "next",
        messages: [
          {
            id: this.msgid,
            author: {
              role: "user"
            },
            create_time: 1772943481.307,
            content: {
              content_type: "multimodal_text",
              parts: [
                {
                  content_type: "image_asset_pointer",
                  asset_pointer: "sediment://" + upl.id,
                  size_bytes: upl.size,
                  width: upl.width,
                  height: upl.height
                },
                prompt
              ]
            },
            metadata: {
              developer_mode_connector_ids: [],
              selected_connector_ids: [],
              selected_sync_knowledge_store_ids: [],
              selected_github_repos: [],
              selected_all_github_repos: false,
              system_hints: ["picture_v2"],
              serialization_metadata: {
                custom_symbol_offsets: []
              }
            }
          }
        ],
        parent_message_id: "client-created-root",
        model: "gpt-4-o",
        timezone_offset_min: -480,
        timezone: "Asia/Makassar",
        conversation_mode: {
          kind: "primary_assistant"
        },
        enable_message_followups: true,
        system_hints: ["picture_v2"],
        supports_buffering: true,
        supported_encodings: ["v1"],
        client_contextual_info: {
          is_dark_mode: false,
          time_since_loaded: 859,
          page_height: 881,
          page_width: 451,
          pixel_ratio: 1.594152808189392,
          screen_height: this.screen_height,
          screen_width: this.screen_width,
          app_name: "chatgpt.com"
        },
        paragen_cot_summary_display_override: "allow",
        force_parallel_switch: "auto"
      })
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    const decoder = new TextDecoder();
    let buffer = "";
    let subtitle = null;
    let resolvedModel = null;
    let finalAssetPointer = null;
    let finalFileId = null;
    let toolJsonText = "";

    function extractFileId(value) {
      if (typeof value !== "string") return null;
      const m = value.match(/^sediment:\/\/(file_[a-zA-Z0-9]+)$/);
      return m ? m[1] : null;
    }

    for await (const chunk of res.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;

        const data = line.slice(5).trim();
        if (!data) continue;

        if (data === "[DONE]") {
          return {
            subtitle,
            model: resolvedModel,
            tool_json: toolJsonText || null,
            asset_pointer: finalAssetPointer,
            file_id: finalFileId
          };
        }

        let json;
        try {
          json = JSON.parse(data);
        } catch {
          continue;
        }
        if (json.type === "title_generation") {
          subtitle = json.title;
        }

        if (json.type === "server_ste_metadata") {
          resolvedModel = json.metadata?.model_slug ?? null;
        }

        // Event add: tool menghasilkan image awal
        if (json.o === "add") {
          const parts = json?.v?.message?.content?.parts;
          if (Array.isArray(parts)) {
            for (const part of parts) {
              if (part && part.content_type === "image_asset_pointer" && typeof part.asset_pointer === "string") {
                finalAssetPointer = part.asset_pointer;
                finalFileId = extractFileId(part.asset_pointer);
              }
            }
          }
        }
        if (json.o === "patch" && Array.isArray(json.v)) {
          for (const p of json.v) {
            if (p?.o === "append" && p?.p === "/message/content/parts/0" && typeof p.v === "string") {
              toolJsonText += p.v;
            }

            if (p?.o === "replace" && p?.p === "/message/content/parts/0/asset_pointer" && typeof p.v === "string") {
              finalAssetPointer = p.v;
              finalFileId = extractFileId(p.v);
            }
          }
        }
      }
    }

    return {
      subtitle,
      model: resolvedModel,
      tool_json: toolJsonText || null,
      asset_pointer: finalAssetPointer,
      file_id: finalFileId
    };
  }
  async getMedia(fileid) {
    let down = await fetch(`https://chatgpt.com/backend-api/files/download/${fileid}?post_id&inline=false`, { headers: this.web_headers(), method: 'GET'}).then(a => a.json())
    const buffer = await fetch(down.download_url, { headers: this.web_headers(), method: 'GET'})
    return Buffer.from(await buffer.arrayBuffer())
  }
}
module.exports = ChatGpt