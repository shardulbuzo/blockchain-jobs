import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchJobsAndCompanies } from "./_lib/google-sheets.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const { jobs } = await fetchJobsAndCompanies();
    res.status(200).json({ jobs });
  } catch (error: any) {
    res.status(500).json({
      message: "Failed to load jobs from Google Sheets.",
      error: error?.message || "Unknown error",
    });
  }
}
