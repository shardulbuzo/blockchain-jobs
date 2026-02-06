import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  res.setHeader(
    "Set-Cookie",
    "jobhaven_admin=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0",
  );
  res.status(200).json({ ok: true });
}
