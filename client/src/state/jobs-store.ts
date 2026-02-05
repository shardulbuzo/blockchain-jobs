import { useEffect, useState } from "react";

export type Job = {
  id: string;
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
  featured?: boolean;
  companyTwitter?: string;
  companyLinkedin?: string;
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

export type AdConfig = {
  imageUrl: string;
  targetUrl: string;
};

export type JobsState = {
  jobsById: Record<string, Job>;
  jobIds: string[];
  savedIds: Set<string>;
  categories: string[];
  locations: string[];
  tags: string[];
  adConfig: AdConfig;
  toggleSaved: (id: string) => void;
  clearSaved: () => void;
  updateAdConfig: (config: AdConfig) => void;
};

function uniqSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

const state: JobsState = {
  jobsById: Object.fromEntries(dummyJobs.map((j) => [j.id, j])),
  jobIds: dummyJobs.map((j) => j.id),
  savedIds: new Set<string>(),
  categories: CATEGORIES,
  locations: uniqSorted(dummyJobs.map((j) => j.location)),
  tags: uniqSorted(dummyJobs.flatMap((j) => j.tags)),
  adConfig: {
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2000&h=400",
    targetUrl: "https://replit.com",
  },
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
  }
};

export function useJobsStore(): JobsState {
  const [, setTick] = useState(0);

  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener("jobhaven:state_update", on);
    return () => window.removeEventListener("jobhaven:state_update", on);
  }, []);

  return state;
}

useJobsStore.getState = () => state;
