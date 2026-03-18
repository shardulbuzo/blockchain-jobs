import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  Building2,
  Plus,
  Globe,
  MapPin,
  Moon,
  Search,
  Sparkles,
  Sun,
  Tag,
  Twitter,
  Linkedin,
  Github,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useJobsStore } from "@/state/jobs-store";
import { useSessionStore } from "@/state/session-store";

type StructuredData = Record<string, unknown> | Array<Record<string, unknown>>;
type HomeSEO = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  structuredData?: StructuredData;
  keywords?: string[];
  ogImage?: string;
  noIndex?: boolean;
};

type HomeProps = {
  initialFilters?: Partial<Filters>;
  filterKey?: string;
  seoOverride?: HomeSEO;
  heading?: string;
  subheading?: React.ReactNode;
} & Record<string, unknown>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function upsertMeta(selector: string, create: () => HTMLMetaElement, content: string) {
  let meta = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!meta) {
    meta = create();
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function getSiteOrigin() {
  const configured = (import.meta as any)?.env?.VITE_SITE_URL as string | undefined;
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window === "undefined") return "https://web3jobs.ooo";
  if (window.location.hostname.includes("localhost")) return window.location.origin;
  return "https://web3jobs.ooo";
}

export function SEOHead({
  title,
  description,
  jobData,
  canonicalPath,
  noIndex = false,
  structuredData,
  keywords,
  siteName,
  ogImage,
}: {
  title?: string;
  description?: string;
  jobData?: { title: string; company: string; location: string };
  canonicalPath?: string;
  noIndex?: boolean;
  structuredData?: StructuredData;
  keywords?: string[];
  siteName?: string;
  ogImage?: string;
}) {
  const brand = siteName || "Crypto Jobs";
  const finalTitle = jobData 
    ? `Crypto jobs: ${jobData.title} at ${jobData.company} in ${jobData.location}`
    : title || `${brand} — Web3 & Blockchain Careers`;
  
  const finalDescription = description || "Find high-impact crypto, Web3, and blockchain roles worldwide.";

  useEffect(() => {
    document.title = finalTitle;
    const siteOrigin = getSiteOrigin();
    const url = new URL(canonicalPath || window.location.pathname, siteOrigin).toString();
    const imageUrl = ogImage || new URL("/opengraph.jpg", siteOrigin).toString();

    upsertMeta('meta[name="description"]', () => {
      const meta = document.createElement("meta");
      meta.name = "description";
      return meta;
    }, finalDescription);

    upsertMeta('meta[property="og:title"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:title");
      return meta;
    }, finalTitle);

    upsertMeta('meta[property="og:description"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:description");
      return meta;
    }, finalDescription);

    upsertMeta('meta[property="og:url"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:url");
      return meta;
    }, url);

    upsertMeta('meta[property="og:image"]', () => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:image");
      return meta;
    }, imageUrl);

    upsertMeta('meta[name="twitter:title"]', () => {
      const meta = document.createElement("meta");
      meta.name = "twitter:title";
      return meta;
    }, finalTitle);

    upsertMeta('meta[name="twitter:description"]', () => {
      const meta = document.createElement("meta");
      meta.name = "twitter:description";
      return meta;
    }, finalDescription);

    upsertMeta('meta[name="twitter:image"]', () => {
      const meta = document.createElement("meta");
      meta.name = "twitter:image";
      return meta;
    }, imageUrl);

    upsertMeta('meta[name="robots"]', () => {
      const meta = document.createElement("meta");
      meta.name = "robots";
      return meta;
    }, noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");

    if (keywords?.length) {
      upsertMeta('meta[name="keywords"]', () => {
        const meta = document.createElement("meta");
        meta.name = "keywords";
        return meta;
      }, keywords.join(", "));
    }

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    const scriptId = "seo-structured-data";
    const previousScript = document.getElementById(scriptId);
    if (structuredData) {
      const script = previousScript || document.createElement("script");
      script.id = scriptId;
      script.setAttribute("type", "application/ld+json");
      script.textContent = JSON.stringify(structuredData);
      if (!previousScript) {
        document.head.appendChild(script);
      }
    } else if (previousScript) {
      previousScript.remove();
    }
  }, [canonicalPath, finalDescription, finalTitle, noIndex, structuredData]);

  return null;
}

export function AdBanner() {
  const { adConfig } = useJobsStore();
  return (
    <div className="my-8 overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
      <a href={adConfig.targetUrl} target="_blank" rel="noreferrer" className="block relative aspect-[5/1] sm:aspect-[8/1]">
        <img src={adConfig.imageUrl} alt="Advertisement" className="h-full w-full object-cover" />
        <div className="absolute top-2 right-2 rounded bg-black/50 px-2 py-1 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">Ad</div>
      </a>
    </div>
  );
}

export function Header() {
  const [location, navigate] = useLocation();
  const { user } = useSessionStore();
  const { savedIds, submitJob, siteName, siteLogo } = useJobsStore();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    country: "",
    link: "",
    category: "",
    company: "",
    logo: "",
    tags: "",
    remote: "",
    sector: "",
    posterName: "",
    posterEmail: "",
    posterTelegram: "",
  });

  useEffect(() => {
    const stored = window.localStorage.getItem("jobhaven-theme");
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    const next = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("jobhaven-theme", next);
  };

  const handleSubmitJob = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = jobForm.tags
      .split(/[,;|]/)
      .map((t) => t.trim())
      .filter(Boolean);
    submitJob({
      id: `sub-${Date.now()}`,
      title: jobForm.title,
      description: jobForm.description,
      country: jobForm.country,
      link: jobForm.link,
      category: jobForm.category,
      company: jobForm.company,
      logo: jobForm.logo,
      tags,
      additionDate: new Date().toISOString().slice(0, 10),
      remote: jobForm.remote,
      sector: jobForm.sector,
      posterName: jobForm.posterName,
      posterEmail: jobForm.posterEmail,
      posterTelegram: jobForm.posterTelegram,
    });
    setOpen(false);
    setJobForm({
      title: "",
      description: "",
      country: "",
      link: "",
      category: "",
      company: "",
      logo: "",
      tags: "",
      remote: "",
      sector: "",
      posterName: "",
      posterEmail: "",
      posterTelegram: "",
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="mx-auto w-full px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/">
            <a
              className="group inline-flex items-center gap-2"
              data-testid="link-home"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent shadow-md ring-1 ring-black/5 overflow-hidden">
                {siteLogo && (
                  <img src={siteLogo} alt={`${siteName} logo`} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="leading-tight">
                <div className="font-serif text-lg tracking-tight">{siteName}</div>
                <div className="text-xs text-muted-foreground">Web3 & Blockchain Careers</div>
              </div>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium" aria-label="Primary">
             <Link href="/">
               <a className={cn("transition hover:text-primary", location === "/" ? "text-primary" : "text-muted-foreground")} aria-current={location === "/" ? "page" : undefined}>Jobs</a>
             </Link>
             <Link href="/companies">
               <a className={cn("transition hover:text-primary", location === "/companies" ? "text-primary" : "text-muted-foreground")} aria-current={location === "/companies" ? "page" : undefined}>Companies</a>
             </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="hidden sm:inline-flex"
              onClick={() => navigate("/saved")}
              aria-label="Saved jobs"
              data-testid="button-saved"
            >
              <Bookmark className="h-4 w-4" />
              <span className="sr-only">Saved</span>
              {savedIds.size > 0 && (
                <sup className="ml-1 text-[10px] font-semibold text-emerald-500">
                  {savedIds.size}
                </sup>
              )}
            </Button>
            <div className="hidden md:flex items-center gap-3 px-2">
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Visit Crypto Jobs on X">
                <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a href="https://www.linkedin.com/company/web3-jobs-ooo" target="_blank" rel="noreferrer" aria-label="Visit Crypto Jobs on LinkedIn">
                <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="Visit Crypto Jobs on GitHub">
                <Github className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </a>
            </div>
            <Button
              variant="secondary"
              size="icon"
              className="hidden sm:inline-flex overflow-hidden"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              data-testid="button-theme"
            >
              <span className={cn("transition-transform duration-300", theme === "dark" ? "rotate-0" : "-rotate-90")}>
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(user ? "/saved" : "/auth")}
              data-testid="button-auth"
            >
              {user ? "Account" : "Sign in"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="hidden lg:inline-flex shadow-sm" data-testid="button-post-job">
                  <Plus className="mr-2 h-4 w-4" />
                  Post a job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Post a Job</DialogTitle>
                  <DialogDescription>
                    Share role details and your contact info. Submissions appear in SuperAdmin for approval.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitJob} className="grid gap-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input placeholder="Job title" value={jobForm.title} onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })} required />
                    <Input placeholder="Company" value={jobForm.company} onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })} required />
                    <Input placeholder="Country" value={jobForm.country} onChange={(e) => setJobForm({ ...jobForm, country: e.target.value })} required />
                    <Input placeholder="Category" value={jobForm.category} onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })} required />
                    <Input placeholder="Sector" value={jobForm.sector} onChange={(e) => setJobForm({ ...jobForm, sector: e.target.value })} />
                    <Input placeholder="Remote / Hybrid / On-site" value={jobForm.remote} onChange={(e) => setJobForm({ ...jobForm, remote: e.target.value })} />
                    <Input placeholder="Apply link" value={jobForm.link} onChange={(e) => setJobForm({ ...jobForm, link: e.target.value })} required />
                    <Input placeholder="Company logo URL" value={jobForm.logo} onChange={(e) => setJobForm({ ...jobForm, logo: e.target.value })} />
                  </div>
                  <Textarea
                    placeholder="Job description (HTML supported)"
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    className="min-h-[160px]"
                    required
                  />
                  <Input placeholder="Tags (comma separated)" value={jobForm.tags} onChange={(e) => setJobForm({ ...jobForm, tags: e.target.value })} />
                  <Separator />
                  <div className="grid gap-3 md:grid-cols-3">
                    <Input placeholder="Your name" value={jobForm.posterName} onChange={(e) => setJobForm({ ...jobForm, posterName: e.target.value })} required />
                    <Input type="email" placeholder="Email" value={jobForm.posterEmail} onChange={(e) => setJobForm({ ...jobForm, posterEmail: e.target.value })} required />
                    <Input placeholder="Telegram ID" value={jobForm.posterTelegram} onChange={(e) => setJobForm({ ...jobForm, posterTelegram: e.target.value })} required />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Submit job</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero({ total }: { total: number }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-28 left-[-10%] h-[460px] w-[460px] rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="flex flex-col gap-6">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl leading-[1.04] tracking-tight sm:text-5xl">
              Curated crypto, Web3 & blockchain jobs — built for the next generation of builders.
            </h1>
            <p className="mt-3 text-base text-muted-foreground sm:text-lg">
              Search and filter high-impact roles by country and category.
              Your gateway to the blockchain ecosystem.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "Blockchain", icon: Globe },
              { label: "Web3 Engineering", icon: Tag },
              { label: "Smart Contracts", icon: Sparkles },
            ].map((pill) => (
              <div
                key={pill.label}
                className="inline-flex items-center gap-2 rounded-full bg-card px-3 py-1 text-xs text-muted-foreground shadow-xs ring-1 ring-border"
                data-testid={`pill-${pill.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <pill.icon className="h-3.5 w-3.5" />
                {pill.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({ categories, locations, siteName, siteLogo }: { categories: string[]; locations: string[]; siteName: string; siteLogo: string }) {
  return (
    <footer className="mt-12 border-t bg-card pt-12 pb-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary overflow-hidden">
                {siteLogo && <img src={siteLogo} alt={`${siteName} logo`} className="h-full w-full object-cover" />}
              </div>
              <span className="font-serif text-xl tracking-tight">{siteName}</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              The premier destination for crypto, Web3, and blockchain roles. We connect talented professionals with leading companies worldwide. Find your next high-impact role in the decentralized future.
            </p>
          </div>

          <div className="lg:col-span-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Jobs by Category</h4>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {categories.slice(0, 10).map(cat => (
                <a key={cat} href="#" className="hover:text-primary transition-colors">
                  Web3 {cat} Jobs
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4">
            <h4 className="font-semibold text-sm uppercase tracking-wider">Jobs by Country</h4>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              {locations.map(loc => (
                <a key={loc} href={`/country/${slugify(loc)}`} className="hover:text-primary transition-colors">
                  Blockchain Jobs in {loc}
                </a>
              ))}
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2026 Crypto Jobs. All rights reserved. Your trusted source for Web3 and blockchain opportunities.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

type Filters = {
  q: string;
  category: string;
  location: string;
  remote: string;
  sector: string;
};

function FiltersBar({
  filters,
  setFilters,
  categories,
  locations,
  sectors,
  categoryCounts,
  sectorCounts,
}: {
  filters: Filters;
  setFilters: (v: Filters) => void;
  categories: string[];
  locations: string[];
  sectors: string[];
  categoryCounts: Record<string, number>;
  sectorCounts: Record<string, number>;
}) {
  return (
    <Card className="mx-auto max-w-6xl border bg-card/80 p-4 shadow-sm backdrop-blur" role="search" aria-label="Filter jobs">
      <div className="grid gap-3 md:grid-cols-12 md:items-center">
        <div className="md:col-span-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search title, company, or keywords…"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
              className="pl-9"
              aria-label="Search jobs"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <Select
            value={filters.location}
            onValueChange={(v) => setFilters({ ...filters, location: v })}
          >
            <SelectTrigger aria-label="Filter by country" data-testid="select-location">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Select
            value={filters.remote}
            onValueChange={(v) => setFilters({ ...filters, remote: v })}
          >
            <SelectTrigger aria-label="Filter by remote type" data-testid="select-remote">
              <SelectValue placeholder="Remote" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="onsite">On-site</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-1">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() =>
              setFilters({
                q: "",
                category: "all",
                location: "all",
                remote: "all",
                sector: "all",
              })
            }
            data-testid="button-clear-filters"
          >
            Clear
          </Button>
        </div>

        <div className="md:col-span-12">
          <Separator />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="text-xs text-muted-foreground">Categories:</div>
            <Button
              variant={filters.category === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilters({ ...filters, category: "all" })}
              data-testid="button-cat-all"
            >
              All Roles
            </Button>
            {categories.map((c) => (
              <Button
                key={c}
                variant={filters.category === c ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilters({ ...filters, category: c })}
                data-testid={`button-cat-${c.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {c}
                <span className="ml-2 text-xs text-muted-foreground">{categoryCounts[c] || 0}</span>
              </Button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="text-xs text-muted-foreground">Sectors:</div>
            <Button
              variant={filters.sector === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setFilters({ ...filters, sector: "all" })}
              data-testid="button-sector-all"
            >
              All Sectors
            </Button>
            {sectors.slice(0, 8).map((sector) => (
              <Button
                key={sector}
                variant={filters.sector === sector ? "default" : "secondary"}
                size="sm"
                onClick={() => setFilters({ ...filters, sector })}
                data-testid={`button-sector-${sector.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {sector}
                <span className="ml-2 text-xs text-muted-foreground">{sectorCounts[sector] || 0}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

export function JobRow({ id }: { id: string }) {
  const { jobsById, toggleSaved, savedIds } = useJobsStore();
  const job = jobsById[id];
  const saved = savedIds.has(id);

  if (!job) return null;

  return (
    <Link href={`/job/${id}`}>
      <a
        className={cn(
          "group block rounded-2xl border bg-card p-4 shadow-sm transition",
          "hover:-translate-y-0.5 hover:shadow-md",
        )}
        data-testid={`card-job-${id}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 h-11 w-11 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-xs">
              {job.logo ? (
                <img
                  src={job.logo}
                  alt={`${job.company} logo`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  data-testid={`img-logo-${id}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Building2 className="h-5 w-5" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className="min-w-0 truncate font-semibold tracking-tight"
                  data-testid={`text-title-${id}`}
                >
                  {job.title}
                </h3>
                {job.featured && (
                  <Badge
                    className="bg-primary/10 text-primary hover:bg-primary/10"
                    data-testid={`badge-featured-${id}`}
                  >
                    Featured
                  </Badge>
                )}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span
                  className="inline-flex items-center gap-1"
                  data-testid={`text-company-${id}`}
                >
                  <Building2 className="h-4 w-4" />
                  {job.company}
                </span>
                <span
                  className="inline-flex items-center gap-1"
                  data-testid={`text-location-${id}`}
                >
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </span>
                <span
                  className="inline-flex items-center gap-1"
                  data-testid={`text-category-${id}`}
                >
                  <Tag className="h-4 w-4" />
                  {job.category}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {job.tags.slice(0, 4).map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="rounded-full"
                    data-testid={`badge-tag-${id}-${t.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {t}
                  </Badge>
                ))}
                {job.sector && (
                  <Badge
                    variant="secondary"
                    className="rounded-full border border-primary/20 bg-primary/5 text-primary"
                    data-testid={`badge-sector-${id}`}
                  >
                    {job.sector}
                  </Badge>
                )}
                {job.remote !== "" && (
                  <Badge
                    className="rounded-full bg-accent/10 text-accent hover:bg-accent/10"
                    data-testid={`badge-remote-${id}`}
                  >
                    <Globe className="mr-1 h-3.5 w-3.5" />
                    {job.remote}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            className={cn(
              "mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-background/60 text-muted-foreground",
              "transition hover:text-foreground hover:shadow-sm",
              saved && "bg-primary/10 text-primary border-primary/20",
            )}
            onClick={(e) => {
              e.preventDefault();
              toggleSaved(id);
            }}
            aria-label={saved ? "Unsave" : "Save"}
            aria-pressed={saved}
            data-testid={`button-save-${id}`}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
        </div>
      </a>
    </Link>
  );
}

export default function Home({ initialFilters, filterKey, seoOverride, heading, subheading }: HomeProps = {}) {
  const [location, setLocation] = useLocation();
  const { jobIds, categories, locations, jobsById, sectors, loaded, siteName, siteLogo } = useJobsStore();
  const baseFilters: Filters = {
    q: "",
    category: "all",
    location: "all",
    remote: "all",
    sector: "all",
  };
  const [filters, setFilters] = useState<Filters>(baseFilters);
  const [page, setPage] = useState(1);
  const pageSize = 100;
  const syncingRef = useRef(false);

  const parseQuery = (search: string) => {
    const params = new URLSearchParams(search);
    const nextFilters: Filters = {
      q: params.get("q") || "",
      category: params.get("category") || "all",
      location: params.get("country") || "all",
      remote: params.get("remote") || "all",
      sector: params.get("sector") || "all",
    };
    const nextPage = Math.max(1, Number(params.get("page") || "1"));
    return { nextFilters, nextPage, hasQuery: params.toString().length > 0 };
  };

  const buildQuery = (nextFilters: Filters, nextPage: number) => {
    const params = new URLSearchParams();
    if (nextFilters.q) params.set("q", nextFilters.q);
    if (nextFilters.category !== "all") params.set("category", nextFilters.category);
    if (nextFilters.sector !== "all") params.set("sector", nextFilters.sector);
    if (nextFilters.location !== "all") params.set("country", nextFilters.location);
    if (nextFilters.remote !== "all") params.set("remote", nextFilters.remote);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const updateUrl = (nextFilters: Filters, nextPage: number) => {
    const [path] = location.split("?");
    const query = buildQuery(nextFilters, nextPage);
    const next = `${path}${query}`;
    if (next !== location) setLocation(next);
  };

  useEffect(() => {
    if (initialFilters || filterKey) {
      setFilters({ ...baseFilters, ...initialFilters });
    }
  }, [filterKey]);

  useEffect(() => {
    const [, search = ""] = location.split("?");
    const { nextFilters, nextPage, hasQuery } = parseQuery(search);
    if (!hasQuery && (initialFilters || filterKey)) return;
    syncingRef.current = true;
    setFilters(nextFilters);
    setPage(nextPage);
    setTimeout(() => {
      syncingRef.current = false;
    }, 0);
  }, [location]);

  const counts = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    const sectorCounts: Record<string, number> = {};
    jobIds.forEach((id) => {
      const job = jobsById[id];
      if (!job) return;
      if (job.category) categoryCounts[job.category] = (categoryCounts[job.category] || 0) + 1;
      if (job.sector) sectorCounts[job.sector] = (sectorCounts[job.sector] || 0) + 1;
    });
    return { categoryCounts, sectorCounts };
  }, [jobIds, jobsById]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();

    return jobIds.filter((id) => {
      const j = jobsById[id];
      if (!j) return false;

      if (
        q &&
        !(
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.category.toLowerCase().includes(q) ||
          j.location.toLowerCase().includes(q) ||
          j.tags.join(" ").toLowerCase().includes(q) ||
          (j.sector || "").toLowerCase().includes(q)
        )
      ) {
        return false;
      }

      if (filters.category !== "all" && j.category !== filters.category) return false;
      if (filters.location !== "all" && j.location !== filters.location) return false;
      if (filters.sector !== "all" && (j.sector || "") !== filters.sector) return false;

      if (filters.remote !== "all") {
        const r = j.remote.toLowerCase();
        if (filters.remote === "remote" && !r.includes("remote")) return false;
        if (filters.remote === "hybrid" && !r.includes("hybrid")) return false;
        if (filters.remote === "onsite" && !r.includes("on-site") && !r.includes("onsite"))
          return false;
      }

      return true;
    });
  }, [jobIds, filters, jobsById]);

  useEffect(() => {
    if (syncingRef.current) return;
    setPage(1);
    updateUrl(filters, 1);
  }, [filters, filterKey]);

  useEffect(() => {
    if (syncingRef.current) return;
    updateUrl(filters, page);
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  const featured = useMemo(
    () => filtered.filter((id) => jobsById[id]?.featured),
    [filtered, jobsById],
  );

  const homeStructuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Crypto Jobs",
      url: window.location.origin,
      description: "Curated crypto, Web3, and blockchain jobs with fast filtering by country, category, and sector.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${window.location.origin}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    }),
    [],
  );

  return (
    <div className="min-h-screen">
      <SEOHead
        title={seoOverride?.title || `${siteName} — Web3 & Blockchain Careers`}
        description={seoOverride?.description || "AI-optimized job board for crypto, Web3, blockchain, DeFi, and fintech roles. Browse verified jobs, featured roles, and companies hiring worldwide."}
        canonicalPath={seoOverride?.canonicalPath || "/"}
        structuredData={seoOverride?.structuredData || homeStructuredData}
        siteName={siteName}
        ogImage={seoOverride?.ogImage || `${getSiteOrigin()}/api/og/home`}
        noIndex={seoOverride?.noIndex}
        keywords={[
          "web3 jobs",
          "blockchain jobs",
          "crypto jobs",
          "defi jobs",
          "fintech jobs",
          "smart contract jobs",
          "remote web3 jobs",
          "web3 companies hiring",
          ...(seoOverride?.keywords || []),
        ]}
      />
      <Header />
      <Hero total={jobIds.length} />

      <main id="main-content" className="mx-auto max-w-6xl px-4">
        <div className="-mt-8 sm:-mt-10">
          <FiltersBar
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            locations={locations}
            sectors={sectors}
            categoryCounts={counts.categoryCounts}
            sectorCounts={counts.sectorCounts}
          />
        </div>

        <AdBanner />

        {featured.length > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl tracking-tight">Featured roles</h2>
                <p className="mt-1 text-sm text-muted-foreground">Handpicked roles from the Featured Jobs sheet.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              {featured.slice(0, 6).map((id, idx) => (
                <motion.div
                  key={`featured-${id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.25) }}
                >
                  <JobRow id={id} />
                </motion.div>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">{heading || "Latest Crypto Jobs"}</h2>
            <p className="mt-1 text-sm text-muted-foreground" data-testid="text-results" aria-live="polite">
              {subheading || (
                <>
                  Showing <span className="font-medium text-foreground">{filtered.length}</span> blockchain jobs
                </>
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {!loaded && (
            <Card className="rounded-2xl border bg-card p-8 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <div className="text-sm text-muted-foreground">Loading jobs…</div>
              </div>
            </Card>
          )}

          {loaded &&
            paged.map((id, idx) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.25) }}
              >
                <JobRow id={id} />
              </motion.div>
            ))}

          {loaded && filtered.length === 0 && (
            <Card className="rounded-2xl border bg-card p-8 text-center" data-testid="empty-results">
              <div className="mx-auto max-w-md">
                <div className="font-serif text-xl tracking-tight">No blockchain roles found</div>
                <p className="mt-2 text-sm text-muted-foreground">Try a different search or clear filters.</p>
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    onClick={() =>
                    setFilters({
                      q: "",
                      category: "all",
                      location: "all",
                      remote: "all",
                      sector: "all",
                    })
                  }
                    data-testid="button-clear-empty"
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {loaded && totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={`page-${p}`}
                variant={p === page ? "default" : "secondary"}
                size="sm"
                onClick={() => setPage(p)}
                data-testid={`page-${p}`}
              >
                {p}
              </Button>
            ))}
          </div>
        )}
      </main>
      <Footer categories={categories} locations={locations} siteName={siteName} siteLogo={siteLogo} />
    </div>
  );
}
