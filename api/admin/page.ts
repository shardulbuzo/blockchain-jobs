import type { VercelRequest, VercelResponse } from "@vercel/node";
import { readFile } from "fs/promises";
import path from "path";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.cookies?.jobhaven_admin;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  if (!token || !expected || token !== expected) {
    res.status(302).setHeader("Location", "/admin-login").end();
    return;
  }

  const indexPath = path.join(process.cwd(), "dist", "public", "index.html");
  try {
    const html = await readFile(indexPath, "utf-8");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch {
    res.status(500).send("Failed to load admin app.");
  }
}
