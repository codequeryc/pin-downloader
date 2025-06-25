import { signJWT } from "../lib/jwt.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { url, exp } = req.body;

    if (!url || !exp) return res.status(400).json({ error: "Missing payload" });

    const token = signJWT({ url, exp });
    return res.status(200).json({ token });
  } catch {
    return res.status(500).json({ error: "Failed to sign token" });
  }
}
