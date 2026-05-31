async function startConverstation(text, model) {
  const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${global.hf_token}`,
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: text
        }
      ],
      model: model
    })
  });
  const result = await response.json();
  return result;
}
module.exports = startConverstation