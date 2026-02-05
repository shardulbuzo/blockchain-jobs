import { useEffect, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Building2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Header, Footer } from "./home";
import { useJobsStore } from "@/state/jobs-store";

export default function Companies() {
  const { jobIds, jobsById, categories, locations } = useJobsStore();

  useEffect(() => {
    document.title = "Companies — JobHaven";
  }, []);

  const companies = useMemo(() => {
    const counts: Record<string, { logo: string; count: number }> = {};
    jobIds.forEach(id => {
      const job = jobsById[id];
      if (!job) return;
      if (!counts[job.company]) {
        counts[job.company] = { logo: job.logo, count: 0 };
      }
      counts[job.company].count++;
    });
    return Object.entries(counts).map(([name, data]) => ({
      name,
      ...data
    })).sort((a, b) => b.count - a.count);
  }, [jobIds, jobsById]);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl tracking-tight">Top Web3 Companies</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Explore leading blockchain organizations and their latest career opportunities.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company, idx) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/company/${encodeURIComponent(company.name)}`}>
                <a className="group block">
                  <Card className="p-6 transition hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-muted shadow-xs">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <Building2 className="h-8 w-8" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-lg truncate">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">{company.count} open roles</p>
                      </div>
                      <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Card>
                </a>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer categories={categories} locations={locations} />
    </div>
  );
}
