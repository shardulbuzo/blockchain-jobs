import type { VercelRequest, VercelResponse } from "@vercel/node";

function escape(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  const name = escape((req.query.name as string) || "Company");
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
    <text x="96" y="190" font-family="Inter, Arial, sans-serif" font-size="30" fill="#9AA3B2">Company</text>
    <text x="96" y="260" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="700" fill="#F5F7FA">${name}</text>
    <text x="96" y="340" font-family="Inter, Arial, sans-serif" font-size="24" fill="#7CC7D6">Open roles on Crypto Jobs</text>
    <text x="96" y="520" font-family="Inter, Arial, sans-serif" font-size="20" fill="#9AA3B2">${brand}</text>
  </svg>
  `.trim();

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).send(svg);
}
