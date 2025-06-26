import { getXataClient } from '../../lib/xata';

export default async function handler(req, res) {
  console.log("[/api/fetch] query:", req.query);
  try {
    const { blogId, url } = req.query;
    if (!blogId || !url) throw new Error("Missing blogId or URL");

    const xata = getXataClient();
    const blog = await xata.db.list.filter({ blogId }).getFirst();
    if (!blog) return res.status(403).json({ success: false, message: "Unauthorized blog ID." });

    const video = await fetchPinterestMedia(url);
    if (!video) return res.status(404).json({ success: false, message: "Pinterest video not found." });

    return res.json({ success: true, download: video });
  } catch (err) {
    console.error("💥 Error in /api/fetch:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function fetchPinterestMedia(pinterestUrl) {
  try {
    const resp = await fetch(pinterestUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const html = await resp.text();
    const m = html.match(/"contentUrl":"(https:\\/\\/v\.pinimg\.com[^"]+)/);
    return m ? m[1].replace(/\\u002F/g, '/').replace(/\\/g, '') : null;
  } catch (err) {
    console.error("Error in fetchPinterestMedia:", err);
    return null;
  }
}
