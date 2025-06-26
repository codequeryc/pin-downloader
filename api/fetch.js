import { getXataClient } from '../../lib/xata';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const { url, blogId } = req.query;
  if (!url || !blogId)
    return res.status(400).json({ success: false, message: "Missing blogId or URL." });

  const xata = getXataClient();
  const blog = await xata.db.blogs.filter({ blogId }).getFirst();

  if (!blog)
    return res.status(403).json({ success: false, message: "Unauthorized blog." });

  const video = await fetchPinterestMedia(url);
  if (!video)
    return res.status(404).json({ success: false, message: "Pinterest video not found." });

  res.json({ success: true, download: video });
}

async function fetchPinterestMedia(pinterestUrl) {
  try {
    const res = await fetch(pinterestUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await res.text();
    const match = html.match(/"contentUrl":"(https:\\/\\/v\.pinimg\.com[^"]+)/);
    return match ? match[1].replace(/\\u002F/g, '/').replace(/\\/g, '') : null;
  } catch {
    return null;
  }
}

