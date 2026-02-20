import { useMemo } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { Building2, ArrowLeft, Twitter, Linkedin, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header, Footer, JobRow, SEOHead } from "./home";
import { useJobsStore } from "@/state/jobs-store";

export default function CompanyDetail() {
  const [, params] = useRoute("/company/:id");
  const companyName = params?.id ? decodeURIComponent(params.id) : "";
  const { jobIds, jobsById, categories, locations, companiesByName, loaded, siteName, siteLogo } = useJobsStore();

  const companyJobs = useMemo(() => {
    return jobIds.filter(id => jobsById[id]?.company === companyName);
  }, [companyName, jobIds, jobsById]);

  const companyData = useMemo<Partial<import("@/state/jobs-store").Job & import("@/state/jobs-store").Company> | null>(() => {
    const fromSheet = companiesByName[companyName.toLowerCase()];
    if (fromSheet) return fromSheet;
    const firstJobId = companyJobs[0];
    return firstJobId ? jobsById[firstJobId] : null;
  }, [companyJobs, companyName, companiesByName, jobsById]);

  if (!loaded && companyJobs.length === 0) {
    return (
      <div className="min-h-screen">
        <SEOHead title={`Loading Company — ${siteName}`} canonicalPath={`/company/${encodeURIComponent(companyName)}`} noIndex siteName={siteName} />
        <Header />
        <main id="main-content" className="mx-auto max-w-6xl px-4 py-12 text-sm text-muted-foreground">
          Loading company details…
        </main>
        <Footer categories={categories} locations={locations} siteName={siteName} siteLogo={siteLogo} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`${companyName} Crypto Jobs — ${siteName}`}
        description={`Browse open crypto, Web3, and blockchain roles at ${companyName}.`}
        canonicalPath={`/company/${encodeURIComponent(companyName)}`}
        siteName={siteName}
        ogImage={`https://web3jobs.ooo/api/og/company?name=${encodeURIComponent(companyName)}`}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: companyName,
          sameAs: [companyData?.twitter, companyData?.linkedin, companyData?.companyTwitter, companyData?.companyLinkedin].filter(Boolean),
          url: companyData?.url || companyData?.companyUrl || undefined,
        }}
      />
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-12">
        <Link href="/companies">
          <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to companies
          </a>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-12">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-3xl border bg-card shadow-sm p-4">
                {companyData?.logo ? (
                    <img src={companyData.logo} alt={companyName} className="h-full w-full object-contain" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Building2 className="h-10 w-10" />
                    </div>
                )}
            </div>
            <div className="flex-1">
                <h1 className="font-serif text-4xl tracking-tight">{companyName}</h1>
                <div className="flex items-center gap-4 mt-3">
                    {companyData?.url || companyData?.companyUrl ? (
                         <a href={companyData?.url || companyData?.companyUrl} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5">
                            <LinkIcon className="h-4 w-4" />
                            Website
                         </a>
                    ) : null}
                    {companyData?.twitter || companyData?.companyTwitter ? (
                      <a href={companyData?.twitter || companyData?.companyTwitter} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5">
                         <Twitter className="h-4 w-4" />
                         Twitter
                      </a>
                    ) : null}
                    {companyData?.linkedin || companyData?.companyLinkedin ? (
                      <a href={companyData?.linkedin || companyData?.companyLinkedin} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5">
                         <Linkedin className="h-4 w-4" />
                         LinkedIn
                      </a>
                    ) : null}
                </div>
            </div>
        </div>

        <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl tracking-tight">Open Roles ({companyJobs.length})</h2>
        </div>

        <div className="grid gap-3">
          {companyJobs.map((id, idx) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <JobRow id={id} />
            </motion.div>
          ))}
          {companyJobs.length === 0 && (
              <p className="text-muted-foreground text-center py-12">No open roles found for this company.</p>
          )}
        </div>
      </main>
      <Footer categories={categories} locations={locations} siteName={siteName} siteLogo={siteLogo} />
    </div>
  );
}
