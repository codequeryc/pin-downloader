import crypto from 'crypto';

const SECRET_KEY = 'my_secret_key';

function validateToken(url, expires, token) {
  const valid = crypto.createHmac('sha256', SECRET_KEY)
    .update(url + expires)
    .digest('hex');

  return valid === token && Math.floor(Date.now() / 1000) <= parseInt(expires);
}

export default async function handler(req, res) {
  const { url, expires, token, name } = req.query;

  if (!url || !expires || !token || !name)
    return res.status(400).send('Missing required parameters');

  if (!validateToken(url, expires, token)) {
    return res.status(403).send('Expired or invalid link');
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0' // force Pinterest to allow stream
      }
    });

    if (!response.ok) return res.status(404).send('File not found');

    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');

    const reader = response.body.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      }
    });

    return new Response(stream).body.pipeTo(res);
  } catch (err) {
    return res.status(500).send('Download failed');
  }
}
