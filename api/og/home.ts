import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
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
    <text x="96" y="220" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="700" fill="#F5F7FA">Crypto Jobs</text>
    <text x="96" y="290" font-family="Inter, Arial, sans-serif" font-size="26" fill="#A7B0C0">Web3 & Blockchain Careers</text>
    <text x="96" y="520" font-family="Inter, Arial, sans-serif" font-size="20" fill="#9AA3B2">web3jobs.ooo</text>
  </svg>
  `.trim();

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).send(svg);
}
