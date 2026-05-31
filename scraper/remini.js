const FormData = require('form-data');

function generateClientId() {
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

async function upscaleImage(imageBuffer, scale = 2, model = 'plus') {
  const clientId = generateClientId();

  const formData = new FormData();
  formData.append('image', imageBuffer, {
    filename: 'image.jpg',
    contentType: 'image/jpeg'
  });
  formData.append('scale', String(scale));
  formData.append('model', model);
  formData.append('prompt', '');
  formData.append('creativity', '0.1');

  const upload = await fetch('https://image-upscaling.net/upscaling_upload', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Origin': 'https://image-upscaling.net',
      'Referer': 'https://image-upscaling.net/upscaling/en.html',
      'Cookie': `client_id=${clientId}`,
      ...formData.getHeaders()
    },
    body: formData
  });

  const filename = (await upload.text()).trim();
  let resultUrl;

  while (!resultUrl) {
    await new Promise(r => setTimeout(r, 1000));

    const res = await fetch('https://image-upscaling.net/upscaling_get_status', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://image-upscaling.net/upscaling/en.html',
        'Cookie': `client_id=${clientId}`
      }
    });

    const json = await res.json();
    resultUrl = json.processed?.find(v => v.includes(filename));
  }

  const img = await fetch(resultUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Referer': 'https://image-upscaling.net/upscaling/en.html',
      'Cookie': `client_id=${clientId}`
    }
  });

  return img.buffer();
}

module.exports = upscaleImage;