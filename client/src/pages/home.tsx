import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bookmark,
  Building2,
  Globe,
  MapPin,
  Search,
  Sparkles,
  Tag,
  Twitter,
  Linkedin,
  Github,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useJobsStore } from "@/state/jobs-store";
import { useSessionStore } from "@/state/session-store";

export function SEOHead({ title, description, jobData }: { title?: string; description?: string; jobData?: { title: string; company: string; location: string } }) {
  const finalTitle = jobData 
    ? `Web3 and Blockchain jobs : ${jobData.title} job at ${jobData.company} at ${jobData.location}`
    : title || "JobHaven — Web3 & Blockchain Jobs";
  
  const finalDescription = description || "Find high-impact Web3 and Blockchain roles.";

  useEffect(() => {
    document.title = finalTitle;
    
    // Update meta tags for social media
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", finalTitle);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", finalDescription);

    // Mock OG image generation (visual representation in code)
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage && jobData) {
      // In a real app, this would be a dynamic image generator URL
      // ogImage.setAttribute("content", `https://api.jobhaven.com/og?title=${encodeURIComponent(jobData.title)}&company=${encodeURIComponent(jobData.company)}&location=${encodeURIComponent(jobData.location)}`);
    }
  }, [finalTitle, finalDescription, jobData]);

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
  const { savedIds } = useJobsStore();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link href="/">
            <a
              className="group inline-flex items-center gap-2"
              data-testid="link-home"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-accent shadow-md ring-1 ring-black/5" />
              <div className="leading-tight">
                <div className="font-serif text-lg tracking-tight">JobHaven</div>
                <div className="text-xs text-muted-foreground">Web3 & Blockchain Jobs</div>
              </div>
            </a>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
             <Link href="/">
               <a className={cn("transition hover:text-primary", location === "/" ? "text-primary" : "text-muted-foreground")}>Jobs</a>
             </Link>
             <Link href="/companies">
               <a className={cn("transition hover:text-primary", location === "/companies" ? "text-primary" : "text-muted-foreground")}>Companies</a>
             </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="hidden sm:inline-flex"
              onClick={() => navigate("/saved")}
              data-testid="button-saved"
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Saved
              <span
                className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border"
                data-testid="text-saved-count"
              >
                {savedIds.size}
              </span>
            </Button>
            <Button
              onClick={() => navigate(user ? "/saved" : "/auth")}
              data-testid="button-auth"
            >
              {user ? "Account" : "Sign in"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Hero({ total }: { total: number }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-28 left-[-10%] h-[460px] w-[460px] rounded-full bg-accent/20 blur-3xl" />

      <div className="grain relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 self-start rounded-full border bg-card/60 px-3 py-1 text-xs text-muted-foreground shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI-optimized Web3 Job Board
            <span
              className="rounded-full bg-primary/10 px-2 py-0.5 text-primary"
              data-testid="text-total-roles"
            >
              {total} roles
            </span>
          </div>

          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl leading-[1.04] tracking-tight sm:text-5xl">
              Curated Web3 & Blockchain jobs — built for the next generation of builders.
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

export function Footer({ categories, locations }: { categories: string[]; locations: string[] }) {
  return (
    <footer className="mt-12 border-t bg-card pt-12 pb-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="font-serif text-xl tracking-tight">JobHaven</span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              The premier destination for Web3 jobs and Blockchain jobs. We connect talented professionals with leading crypto companies worldwide. Find your next high-impact role in the decentralized future.
            </p>
            <div className="mt-6 flex gap-4">
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Github className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
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
                <a key={loc} href="#" className="hover:text-primary transition-colors">
                  Blockchain Jobs in {loc}
                </a>
              ))}
              <a href="#" className="hover:text-primary transition-colors">Web3 Jobs in Singapore</a>
              <a href="#" className="hover:text-primary transition-colors">Blockchain Jobs in UAE</a>
            </div>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2026 JobHaven. All rights reserved. Your trusted source for Web3 and Blockchain opportunities.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
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
};

function FiltersBar({
  filters,
  setFilters,
  categories,
  locations,
}: {
  filters: Filters;
  setFilters: (v: Filters) => void;
  categories: string[];
  locations: string[];
}) {
  return (
    <Card className="mx-auto max-w-6xl border bg-card/80 p-4 shadow-sm backdrop-blur">
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
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="md:col-span-3">
          <Select
            value={filters.location}
            onValueChange={(v) => setFilters({ ...filters, location: v })}
          >
            <SelectTrigger data-testid="select-location">
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
            <SelectTrigger data-testid="select-remote">
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
            data-testid={`button-save-${id}`}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </button>
        </div>
      </a>
    </Link>
  );
}

export default function Home() {
  const { jobIds, categories, locations, jobsById } = useJobsStore();
  const [filters, setFilters] = useState<Filters>({
    q: "",
    category: "all",
    location: "all",
    remote: "all",
  });

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
          j.tags.join(" ").toLowerCase().includes(q)
        )
      ) {
        return false;
      }

      if (filters.category !== "all" && j.category !== filters.category) return false;
      if (filters.location !== "all" && j.location !== filters.location) return false;

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

  return (
    <div className="min-h-screen">
      <SEOHead title="JobHaven — Web3 & Blockchain Jobs" description="Curated list of the best Web3 and blockchain opportunities." />
      <Header />
      <Hero total={jobIds.length} />

      <main className="mx-auto max-w-6xl px-4">
        <div className="-mt-8 sm:-mt-10">
          <FiltersBar
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            locations={locations}
          />
        </div>

        <AdBanner />

        <div className="mt-8 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Latest Web3 roles</h2>
            <p className="mt-1 text-sm text-muted-foreground" data-testid="text-results">
              Showing <span className="font-medium text-foreground">{filtered.length}</span> blockchain jobs
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {filtered.map((id, idx) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(idx * 0.02, 0.25) }}
            >
              <JobRow id={id} />
            </motion.div>
          ))}

          {filtered.length === 0 && (
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
      </main>
      <Footer categories={categories} locations={locations} />
    </div>
  );
}
