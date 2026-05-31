const crypto = require("crypto");
const { fetch } = require("undici");
const util = require("util");
class ChatGpt {
  constructor(c = {}) {
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
      "User-Agent": this.user_agent,
      authorization: "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjE5MzQ0ZTY1LWJiYzktNDRkMS1hOWQwLWY5NTdiMDc5YmQwZSIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSJdLCJjbGllbnRfaWQiOiJhcHBfWDh6WTZ2VzJwUTl0UjNkRTduSzFqTDVnSCIsImV4cCI6MTc3Mjc5MDA0MSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9hdXRoIjp7ImNoYXRncHRfYWNjb3VudF9pZCI6IjllNDFiMTVhLTkyMTAtNDZjOC1hM2RhLTU0NGM4ZDhkOTY0MyIsImNoYXRncHRfYWNjb3VudF91c2VyX2lkIjoidXNlci1hYkxoWWlQSUlEM29lVXplZGdMcDRZVXVfXzllNDFiMTVhLTkyMTAtNDZjOC1hM2RhLTU0NGM4ZDhkOTY0MyIsImNoYXRncHRfY29tcHV0ZV9yZXNpZGVuY3kiOiJub19jb25zdHJhaW50IiwiY2hhdGdwdF9wbGFuX3R5cGUiOiJnbyIsImNoYXRncHRfdXNlcl9pZCI6InVzZXItYWJMaFlpUElJRDNvZVV6ZWRnTHA0WVV1IiwidXNlcl9pZCI6InVzZXItYWJMaFlpUElJRDNvZVV6ZWRnTHA0WVV1In0sImh0dHBzOi8vYXBpLm9wZW5haS5jb20vcHJvZmlsZSI6eyJlbWFpbCI6Im5hemlyOTlpcUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sImlhdCI6MTc3MTkyNjA0MSwiaXNzIjoiaHR0cHM6Ly9hdXRoLm9wZW5haS5jb20iLCJqdGkiOiJjZWVkYjk0ZS05OThkLTRkOWItOWQ3Ni00N2FlN2MyMWIwM2YiLCJuYmYiOjE3NzE5MjYwNDEsInB3ZF9hdXRoX3RpbWUiOjE3NzE5MjYwMzgxODcsInNjcCI6WyJvcGVuaWQiLCJlbWFpbCIsInByb2ZpbGUiLCJvZmZsaW5lX2FjY2VzcyIsIm1vZGVsLnJlcXVlc3QiLCJtb2RlbC5yZWFkIiwib3JnYW5pemF0aW9uLnJlYWQiLCJvcmdhbml6YXRpb24ud3JpdGUiXSwic2Vzc2lvbl9pZCI6ImF1dGhzZXNzX0VjTGl6SVZTTUtyS2ZxMEZ3RUtCSFlSViIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTAwOTgyNzIzNDA4NzU4NjE0NjY3In0.cKA-9xlcrQLCrtURL2hQ47me-qwhMYncqmJXIuBtmJI5LO_aumuDYexX6YW2mKHtwsEm8Q66DHg9ZCE-NXi_gvr4U-gG3x8VUM4OSCSx601o1N4xjoqG3Cbn1hLplhHpAF4syelFY_RpQH0D_516qje9WRJASUAPi_rhh3sSgVW4JDDBeA42-amD9RQ53-Ipk-9vRD0iZpz4TqjXEldy3A4uPiyK3bb2cP9e9ldsgxH_ypoeFSjgh8yO-DyNNUZIbulV7aIv1JkUsXyUhJJnQzlk6LycWocVDRT9AX-uexYu9O3ZB0ILfeasJVvi0S5rPO9YRRy3SYb3uUh8ICIddwSf_bnSuFWkcWjbOhCiNfsBsMbJ0h8qmkNQ5inH32ZdpyZ-00vL7lQ38nsyWh1a9SP4N8CKmp9UM9BU3m_9qH-F4fFAkH9MlYoho-Vcwtgl4chu2_JdqR6McRlVtXkIfxKQ8Z4J66LP86pw4txCubWBNN2u2Yr8RyE9kNQgm5KIVTAcu2Kar4ULG4-rj5AWEV_ILZ5BovTMbh5xSm3IFOj0jTY4IAFC1LuvKqT_Xk4HeuaFNiMJb7cCoKhdp-HgSrK2-x3Uw24NRlTHHCrzuXhY1xGt8p38UCQKkxwP8dn1Zi5lqEjVFsHGf0QJCNlKGBzfggd3skUwU0cHhtYJ7bQ",
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
  async generateTurnstileToken(dx) {
    let token = "";
    return token;
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
  async upload(buffer, name) {
    let data = fetch("https://chatgpt.com/backend-api/files", { method: "POST", Headers: this.web_headers(), body: JSON.stringify({ file_name: "fdb88f0e8e7536e0a65640cae3494007.jpg", file_size: buffer.length, use_case: "multimodal", timezone_offset_min: -480, reset_rate_limits: false, store_in_library: true }) });
  }
  initConversation = (t, p = false, w = false, id = this.msgid) => {
    const b = { action: "next", parent_message_id: "client-created-root", model: "gpt-5-2", timezone_offset_min: new Date().getTimezoneOffset(), timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, conversation_mode: { kind: "primary_assistant" }, system_hints: [], supports_buffering: !0, supported_encodings: ["v1"] };
    if (p) return { ...b, fork_from_shared_post: !1, partial_query: { id, author: { role: "user" }, content: { content_type: "text", parts: [t] } }, client_contextual_info: { app_name: "chatgpt.com" } };
    let o = {
      ...b,
      messages: [{ id, author: { role: "user" }, create_time: Date.now() / 1e3, content: { content_type: "text", parts: [t] }, metadata: { selected_github_repos: [], selected_all_github_repos: !1, serialization_metadata: { custom_symbol_offsets: [] } } }],
      enable_message_followups: !0,
      client_contextual_info: { is_dark_mode: !0, time_since_loaded: 24, page_height: 850, page_width: 451, pixel_ratio: 1.594152808189392, screen_height: this.screen_height, screen_width: this.screen_width, app_name: "chatgpt.com" },
      paragen_cot_summary_display_override: "allow",
      force_parallel_switch: "auto"
    };
    return (w && Object.assign(o, { system_hints: ["search"], force_use_search: true, client_reported_search_source: "conversation_composer_web_icon", messages: [{ ...o.messages[0], metadata: { ...o.messages[0].metadata, system_hints: ["search"] } }] }), o);
  };
  async init(msg, web, id) {
    if (!msg) return "no msg";
    const preparec = await fetch("https://chatgpt.com/backend-anon/f/conversation/prepare", {
      headers: this.web_headers({ "X-Conduit-Token": "no-token" }),
      body: JSON.stringify(this.initConversation(msg, true, web, id)),
      method: "POST"
    });
    const tkn = await preparec.json();
    return tkn.token;
  }
  async startConversation(msg, web = false, stream = true, id = this.msgid) {
    if (!msg) return { subtitle: null, model: null, msg: "no msg" };
    const req = await this.generateTkn();
    const conduit = await this.init(msg, web, id);
    const res = await fetch("https://chatgpt.com/backend-anon/f/conversation", {
      method: "POST",
      body: JSON.stringify(this.initConversation(msg, false, web, id)),
      headers: this.web_headers({
        "OAI-Language": "en-US",
        "Content-Type": "application/json",
        "OpenAI-Sentinel-Chat-Requirements-Token": req.prepare_token,
        "OpenAI-Sentinel-Turnstile-Token": req.turnstile,
        "OpenAI-Sentinel-Proof-Token": req.pow,
        "X-Conduit-Token": conduit,
        accept: "text/event-stream"
      })
    });
    const decoder = new TextDecoder();
    let buffer = "";
    let finalText = "";
    let subtitle = null;
    let model = null;
    for await (const chunk of res.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;

        const data = line.slice(5).trim();
        if (data === "[DONE]") {
          return { subtitle, model, msg: finalText };
        }
        const json = JSON.parse(data);
        if (json.type === "title_generation") subtitle = json.title;
        if (json.type === "server_ste_metadata") model = json.metadata?.model_slug;

        if (json.o === "patch" || Array.isArray(json.v)) {
          const patches = json.v || [];
          for (const p of patches) {
            if (p.o === "append" && p.p?.includes("/message/content/parts/0")) {
              if (stream) {
                process.stdout.write(
                  JSON.stringify({
                    subtitle,
                    model,
                    msg: p.v
                  }) + "\n"
                );
              } else {
                finalText += p.v;
              }
            }
          }
        }
      }
    }
  }
}
module.exports = ChatGpt;
