import https from "https";
import { REDIRECT_URL } from "../lib/config.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { id } = req.query;

  if (!id) return res.redirect(302, REDIRECT_URL);

  let videoUrl;
  try {
    videoUrl = Buffer.from(id, "base64").toString("utf-8");
  } catch {
    return res.status(400).send("Invalid base64 ID.");
  }

  const filename = `pinterest-${Date.now()}.mp4`;

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "video/mp4");

  https.get(videoUrl, (videoRes) => {
    videoRes.pipe(res);
  }).on("error", () => {
    res.status(500).send("Download failed.");
  });
}
