import type { VercelRequest, VercelResponse } from "@vercel/node";
import { logAdminAction } from "../_lib/google-sheets.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const token = req.cookies?.jobhaven_admin;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  if (!token || !expected || token !== expected) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const { action, actor, details } = req.body || {};
  if (!action || !actor) {
    res.status(400).json({ message: "Missing action or actor." });
    return;
  }

  try {
    await logAdminAction(action, actor, details || "");
    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to write audit log.", error: error?.message || "Unknown error" });
  }
}
