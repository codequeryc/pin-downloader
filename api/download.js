import https from "https";

export default function handler(req, res) {
  const { id } = req.query;

  if (!id) return res.status(400).send("Missing video ID");

  let videoUrl;
  try {
    videoUrl = Buffer.from(id, "base64").toString("utf-8");
  } catch {
    return res.status(400).send("Invalid base64");
  }

  const filename = `pinterest-${Date.now()}.mp4`;

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "video/mp4");

  https.get(videoUrl, (videoRes) => {
    videoRes.pipe(res);
  }).on("error", (err) => {
    res.status(500).send("Download failed.");
  });
}
