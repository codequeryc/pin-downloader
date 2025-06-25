import https from "https";
import { verifyJWT } from "../lib/jwt.js";
import { REDIRECT_URL } from "../lib/config.js";

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { token } = req.query;
  if (!token) return res.redirect(302, REDIRECT_URL);

  const payload = verifyJWT(token);
  if (!payload || !payload.url || !payload.exp) {
    return res.status(403).send("❌ Invalid or tampered token.");
  }

  if (Date.now() > payload.exp) {
    return res.status(403).send("❌ Download link expired.");
  }

  const filename = `pinterest-${Date.now()}.mp4`;

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Content-Type", "video/mp4");

  https.get(payload.url, (videoRes) => {
    videoRes.pipe(res);
  }).on("error", () => {
    res.status(500).send("❌ Download failed.");
  });
}
