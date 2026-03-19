import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchJobsAndCompanies } from "./_lib/google-sheets.js";

const SITE_URL = "https://web3jobs.ooo";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stripTags(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=("[^"]*"|'[^']*')/gi, "")
    .replace(/javascript:/gi, "");
}

function notFound(res: VercelResponse) {
  res.status(404).setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page Not Found | Crypto Jobs</title>
    <meta name="description" content="The requested page could not be found on Crypto Jobs." />
    <meta name="robots" content="noindex, follow" />
  </head>
  <body>
    <main>
      <h1>Page not found</h1>
      <p>The URL you requested does not exist on Crypto Jobs.</p>
      <a href="/">Back to home</a>
    </main>
  </body>
</html>`);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  const type = typeof req.query.type === "string" ? req.query.type : "";
  const id = typeof req.query.id === "string" ? decodeURIComponent(req.query.id) : "";

  if (type !== "job" || !id) {
    notFound(res);
    return;
  }

  try {
    const { jobs } = await fetchJobsAndCompanies();
    const job = jobs.find(
      (item: any) => item.id === id || item.legacyId === id || item.legacyHashId === id,
    );

    if (!job) {
      notFound(res);
      return;
    }

    const canonical = `${SITE_URL}/job/${encodeURIComponent(job.id)}`;

    if (job.id !== id) {
      res.status(302).setHeader("Location", canonical).end();
      return;
    }

    const descriptionText = stripTags(job.description || "");
    const description = descriptionText.slice(0, 160) || "View this crypto job on Crypto Jobs.";
    const ogImage = `${SITE_URL}/api/og/job?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location)}&category=${encodeURIComponent(job.category)}&featured=${job.featured ? "1" : "0"}`;
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: job.title,
      description: descriptionText || job.description,
      datePosted: job.additionDate || undefined,
      hiringOrganization: {
        "@type": "Organization",
        name: job.company,
        url: job.companyUrl || undefined,
        logo: job.logo || undefined,
        sameAs: [job.companyLinkedin, job.companyTwitter].filter(Boolean),
      },
      identifier: {
        "@type": "PropertyValue",
        name: job.company,
        value: job.id,
      },
      ...(job.remote?.toLowerCase().includes("remote")
        ? {
            jobLocationType: "TELECOMMUTE",
            applicantLocationRequirements: {
              "@type": "Country",
              name: job.country || job.location,
            },
          }
        : {
            jobLocation: {
              "@type": "Place",
              address: {
                "@type": "PostalAddress",
                addressCountry: job.country || job.location,
              },
            },
          }),
    };

    res.status(200).setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(job.title)} at ${escapeHtml(job.company)} | Crypto Jobs</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(job.title)} at ${escapeHtml(job.company)} | Crypto Jobs" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogImage}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(job.title)} at ${escapeHtml(job.company)} | Crypto Jobs" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="robots" content="index, follow, max-image-preview:large" />
    <link rel="canonical" href="${canonical}" />
    <script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(job.title)}</h1>
      <p>${escapeHtml(job.company)} • ${escapeHtml(job.location)} • ${escapeHtml(job.category)}</p>
      <section>${sanitizeHtml(job.description || "")}</section>
    </main>
  </body>
</html>`);
  } catch {
    res.status(500).json({ message: "Failed to load content." });
  }
}
