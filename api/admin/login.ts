import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const { email, password } = req.body || {};
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionToken = process.env.ADMIN_SESSION_TOKEN;

  if (!adminEmail || !adminPassword || !sessionToken) {
    res.status(500).json({ message: "Admin auth is not configured." });
    return;
  }

  if (email !== adminEmail || password !== adminPassword) {
    res.status(401).json({ message: "Invalid credentials." });
    return;
  }

  res.setHeader(
    "Set-Cookie",
    `jobhaven_admin=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${60 * 60 * 6}`,
  );
  res.status(200).json({ ok: true });
}
