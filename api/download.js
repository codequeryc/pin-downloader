import crypto from 'crypto';

const SECRET_KEY = 'my_secret_key';

function validateToken(url, expires, token) {
  const expected = crypto.createHmac('sha256', SECRET_KEY)
    .update(url + expires)
    .digest('hex');

  return expected === token && Math.floor(Date.now() / 1000) <= parseInt(expires);
}

export default async function handler(req, res) {
  const { url, expires, token, name } = req.query;

  if (!url || !expires || !token || !name) {
    return res.status(400).send('Missing parameters');
  }

  if (!validateToken(url, expires, token)) {
    return res.status(403).send('Link expired or invalid token');
  }

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(404).send('File not found');

    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    res.setHeader('Content-Type', 'video/mp4');

    response.body.pipe(res); // stream video
  } catch (e) {
    res.status(500).send('Download failed');
  }
}
