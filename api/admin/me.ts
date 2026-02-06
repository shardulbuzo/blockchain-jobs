import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.cookies?.jobhaven_admin;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  if (token && expected && token === expected) {
    res.status(200).json({ authenticated: true });
    return;
  }
  res.status(200).json({ authenticated: false });
}
