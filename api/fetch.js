import { getXataClient } from '../../lib/xata';

export default async function handler(req, res) {
  try {
    const { blogId, url } = req.query;

    // Step 1: Validate
    if (!blogId || !url) {
      console.log("Missing blogId or url:", req.query);
      return res.status(400).json({ success: false, message: "Missing blogId or URL." });
    }

    // Step 2: Xata Connection
    const xata = getXataClient();
    console.log("Checking blogId in Xata:", blogId);

    const blog = await xata.db.list.filter({ blogId }).getFirst();

    if (!blog) {
      console.log("Blog ID not authorized:", blogId);
      return res.status(403).json({ success: false, message: "Unauthorized blog ID." });
    }

    // Step 3: Pinterest Video Extraction
    const videoUrl = await fetchPinterestMedia(url);
    console.log("Fetched video URL:", videoUrl);

    if (!videoUrl) {
      return res.status(404).json({ success: false, message: "Pinterest video not found." });
    }

    // Success
    return res.json({ success: true, download: videoUrl });

  } catch (err) {
    console.error("💥 API error:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

// 📌 Pinterest Media Fetcher
async function fetchPinterestMedia(pinterestUrl) {
  try {
    const resolvedUrl = await resolveShortUrl(pinterestUrl);
    const html = await fetch(resolvedUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }).then(r => r.text());

    const match = html.match(/"contentUrl":"(https:\\/\\/v\.pinimg\.com[^"]+)/);
    return match ? match[1].replace(/\\u002F/g, '/').replace(/\\/g, '') : null;

  } catch (err) {
    console.error("Error fetching Pinterest media:", err);
    return null;
  }
}

// 🔗 Resolve pin.it short URL
async function resolveShortUrl(shortUrl) {
  try {
    const res = await fetch(shortUrl, { method: 'HEAD', redirect: 'follow' });
    return res.url || shortUrl;
  } catch (err) {
    console.error("Error resolving short URL:", err);
    return shortUrl;
  }
}
