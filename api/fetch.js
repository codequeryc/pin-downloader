import crypto from 'crypto';

const SECRET_KEY = 'my_secret_key'; // Change this securely
const EXPIRE_TIME = 300; // 5 minutes

function generateToken(url, expires) {
  return crypto.createHmac('sha256', SECRET_KEY)
    .update(url + expires)
    .digest('hex');
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: "Missing URL" });

  try {
    const html = await fetch(url).then(r => r.text());
    const match = html.match(/"contentUrl":"(https:\/\/[^"]+\.mp4)"/);
    if (!match) return res.status(404).json({ success: false, error: "Video not found." });

    const mediaUrl = match[1].replace(/\\u002F/g, '/');

    const expires = Math.floor(Date.now() / 1000) + EXPIRE_TIME;
    const token = generateToken(mediaUrl, expires);

    const filename = `Pinterest-${Date.now()}.mp4`;
    const downloadLink = `${req.headers.host}/api/download?url=${encodeURIComponent(mediaUrl)}&expires=${expires}&token=${token}&name=${encodeURIComponent(filename)}`;

    res.json({
      success: true,
      media: mediaUrl,
      download: `https://${downloadLink}`
    });
  } catch (e) {
    res.status(500).json({ success: false, error: "Server error" });
  }
}
