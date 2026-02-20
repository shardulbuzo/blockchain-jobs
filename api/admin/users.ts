import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.cookies?.jobhaven_admin;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  if (!token || !expected || token !== expected) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    res.status(500).json({ message: "Supabase admin credentials missing." });
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    res.status(500).json({ message: "Failed to load users.", error: error.message });
    return;
  }

  const users = (data?.users || []).map((user) => ({
    id: user.id,
    email: user.email || "",
    provider: user.app_metadata?.provider || "unknown",
    name: user.user_metadata?.full_name || user.email || "Candidate",
    linkedin: user.user_metadata?.profile || user.user_metadata?.linkedin || "",
    lastSignIn: user.last_sign_in_at,
    createdAt: user.created_at,
  }));

  res.status(200).json({ users });
}
