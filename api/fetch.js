import { getXataClient } from '../../lib/xata';

export default async function handler(req, res) {
  const { url, blogId } = req.query;
  if (!url || !blogId)
    return res.status(400).json({ success: false, message: "Missing blogId or URL." });

  const xata = getXataClient();

  try {
    // Check blogId in `list` table
    const blog = await xata.db.list.filter({ blogId }).getFirst();

    if (!blog)
      return res.status(403).json({ success: false, message: "Unauthorized blog ID." });

    // Fetch Pinterest video
    const video = await fetchPinterestMedia(url);

    if (!video)
      return res.status(404).json({ success: false, message: "Pinterest video not found." });

    return res.json({ success: true, download: video });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// Helper: Fetch video from Pinterest
async function fetchPinterestMedia(pinterestUrl) {
  try {
    const resolvedUrl = await resolveShortUrl(pinterestUrl);
    const html = await fetch(resolvedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).then(r => r.text());

    const match = html.match(/"contentUrl":"(https:\\/\\/v\.pinimg\.com[^"]+)/);

    return match ? match[1].replace(/\\u002F/g, '/').replace(/\\/g, '') : null;
  } catch {
    return null;
  }
}

// Helper: Unshorten pin.it URLs
async function resolveShortUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    return res.url || url;
  } catch {
    return url;
  }
}
