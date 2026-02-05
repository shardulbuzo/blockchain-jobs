import { useEffect, useMemo } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Bookmark,
  Building2,
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  Tag,
  Link as LinkIcon,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useJobsStore } from "@/state/jobs-store";
import { Header, Footer, SEOHead, AdBanner } from "./home";

function Stat({
  icon: Icon,
  label,
  value,
  testId,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  testId: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm" data-testid={testId}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <div className="mt-1 font-medium tracking-tight">{value}</div>
    </div>
  );
}

export default function JobDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/job/:id");
  const id = params?.id || "";

  const { jobsById, toggleSaved, savedIds, jobIds, categories, locations } = useJobsStore();
  const job = id ? jobsById[id] : undefined;
  const saved = id ? savedIds.has(id) : false;

  const companyJobsCount = useMemo(() => {
    if (!job) return 0;
    return jobIds.filter(jid => jobsById[jid]?.company === job.company).length;
  }, [job, jobIds, jobsById]);

  if (!job) {
    return (
      <div className="min-h-screen">
        <SEOHead title="Job Not Found — JobHaven" />
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-10">
          <Card className="rounded-2xl p-6" data-testid="card-job-missing">
            <div className="font-serif text-2xl">Job not found</div>
            <p className="mt-2 text-sm text-muted-foreground">
              This job might have been removed.
            </p>
            <div className="mt-4">
              <Button onClick={() => navigate("/")} data-testid="button-back-home">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to jobs
              </Button>
            </div>
          </Card>
        </div>
        <Footer categories={categories} locations={locations} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead 
        jobData={{ title: job.title, company: job.company, location: job.location }}
        description={job.description.slice(0, 160)}
      />
      <Header />
      <header className="sticky top-0 z-20 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm" data-testid="link-back">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-card shadow-xs">
                <ArrowLeft className="h-4 w-4" />
              </span>
              <span className="hidden sm:block text-muted-foreground">Back to jobs</span>
            </a>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => toggleSaved(job.id)}
              data-testid="button-save-job"
            >
              <Bookmark className={cn("mr-2 h-4 w-4", saved && "fill-current text-primary")} />
              {saved ? "Saved" : "Save"}
            </Button>
            <Button asChild data-testid="button-apply">
              <a href={job.link} target="_blank" rel="noreferrer">
                Apply
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-8">
        <AdBanner />
        
        <div className="grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-8">
            <Card className="rounded-3xl border bg-card p-6 shadow-md">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border bg-muted shadow-xs">
                  {job.logo ? (
                    <img
                      src={job.logo}
                      alt={`${job.company} logo`}
                      className="h-full w-full object-cover"
                      data-testid="img-job-logo"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Building2 className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-serif text-3xl tracking-tight" data-testid="text-job-title">
                      {job.title}
                    </h1>
                    {job.featured && (
                      <Badge
                        className="bg-primary/10 text-primary hover:bg-primary/10"
                        data-testid="badge-featured"
                      >
                        Featured
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <Link href={`/company/${encodeURIComponent(job.company)}`}>
                      <a className="inline-flex items-center gap-1 hover:text-primary transition-colors" data-testid="text-job-company">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </a>
                    </Link>
                    <span className="inline-flex items-center gap-1" data-testid="text-job-location">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-1" data-testid="text-job-category">
                      <Tag className="h-4 w-4" />
                      {job.category}
                    </span>
                    {job.remote && (
                      <span className="inline-flex items-center gap-1" data-testid="text-job-remote">
                        <Globe className="h-4 w-4" />
                        {job.remote}
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.tags.map((t) => (
                      <Badge
                        key={t}
                        variant="secondary"
                        className="rounded-full"
                        data-testid={`badge-job-tag-${t.toLowerCase().replace(/\s+/g, "-")}`}
                      >
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <article className="max-w-none">
                <h2 className="font-serif text-xl" data-testid="heading-description">
                  Job description
                </h2>
                <div className="mt-3 text-sm leading-7 text-foreground" data-testid="text-job-description">
                  {job.description.split("\n").map((p: string, idx: number) => (
                    <p key={idx} className="mb-3">
                      {p}
                    </p>
                  ))}
                </div>
              </article>
            </Card>
          </section>

          <aside className="lg:col-span-4 space-y-4">
            <div className="grid gap-3">
              <Stat icon={Calendar} label="Added" value={job.additionDate} testId="stat-added" />
              <Stat icon={Globe} label="Country" value={job.country} testId="stat-country" />
              <Stat icon={Tag} label="Category" value={job.category} testId="stat-category" />
            </div>

            <Card className="rounded-2xl border bg-card p-6 shadow-sm" data-testid="card-company">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-muted shadow-xs">
                    {job.logo ? (
                        <img src={job.logo} alt={job.company} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Building2 className="h-6 w-6" />
                        </div>
                    )}
                    </div>
                    <div>
                        <div className="font-semibold">{job.company}</div>
                        <div className="flex items-center gap-3 mt-1">
                          {job.link && (
                               <a href={job.link} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                  <LinkIcon className="h-3.5 w-3.5" />
                               </a>
                          )}
                          {job.companyTwitter && (
                            <a href={job.companyTwitter} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                               <Twitter className="h-3.5 w-3.5" />
                            </a>
                          )}
                          {job.companyLinkedin && (
                            <a href={job.companyLinkedin} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                               <Linkedin className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                    </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{companyJobsCount}</span> open roles
                    </div>
                    <Button variant="secondary" size="sm" asChild>
                        <Link href={`/company/${encodeURIComponent(job.company)}`}>
                            See all jobs
                        </Link>
                    </Button>
                </div>
            </Card>

            <Card className="rounded-2xl border bg-card p-4 shadow-sm" data-testid="card-actions">
              <div className="text-sm font-medium">Quick actions</div>
              <div className="mt-3 grid gap-2">
                <Button
                  variant="secondary"
                  onClick={() => toggleSaved(job.id)}
                  data-testid="button-save-2"
                >
                  <Bookmark className={cn("mr-2 h-4 w-4", saved && "fill-current text-primary")} />
                  {saved ? "Saved" : "Save"}
                </Button>
                <Button asChild data-testid="button-apply-2">
                  <a href={job.link} target="_blank" rel="noreferrer">
                    Apply on company site
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </Card>
          </aside>
        </div>
      </main>
      <Footer categories={categories} locations={locations} />
    </div>
  );
}
