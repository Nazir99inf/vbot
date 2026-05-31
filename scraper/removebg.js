const FormData = require('form-data');

function generateClientId() {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

async function removebg(imageBuffer) {
  const clientId = generateClientId();
  const formData = new FormData();
  formData.append('image', imageBuffer, {
    filename: 'image.jpg',
    contentType: 'image/jpeg'
  });

  await fetch('https://image-upscaling.net/removebg_upload', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Origin': 'https://image-upscaling.net',
      'Referer': 'https://image-upscaling.net/removebg/en.html',
      'Cookie': `client_id=${clientId}`,
      ...formData.getHeaders()
    },
    body: formData
  });

  let resultUrl;
  while (!resultUrl) {
    await new Promise(r => setTimeout(r, 1000));

    const res = await fetch('https://image-upscaling.net/removebg_get_status', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://image-upscaling.net/removebg/en.html',
        'Cookie': `client_id=${clientId}`
      }
    });

    const json = await res.json();
    if (json.processed && json.processed.length) {
      resultUrl = json.processed[0];
    }
  }

  const img = await fetch(resultUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://image-upscaling.net/removebg/en.html',
      'Cookie': `client_id=${clientId}`
    }
  });
  return img.buffer();
}

module.exports = removebg;