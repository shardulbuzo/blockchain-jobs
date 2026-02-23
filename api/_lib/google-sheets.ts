import { google } from "googleapis";

type SheetData = {
  headers: string[];
  rows: string[][];
};

type CompanyRow = {
  name: string;
  url?: string;
  linkedin?: string;
  twitter?: string;
  logo?: string;
  ats?: string;
  sector?: string;
};

type CacheEntry = {
  jobs: any[];
  companies: CompanyRow[];
  expiresAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
let cache: CacheEntry | null = null;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function headerIndex(headers: string[]) {
  const map: Record<string, number> = {};
  headers.forEach((h, idx) => {
    map[normalizeHeader(h)] = idx;
  });
  return map;
}

function getCell(row: string[], indexMap: Record<string, number>, key: string) {
  const idx = indexMap[normalizeHeader(key)];
  if (idx === undefined) return "";
  return row[idx]?.trim?.() ?? "";
}

function parseTags(value: string) {
  if (!value) return [];
  return value
    .split(/[,;|\\n•]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stableHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function dateKey(value: string) {
  if (!value) return "";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "";
  const d = new Date(parsed);
  const yyyy = d.getUTCFullYear().toString();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}
function parseCredentials() {
  const raw =
    process.env.GOOGLE_SHEETS_CREDENTIALS ||
    process.env.GOOGLE_SHEETS_CREDENTIALS_B64 ||
    "";
  if (!raw) {
    throw new Error("Missing GOOGLE_SHEETS_CREDENTIALS or GOOGLE_SHEETS_CREDENTIALS_B64.");
  }
  if (raw.trim().startsWith("{")) {
    try {
      return JSON.parse(raw);
    } catch {
      // Some envs store newlines literally; escape them and retry.
      const repaired = raw.replace(/\n/g, "\\n");
      return JSON.parse(repaired);
    }
  }
  const decoded = Buffer.from(raw, "base64").toString("utf-8");
  return JSON.parse(decoded);
}

async function getSheetData(sheetName: string): Promise<SheetData> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID.");
  }

  const credentials = parseCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const range = `${sheetName}!A1:ZZ10000`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const values = response.data.values || [];
  const [headers = [], ...rows] = values;
  return {
    headers: headers.map((h) => (h ?? "").toString()),
    rows: rows.map((row) => row.map((cell) => (cell ?? "").toString())),
  };
}

export async function fetchJobsAndCompanies() {
  if (cache && cache.expiresAt > Date.now()) {
    return { jobs: cache.jobs, companies: cache.companies };
  }

  const jobsSheet = await getSheetData("Jobs");
  const companiesSheet = await getSheetData("companies");
  let featuredSheet: SheetData | null = null;
  try {
    featuredSheet = await getSheetData("Featured Jobs");
  } catch {
    featuredSheet = null;
  }

  const companyHeader = headerIndex(companiesSheet.headers);
  const companies = companiesSheet.rows
    .map((row) => {
      const name = getCell(row, companyHeader, "Company Name");
      if (!name) return null;
      const company: CompanyRow = {
        name,
        url: getCell(row, companyHeader, "URL"),
        linkedin: getCell(row, companyHeader, "Linkedin"),
        twitter: getCell(row, companyHeader, "Twitter"),
        logo: getCell(row, companyHeader, "Logo"),
        ats: getCell(row, companyHeader, "ATS Page Link"),
        sector: getCell(row, companyHeader, "Sector"),
      };
      return company;
    })
    .filter(Boolean) as CompanyRow[];

  const companyByName = new Map(
    companies.map((company) => [company.name.toLowerCase(), company]),
  );

  const featuredKey = new Set<string>();
  if (featuredSheet) {
    const featuredHeader = headerIndex(featuredSheet.headers);
    featuredSheet.rows.forEach((row) => {
      const title = getCell(row, featuredHeader, "Job title");
      const companyName = getCell(row, featuredHeader, "Company");
      if (!title || !companyName) return;
      featuredKey.add(`${companyName.toLowerCase()}::${title.toLowerCase()}`);
    });
  }

  const jobHeader = headerIndex(jobsSheet.headers);
  const jobs = jobsSheet.rows
    .map((row, idx) => {
      const title = getCell(row, jobHeader, "Job title");
      const companyName = getCell(row, jobHeader, "Company");
      if (!title || !companyName) return null;
      const jobIdRaw =
        getCell(row, jobHeader, "Job ID") ||
        getCell(row, jobHeader, "Job Id") ||
        getCell(row, jobHeader, "Slug");
      const company = companyByName.get(companyName.toLowerCase());
      const rawLogo = getCell(row, jobHeader, "Logo");
      const logo = rawLogo || company?.logo || "";
      const tags = parseTags(getCell(row, jobHeader, "Tags"));
      const sector = getCell(row, jobHeader, "Sector") || company?.sector || "";
      const link = getCell(row, jobHeader, "Link");
      const additionDate = getCell(row, jobHeader, "Addition date");
      const identitySeed = link || `${companyName}::${title}::${additionDate}`;
      const legacyId = `${slugify(companyName)}-${slugify(title)}-${idx + 1}`;
      const legacyHashId = `${slugify(companyName)}-${slugify(title)}-${stableHash(identitySeed)}`;
      const cleanedJobId = slugify(jobIdRaw);
      const baseParts = [slugify(companyName), slugify(title)];
      if (cleanedJobId) baseParts.push(cleanedJobId);
      const idBase = baseParts.filter(Boolean).join("-");

      return {
        id: idBase || `job-${stableHash(identitySeed)}`,
        legacyId,
        legacyHashId,
        title,
        description: getCell(row, jobHeader, "Job description"),
        location: getCell(row, jobHeader, "Country") || getCell(row, jobHeader, "Location"),
        link,
        category: getCell(row, jobHeader, "Category"),
        company: companyName,
        logo,
        tags,
        additionDate,
        country: getCell(row, jobHeader, "Country"),
        remote: getCell(row, jobHeader, "Remote"),
        sector,
        companyUrl: company?.url || "",
        companyTwitter: company?.twitter || "",
        companyLinkedin: company?.linkedin || "",
        companyAtsLink: company?.ats || "",
        featured: featuredKey.has(`${companyName.toLowerCase()}::${title.toLowerCase()}`),
      };
    })
    .filter(Boolean);

  cache = {
    jobs,
    companies,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };

  return { jobs, companies };
}

async function getSheetsClient() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    throw new Error("Missing GOOGLE_SHEET_ID.");
  }
  const credentials = parseCredentials();
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });
  return { sheets, spreadsheetId };
}

async function ensureSheetExists(title: string) {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  const existing = meta.data.sheets?.some((s) => s.properties?.title === title);
  if (existing) return { sheets, spreadsheetId };

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{ addSheet: { properties: { title } } }],
    },
  });
  return { sheets, spreadsheetId };
}

export async function logAdminAction(action: string, actor: string, details: string) {
  const { sheets, spreadsheetId } = await ensureSheetExists("Audit Logs");
  const headerRange = "Audit Logs!A1:D1";
  const header = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: headerRange,
  });
  if (!header.data.values || header.data.values.length === 0) {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: headerRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [["Timestamp", "Action", "Admin Email", "Details"]],
      },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: "Audit Logs!A:D",
    valueInputOption: "RAW",
    requestBody: {
      values: [[new Date().toISOString(), action, actor, details]],
    },
  });
}
