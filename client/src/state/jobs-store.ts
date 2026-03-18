import { useEffect, useState } from "react";

export type Job = {
  id: string;
  legacyId?: string;
  legacyHashId?: string;
  title: string;
  description: string;
  location: string;
  link: string;
  category: string;
  company: string;
  logo: string;
  tags: string[];
  additionDate: string;
  country: string;
  remote: string;
  sector?: string;
  companyUrl?: string;
  companyAtsLink?: string;
  featured?: boolean;
  companyTwitter?: string;
  companyLinkedin?: string;
};

export type Company = {
  name: string;
  url?: string;
  linkedin?: string;
  twitter?: string;
  logo?: string;
  ats?: string;
  sector?: string;
};

const CATEGORIES = [
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Partnerships & Business Development",
  "Legal",
  "Finance",
  "Operations",
  "People & HR",
  "Data & Analytics",
  "Security",
  "Customer Success",
  "Research",
  "Community",
  "Executive",
];

const dummyJobs: Job[] = [
  {
    id: "j1",
    title: "Senior Frontend Engineer (React)",
    description:
      "You’ll build a delightful Web3 job discovery experience with a focus on performance, accessibility, and craft in the blockchain space.\n\nWhat you’ll do:\n• Build polished UI components\n• Own the job detail page experience\n• Improve search and filtering\n\nNice to have:\n• TypeScript\n• Design systems\n• SEO fundamentals",
    location: "United Kingdom",
    link: "https://example.com/apply/frontend",
    category: "Engineering",
    company: "Lumen Labs",
    logo: "",
    tags: ["React", "Web3", "Blockchain"],
    additionDate: "2026-02-01",
    country: "United Kingdom",
    remote: "Hybrid",
    featured: true,
    companyTwitter: "https://twitter.com/lumenlabs",
    companyLinkedin: "https://linkedin.com/company/lumenlabs",
  },
  {
    id: "j2",
    title: "Product Designer — Growth",
    description:
      "Design experiments that improve activation and retention for our blockchain platform.\n\nResponsibilities:\n• Rapid prototyping\n• UX writing collaboration\n• Analytics-informed design decisions",
    location: "United States",
    link: "https://example.com/apply/designer",
    category: "Design",
    company: "Northwind",
    logo: "",
    tags: ["Product Design", "Web3", "Figma"],
    additionDate: "2026-01-30",
    country: "United States",
    remote: "Remote",
    featured: false,
    companyTwitter: "https://twitter.com/northwind",
  },
  {
    id: "j3",
    title: "AI Content Strategist",
    description:
      "Create SEO-forward content briefs for Web3 and blockchain job listings.\n\nYou’ll partner with engineering and design to ship content that ranks and reads well.",
    location: "Germany",
    link: "https://example.com/apply/content",
    category: "Marketing",
    company: "Aurora",
    logo: "",
    tags: ["SEO", "Web3", "Blockchain"],
    additionDate: "2026-01-28",
    country: "Germany",
    remote: "Remote",
    featured: true,
    companyLinkedin: "https://linkedin.com/company/aurora",
  },
  {
    id: "j4",
    title: "Backend Engineer (Platform)",
    description:
      "Build reliable services and internal blockchain infrastructure.",
    location: "Canada",
    link: "https://example.com/apply/backend",
    category: "Engineering",
    company: "StackRiver",
    logo: "",
    tags: ["Node.js", "Blockchain", "Web3"],
    additionDate: "2026-01-26",
    country: "Canada",
    remote: "On-site",
    featured: false,
  },
  {
    id: "j5",
    title: "Customer Success Manager",
    description:
      "Own customer onboarding for a fast-growing Web3 product.",
    location: "Australia",
    link: "https://example.com/apply/csm",
    category: "Customer Success",
    company: "Harbor",
    logo: "",
    tags: ["Web3", "Success", "B2B"],
    additionDate: "2026-01-25",
    country: "Australia",
    remote: "Hybrid",
    featured: false,
  },
];

const SECTOR_OVERRIDES: Record<string, string> = {
  defi: "DeFi",
};
const TAG_OVERRIDES: Record<string, string> = {
  defi: "DeFi",
};

function canonicalizeLabel(
  value: string,
  map: Map<string, string>,
  overrides: Record<string, string> = {},
) {
  const trimmed = value?.trim?.() || "";
  if (!trimmed) return "";
  const key = trimmed.toLowerCase();
  if (overrides[key]) return overrides[key];
  if (map.has(key)) return map.get(key) as string;
  map.set(key, trimmed);
  return trimmed;
}

export type AdConfig = {
  imageUrl: string;
  targetUrl: string;
};

export type JobSubmission = {
  id: string;
  title: string;
  description: string;
  country: string;
  link: string;
  category: string;
  company: string;
  logo: string;
  tags: string[];
  additionDate: string;
  remote: string;
  sector: string;
  posterName: string;
  posterEmail: string;
  posterTelegram: string;
};

export type JobsState = {
  jobsById: Record<string, Job>;
  jobIds: string[];
  savedIds: Set<string>;
  categories: string[];
  locations: string[];
  tags: string[];
  sectors: string[];
  companies: Company[];
  companiesByName: Record<string, Company>;
  adConfig: AdConfig;
  analyticsId: string;
  siteName: string;
  siteLogo: string;
  faviconUrl: string;
  jobSubmissions: JobSubmission[];
  loaded: boolean;
  toggleSaved: (id: string) => void;
  clearSaved: () => void;
  updateAdConfig: (config: AdConfig) => void;
  setJobs: (jobs: Job[]) => void;
  setCompanies: (companies: Company[]) => void;
  setAnalyticsId: (id: string) => void;
  setSiteSettings: (settings: { siteName: string; siteLogo: string; faviconUrl: string }) => void;
  submitJob: (submission: JobSubmission) => void;
  publishSubmission: (id: string, featured?: boolean) => void;
};

function uniqSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

const state: JobsState = {
  jobsById: {},
  jobIds: [],
  savedIds: new Set<string>(),
  categories: [],
  locations: [],
  tags: [],
  sectors: [],
  companies: [],
  companiesByName: {},
  adConfig: {
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2000&h=400",
    targetUrl: "https://replit.com",
  },
  analyticsId: "",
  siteName: "Crypto Jobs",
  siteLogo: "/logo-2c.svg",
  faviconUrl: "/logo-2c.svg",
  jobSubmissions: [],
  loaded: false,
  toggleSaved: (id) => {
    if (state.savedIds.has(id)) state.savedIds.delete(id);
    else state.savedIds.add(id);
    window.dispatchEvent(new Event("jobhaven:state_update"));
  },
  clearSaved: () => {
    state.savedIds.clear();
    window.dispatchEvent(new Event("jobhaven:state_update"));
  },
  updateAdConfig: (config) => {
    state.adConfig = config;
    window.dispatchEvent(new Event("jobhaven:state_update"));
  },
  setJobs: (jobs) => {
    const categoryMap = new Map<string, string>();
    const sectorMap = new Map<string, string>();
    const tagMap = new Map<string, string>();
    const normalizedJobs = jobs.map((job) => {
      const category = canonicalizeLabel(job.category, categoryMap);
      const sector = canonicalizeLabel(job.sector || "", sectorMap, SECTOR_OVERRIDES);
      const tags = job.tags.map((tag) => canonicalizeLabel(tag, tagMap, TAG_OVERRIDES)).filter(Boolean);
      return { ...job, category, sector, tags };
    });
    state.jobsById = Object.fromEntries(normalizedJobs.map((job) => [job.id, job]));
    state.jobIds = normalizedJobs.map((job) => job.id);
    state.categories = uniqSorted(normalizedJobs.map((job) => job.category));
    state.locations = uniqSorted(normalizedJobs.map((job) => job.location));
    state.tags = uniqSorted(normalizedJobs.flatMap((job) => job.tags));
    state.sectors = uniqSorted(normalizedJobs.map((job) => job.sector || ""));
    state.loaded = true;
    window.dispatchEvent(new Event("jobhaven:state_update"));
  },
  setCompanies: (companies) => {
    state.companies = companies;
    state.companiesByName = Object.fromEntries(
      companies.map((company) => [company.name.toLowerCase(), company]),
    );
    window.dispatchEvent(new Event("jobhaven:state_update"));
  },
  setAnalyticsId: (id) => {
    state.analyticsId = id;
    window.localStorage.setItem("jobhaven-analytics", id);
    window.dispatchEvent(new Event("jobhaven:state_update"));
  },
  setSiteSettings: (settings) => {
    state.siteName = settings.siteName;
    state.siteLogo = settings.siteLogo;
    state.faviconUrl = settings.faviconUrl;
    window.localStorage.setItem("jobhaven-site", JSON.stringify(settings));
    window.dispatchEvent(new Event("jobhaven:state_update"));
  },
  submitJob: (submission) => {
    state.jobSubmissions = [submission, ...state.jobSubmissions];
    window.localStorage.setItem("jobhaven-submissions", JSON.stringify(state.jobSubmissions));
    window.dispatchEvent(new Event("jobhaven:state_update"));
  },
  publishSubmission: (id, featured = false) => {
    const submission = state.jobSubmissions.find((item) => item.id === id);
    if (!submission) return;
    const jobId = `sub-${id}`;
    const job: Job = {
      id: jobId,
      title: submission.title,
      description: submission.description,
      location: submission.country,
      link: submission.link,
      category: submission.category,
      company: submission.company,
      logo: submission.logo,
      tags: submission.tags,
      additionDate: submission.additionDate,
      country: submission.country,
      remote: submission.remote,
      sector: submission.sector,
      featured,
    };
    if (!state.jobsById[jobId]) {
      state.jobsById = { [jobId]: job, ...state.jobsById };
      state.jobIds = [jobId, ...state.jobIds];
    } else {
      state.jobsById[jobId] = { ...job, featured };
    }
    state.jobSubmissions = state.jobSubmissions.filter((item) => item.id !== id);
    window.localStorage.setItem("jobhaven-submissions", JSON.stringify(state.jobSubmissions));
    window.dispatchEvent(new Event("jobhaven:state_update"));
  },
};

let fetchInFlight = false;

async function fetchJobsOnce() {
  if (state.loaded || fetchInFlight) return;
  fetchInFlight = true;
  try {
    const [jobsRes, companiesRes] = await Promise.all([
      fetch("/api/jobs"),
      fetch("/api/companies"),
    ]);
    if (jobsRes.ok) {
      const payload = await jobsRes.json();
      if (payload?.jobs?.length) {
        state.setJobs(payload.jobs);
      }
    }
    if (companiesRes.ok) {
      const payload = await companiesRes.json();
      if (payload?.companies?.length) {
        state.setCompanies(payload.companies);
      }
    }
  } catch {
    // keep dummy data on failure
  } finally {
    fetchInFlight = false;
  }
}

export function useJobsStore(): JobsState {
  const [, setTick] = useState(0);

  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener("jobhaven:state_update", on);
    return () => window.removeEventListener("jobhaven:state_update", on);
  }, []);

  useEffect(() => {
    fetchJobsOnce();
  }, []);

  useEffect(() => {
    if (!state.analyticsId) {
      const stored = window.localStorage.getItem("jobhaven-analytics");
      if (stored) {
        state.analyticsId = stored;
      }
    }
    if (!state.siteName || !state.siteLogo || !state.faviconUrl) {
      const stored = window.localStorage.getItem("jobhaven-site");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          state.siteName = parsed.siteName || state.siteName;
          state.siteLogo = parsed.siteLogo || "";
          state.faviconUrl = parsed.faviconUrl || "";
        } catch {
          // ignore
        }
      }
    }
    if (!state.jobSubmissions.length) {
      const stored = window.localStorage.getItem("jobhaven-submissions");
      if (stored) {
        try {
          state.jobSubmissions = JSON.parse(stored) as JobSubmission[];
        } catch {
          state.jobSubmissions = [];
        }
      }
    }
  }, []);

  return state;
}

useJobsStore.getState = () => state;
