import { REDIRECT_URL } from "../lib/config.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { url } = req.query;

  // ✅ Redirect if URL is missing
  if (!url) {
    res.writeHead(302, { Location: REDIRECT_URL });
    return res.end();
  }

  let finalUrl = url;

  // 🔁 Resolve short link if pin.it
  if (url.includes("pin.it")) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      const location = response.headers.get("location");

      if (location && location.includes("pinterest.com")) {
        finalUrl = location;
      } else {
        return res.status(400).json({ error: "Invalid Pinterest short URL" });
      }
    } catch {
      return res.status(400).json({ error: "Failed to resolve short link" });
    }
  }

  try {
    const page = await fetch(finalUrl);
    const html = await page.text();
    const match = html.match(/"contentUrl":"(https:[^"]+\.mp4[^"]*)"/);

    if (match && match[1]) {
      return res.status(200).json({ video: match[1] });
    } else {
      return res.status(404).json({ error: "No video found" });
    }
  } catch {
    return res.status(500).json({ error: "Failed to fetch Pinterest page" });
  }
}
