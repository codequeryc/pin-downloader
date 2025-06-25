export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*"); // 👈 ADD THIS

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing URL" });

  let finalUrl = url;

  if (url.includes("pin.it")) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      finalUrl = response.headers.get("location") || url;
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
    return res.status(500).json({ error: "Failed to fetch page" });
  }
}

