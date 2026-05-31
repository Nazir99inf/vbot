const axios = require("axios");
const FormData = require("form-data");

async function ocr(imageUrl) {
  try {
    const form = new FormData();
    form.append("url", imageUrl);
    form.append("language", "eng");
    form.append("isOverlayRequired", "true");
    form.append("OCREngine", "1");
    const response = await axios.post("https://api8.ocr.space/parse/image", form, {
      headers: {
        ...form.getHeaders(),
        apikey: "donotstealthiskey_ip1",
      },
    });

    if (response.data && response.data.ParsedResults) {
      return response.data.ParsedResults[0].ParsedText;
    } else {
      return response.data
    }
  } catch (error) {
    console.error("OCR Error:", error.response?.data || error.message);
    return null;
  }
}
module.exports = ocr