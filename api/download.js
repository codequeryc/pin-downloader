export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("❌ Missing media URL");

  try {
    const response = await fetch(url);
    if (!response.ok) return res.status(400).send("❌ Failed to fetch media");

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = await response.arrayBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 100000);
    let ext = "bin"; // fallback extension

    // Extract extension from content-type
    if (contentType.includes("video/mp4")) ext = "mp4";
    else if (contentType.includes("image/jpeg")) ext = "jpg";
    else if (contentType.includes("image/png")) ext = "png";
    else if (contentType.includes("image/gif")) ext = "gif";

    const filename = `pinterest-${timestamp}-${random}.${ext}`;

    // Set headers for download
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Cache-Control", "no-cache");

    res.status(200).send(Buffer.from(buffer));
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).send("❌ Internal Server Error");
  }
}
