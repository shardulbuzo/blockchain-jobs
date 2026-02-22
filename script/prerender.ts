import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fetchJobsAndCompanies } from "../api/_lib/google-sheets.ts";

const SITE_URL = "https://web3jobs.ooo";
const DEFAULT_TTL_DAYS = 60;

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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toIsoDate(value: string, fallback: string) {
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return fallback;
  return new Date(parsed).toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number) {
  const parsed = Date.parse(isoDate);
  if (Number.isNaN(parsed)) return isoDate;
  const date = new Date(parsed);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function withMeta(baseHtml: string, opts: {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
  bodyContent?: string;
}) {
  let html = baseHtml;

  const metaBlock = [
    `<title>${escapeHtml(opts.title)}</title>`,
    `<meta name="description" content="${escapeHtml(opts.description)}" />`,
    `<meta property="og:title" content="${escapeHtml(opts.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(opts.description)}" />`,
    `<meta property="og:url" content="${opts.canonical}" />`,
    opts.ogImage ? `<meta property="og:image" content="${opts.ogImage}" />` : "",
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(opts.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(opts.description)}" />`,
    opts.ogImage ? `<meta name="twitter:image" content="${opts.ogImage}" />` : "",
    `<link rel="canonical" href="${opts.canonical}" />`,
    opts.structuredData
      ? `<script type="application/ld+json">${JSON.stringify(opts.structuredData).replace(/</g, "\\u003c")}</script>`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  html = html.replace(/<title>[\s\S]*?<\/title>/i, "");
  html = html.replace(/<meta name="description"[^>]*>/i, "");

  html = html.replace("</head>", `${metaBlock}\n</head>`);

  if (opts.bodyContent) {
    html = html.replace(
      /<div id="root"><\/div>/i,
      `<div id="root">${opts.bodyContent}</div>`,
    );
  }

  return html;
}

function sitemapUrl(loc: string, lastmod?: string) {
  return [
    "<url>",
    `  <loc>${loc}</loc>`,
    lastmod ? `  <lastmod>${lastmod}</lastmod>` : "",
    "  <changefreq>daily</changefreq>",
    "  <priority>0.7</priority>",
    "</url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function writeFileSafe(filePath: string, content: string) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf-8");
}

async function run() {
  const distPublic = path.join(process.cwd(), "dist", "public");
  const baseHtml = await readFile(path.join(distPublic, "index.html"), "utf-8");

  const { jobs, companies } = await fetchJobsAndCompanies();

  const today = new Date().toISOString().slice(0, 10);
  const sitemapEntries: string[] = [];

  const homeItemList = jobs.slice(0, 20).map((job, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: `${SITE_URL}/job/${encodeURIComponent(job.id)}`,
    name: `${job.title} at ${job.company}`,
  }));

  const homeHtml = withMeta(baseHtml, {
    title: "Crypto Jobs | Web3 & Blockchain Roles",
    description:
      "Discover verified crypto and web3 jobs across engineering, product, marketing, and operations. Browse roles by company, sector, and location on Crypto Jobs.",
    canonical: `${SITE_URL}/`,
    ogImage: `${SITE_URL}/api/og/home`,
    structuredData: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          name: "Crypto Jobs",
          url: SITE_URL,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        },
        {
          "@type": "ItemList",
          name: "Latest crypto jobs",
          itemListElement: homeItemList,
        },
      ],
    },
    bodyContent: `<main><h1>Crypto Jobs</h1><p>Search verified crypto and web3 jobs by company, sector, and country.</p></main>`,
  });
  await writeFileSafe(path.join(distPublic, "index.html"), homeHtml);
  sitemapEntries.push(sitemapUrl(`${SITE_URL}/`, today));
  sitemapEntries.push(sitemapUrl(`${SITE_URL}/companies`, today));
  sitemapEntries.push(sitemapUrl(`${SITE_URL}/privacy`, today));

  for (const job of jobs) {
    const descriptionText = stripTags(job.description || "");
    const description = descriptionText.slice(0, 160) || "View this crypto job on Crypto Jobs.";
    const canonical = `${SITE_URL}/job/${encodeURIComponent(job.id)}`;
    const datePosted = toIsoDate(job.additionDate || "", today);
    const validThrough = addDays(datePosted, DEFAULT_TTL_DAYS);
    const ogImage = `${SITE_URL}/api/og/job?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&location=${encodeURIComponent(job.location)}&category=${encodeURIComponent(job.category)}&featured=${job.featured ? "1" : "0"}`;

    const structuredData: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "JobPosting",
          title: job.title,
          description: descriptionText || job.description,
          datePosted,
          validThrough,
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
          employmentType: job.category || undefined,
          industry: job.sector || undefined,
          directApply: Boolean(job.link),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: job.company,
              item: `${SITE_URL}/company/${encodeURIComponent(job.company)}`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: job.title,
              item: canonical,
            },
          ],
        },
      ],
    };

    const bodyContent = `
      <main>
        <h1>${escapeHtml(job.title)}</h1>
        <p>${escapeHtml(job.company)} • ${escapeHtml(job.location)} • ${escapeHtml(job.category)}</p>
        <section>${sanitizeHtml(job.description || "")}</section>
      </main>
    `;

    const jobHtml = withMeta(baseHtml, {
      title: `${job.title} at ${job.company} | Crypto Jobs`,
      description,
      canonical,
      ogImage,
      structuredData,
      bodyContent,
    });

    await writeFileSafe(path.join(distPublic, "job", job.id, "index.html"), jobHtml);
    sitemapEntries.push(sitemapUrl(canonical, datePosted));

    if (job.legacyId && job.legacyId !== job.id) {
      const redirectHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${canonical}" />
    <link rel="canonical" href="${canonical}" />
    <meta name="robots" content="noindex, follow" />
    <title>Redirecting…</title>
  </head>
  <body>
    <p>Redirecting to <a href="${canonical}">${escapeHtml(job.title)}</a></p>
  </body>
</html>`;
      await writeFileSafe(path.join(distPublic, "job", job.legacyId, "index.html"), redirectHtml);
    }
  }

  const jobsByCompany = new Map<string, number>();
  jobs.forEach((job) => {
    if (!job.company) return;
    jobsByCompany.set(job.company, (jobsByCompany.get(job.company) || 0) + 1);
  });

  for (const company of companies) {
    if (!jobsByCompany.get(company.name)) continue;
    const description = `Explore crypto jobs at ${company.name}. View company details and open roles on Crypto Jobs.`;
    const companySegment = encodeURIComponent(company.name);
    const canonical = `${SITE_URL}/company/${companySegment}`;
    const ogImage = `${SITE_URL}/api/og/company?name=${encodeURIComponent(company.name)}`;

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          name: company.name,
          url: company.url || undefined,
          logo: company.logo || undefined,
          sameAs: [company.linkedin, company.twitter].filter(Boolean),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "Companies",
              item: `${SITE_URL}/companies`,
            },
            { "@type": "ListItem", position: 3, name: company.name, item: canonical },
          ],
        },
      ],
    };

    const bodyContent = `
      <main>
        <h1>${escapeHtml(company.name)}</h1>
        <p>Crypto jobs and company profile for ${escapeHtml(company.name)}.</p>
      </main>
    `;

    const companyHtml = withMeta(baseHtml, {
      title: `${company.name} jobs | Crypto Jobs`,
      description,
      canonical,
      ogImage,
      structuredData,
      bodyContent,
    });

    await writeFileSafe(path.join(distPublic, "company", companySegment, "index.html"), companyHtml);
    sitemapEntries.push(sitemapUrl(canonical, today));
  }

  const categoryMap = new Map<string, typeof jobs>();
  const sectorMap = new Map<string, typeof jobs>();
  const countryMap = new Map<string, typeof jobs>();

  jobs.forEach((job) => {
    if (job.category) {
      const list = categoryMap.get(job.category) || [];
      list.push(job);
      categoryMap.set(job.category, list);
    }
    if (job.sector) {
      const list = sectorMap.get(job.sector) || [];
      list.push(job);
      sectorMap.set(job.sector, list);
    }
    if (job.location) {
      const list = countryMap.get(job.location) || [];
      list.push(job);
      countryMap.set(job.location, list);
    }
  });

  const buildListBody = (title: string, items: typeof jobs) => {
    const list = items
      .slice(0, 12)
      .map(
        (job) =>
          `<li><a href=\"/job/${encodeURIComponent(job.id)}\">${escapeHtml(job.title)}</a> at ${escapeHtml(job.company)}</li>`,
      )
      .join("");
    return `<main><h1>${escapeHtml(title)}</h1><ul>${list}</ul></main>`;
  };

  const buildItemListSchema = (title: string, items: typeof jobs) => ({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList",
        name: title,
        itemListElement: items.slice(0, 20).map((job, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          url: `${SITE_URL}/job/${encodeURIComponent(job.id)}`,
          name: `${job.title} at ${job.company}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: title, item: `${SITE_URL}` },
        ],
      },
    ],
  });

  for (const [category, items] of categoryMap.entries()) {
    const slug = slugify(category);
    const canonical = `${SITE_URL}/category/${slug}`;
    const title = `${category} Jobs`;
    const description = `Browse ${category} crypto and web3 jobs. Discover roles by company, sector, and location on Crypto Jobs.`;
    const bodyContent = buildListBody(title, items);
    const html = withMeta(baseHtml, {
      title: `${title} | Crypto Jobs`,
      description,
      canonical,
      ogImage: `${SITE_URL}/api/og/home`,
      structuredData: buildItemListSchema(title, items),
      bodyContent,
    });
    await writeFileSafe(path.join(distPublic, "category", slug, "index.html"), html);
    sitemapEntries.push(sitemapUrl(canonical, today));
  }

  for (const [sector, items] of sectorMap.entries()) {
    const slug = slugify(sector);
    const canonical = `${SITE_URL}/sector/${slug}`;
    const title = `${sector} Jobs`;
    const description = `Browse ${sector} crypto and web3 jobs. Discover roles by company, sector, and location on Crypto Jobs.`;
    const bodyContent = buildListBody(title, items);
    const html = withMeta(baseHtml, {
      title: `${title} | Crypto Jobs`,
      description,
      canonical,
      ogImage: `${SITE_URL}/api/og/home`,
      structuredData: buildItemListSchema(title, items),
      bodyContent,
    });
    await writeFileSafe(path.join(distPublic, "sector", slug, "index.html"), html);
    sitemapEntries.push(sitemapUrl(canonical, today));
  }

  for (const [country, items] of countryMap.entries()) {
    const slug = slugify(country);
    const canonical = `${SITE_URL}/country/${slug}`;
    const title = `Crypto Jobs in ${country}`;
    const description = `Browse crypto and web3 jobs in ${country}. Discover roles by company, sector, and category on Crypto Jobs.`;
    const bodyContent = buildListBody(title, items);
    const html = withMeta(baseHtml, {
      title: `${title} | Crypto Jobs`,
      description,
      canonical,
      ogImage: `${SITE_URL}/api/og/home`,
      structuredData: buildItemListSchema(title, items),
      bodyContent,
    });
    await writeFileSafe(path.join(distPublic, "country", slug, "index.html"), html);
    sitemapEntries.push(sitemapUrl(canonical, today));
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join("\n")}\n</urlset>`;
  await writeFileSafe(path.join(distPublic, "sitemap.xml"), sitemap);

  const robots = `User-agent: *\nAllow: /\n\n# AI Crawlers\nUser-agent: GPTBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: CCBot\nAllow: /\nUser-agent: Applebot\nAllow: /\nUser-agent: Applebot-Extended\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;
  await writeFileSafe(path.join(distPublic, "robots.txt"), robots);

  console.log(`prerendered ${jobs.length} jobs and ${companies.length} companies`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
