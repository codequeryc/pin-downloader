export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ success: false, error: "URL is required" });

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0", // some pages block bots
      },
    });

    if (!response.ok) {
      return res.status(400).json({ success: false, error: "Failed to load Pinterest page" });
    }

    const html = await response.text();

    // Match video URL in the HTML
    const videoRegex = /"contentUrl":"(https:\/\/[^"]+\.mp4)"/;
    const imageRegex = /"url":"(https:\/\/i\.pinimg\.com\/[^"]+\.(?:jpg|png|webp))"/;

    let mediaUrl = null;

    const videoMatch = html.match(videoRegex);
    if (videoMatch) {
      mediaUrl = videoMatch[1].replace(/\\u002F/g, "/");
    } else {
      const imageMatch = html.match(imageRegex);
      if (imageMatch) {
        mediaUrl = imageMatch[1].replace(/\\u002F/g, "/");
      }
    }

    if (!mediaUrl) {
      return res.status(404).json({ success: false, error: "❌ Media not found in the page." });
    }

    return res.json({ success: true, mediaUrl });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
