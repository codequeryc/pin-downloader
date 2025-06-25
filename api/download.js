import crypto from 'crypto';

const SECRET_KEY = 'my_secret_key';

function validateToken(url, expires, token) {
  const valid = crypto.createHmac('sha256', SECRET_KEY)
    .update(url + expires)
    .digest('hex');

  return token === valid && Math.floor(Date.now() / 1000) <= parseInt(expires);
}

export default async function handler(req, res) {
  const { url, expires, token, name } = req.query;

  if (!url || !expires || !token || !name)
    return res.status(400).send('Missing required parameters');

  if (!validateToken(url, expires, token)) {
    return res.status(403).send('Invalid or expired token');
  }

  // Force download by suggesting a filename
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  res.setHeader('Cache-Control', 'no-cache');
  res.writeHead(302, { Location: url }); // 👈 redirect directly to Pinterest file
  return res.end();
}
