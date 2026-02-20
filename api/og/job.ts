import type { VercelRequest, VercelResponse } from "@vercel/node";

function escape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const title = escape((req.query.title as string) || "Crypto Job");
  const company = escape((req.query.company as string) || "Company");
  const location = escape((req.query.location as string) || "Worldwide");
  const category = escape((req.query.category as string) || "Role");
  const featured = (req.query.featured as string) === "1";
  const brand = "web3jobs.ooo";

  const svg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0F1116"/>
        <stop offset="100%" stop-color="#1C2230"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" rx="48"/>
    <rect x="64" y="72" width="1072" height="486" rx="36" fill="#121721" stroke="#2A3345"/>
    <circle cx="148" cy="156" r="34" fill="#67E8F9"/>
    <text x="206" y="168" font-family="Inter, Arial, sans-serif" font-size="28" fill="#CFE7F5">Crypto Jobs</text>
    ${featured ? `<rect x="910" y="120" width="190" height="40" rx="20" fill="#F59E0B"/><text x="1005" y="146" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="18" fill="#111827">Featured</text>` : ""}

    <text x="96" y="250" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="700" fill="#F5F7FA">${title}</text>
    <text x="96" y="308" font-family="Inter, Arial, sans-serif" font-size="26" fill="#A7B0C0">${company} • ${location}</text>
    <text x="96" y="358" font-family="Inter, Arial, sans-serif" font-size="22" fill="#7CC7D6">${category}</text>

    <text x="96" y="520" font-family="Inter, Arial, sans-serif" font-size="20" fill="#9AA3B2">${brand}</text>
  </svg>
  `.trim();

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).send(svg);
}
