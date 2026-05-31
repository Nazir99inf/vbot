const FormData = require("form-data");
const { fromBuffer } = require("file-type");
const axios = require("axios");
const crypto = require("crypto");
const randomBytes = crypto.randomBytes(32).toString("hex");

module.exports = {
  tmpfiles: async (content) => {
    try {
      const type = await fromBuffer(content);
      const ext = type?.ext || "bin";
      const mime = type?.mime || "application/octet-stream";
      const formData = new FormData();
      formData.append("file", content, {
        filename: `${randomBytes}.${ext}`,
        contentType: mime
      });
      const { data } = await axios.post("https://tmpfiles.org/api/v1/upload", formData, { headers: formData.getHeaders(), maxBodyLength: Infinity });
      if (data.status !== "success") throw new Error("Upload failed");
      const match = data.data.url.match(/tmpfiles\.org\/(\d+\/.+)$/);
      return match ? `https://tmpfiles.org/dl/${match[1]}` : data.data.url;
    } catch (e) {
      console.error("Error upload tmpfiles:", e.message);
      throw e;
    }
  },
  telegraph: async (content) => {
    const type = await fromBuffer(content);
    const ext = type?.ext || "bin";
    const mime = type?.mime || "application/octet-stream";
    const form = new FormData();
    form.append("images", content, {
      filename: `${randomBytes}.${ext}`,
      contentType: mime
    });
    const response = await axios.post("https://telegraph.zorner.men/upload", form, { headers: form.getHeaders() });
    return response.data.links[0]
  },
  pomf2: async (content) => {
    try {
      const type = await fromBuffer(content);
      const ext = type?.ext || "bin";
      const mime = type?.mime || "application/octet-stream";
      const form = new FormData();
      form.append("files[]", content, {
        filename: `${randomBytes}.${ext}`,
        contentType: mime
      });
      const { data } = await axios.post("https://pomf2.lain.la/upload.php", form, { headers: form.getHeaders(), maxBodyLength: Infinity });
      return data;
    } catch (e) {
      console.error("Error upload pomf2:", e.message);
      throw e;
    }
  },
  Uguu: async (content) => {
    try {
      const type = await fromBuffer(content);
      const ext = type?.ext || "bin";
      const mime = type?.mime || "application/octet-stream";

      const form = new FormData();
      form.append("files[]", content, {
        filename: `${randomBytes}.${ext}`,
        contentType: mime
      });

      const { data } = await axios.post("https://uguu.se/upload.php", form, { headers: form.getHeaders(), maxBodyLength: Infinity });
      return data.files[0].url;
    } catch (e) {
      console.error("Error upload Pm2", e.message);
      throw e;
    }
  },
  videy: async (buffer) => {
    try {
      const { ext, mime } = (await fromBuffer(buffer)) || {};
      const formData = new FormData();
      formData.append("file", buffer, {
        filename: Date.now() + "." + ext
      });
      let response = await axios.request("https://videy.co/api/upload", {
        method: "POST",
        data: formData.getBuffer(),
        headers: {
          ...formData.getHeaders()
        }
      });

      return "https://videy.co/v?id=" + response.data.id;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error(String(error));
    }
  },
  puticu: async (content) => {
    try {
      const type = await fromBuffer(content);
      const ext = type?.ext || "bin";
      const mime = type?.mime || "application/octet-stream";
      const form = new FormData();
      form.append("randomize", "true");
      form.append("expires", "86400");
      form.append("access_key", "");
      form.append("file", content, {
        filename: `${randomBytes}.${ext}`,
        contentType: mime
      });
      const { data } = await axios.post("https://put.icu/upload", form, {
        headers: {
          ...form.getHeaders(),
          "x-requested-with": "XMLHttpRequest",
          "Referer": "https://put.icu/"
        },
        maxBodyLength: Infinity
      });
      return data.url;
    } catch (e) {
      console.error("Error upload put.icu:", e.message);
      throw e;
    }
  }
};
