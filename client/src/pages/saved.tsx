import { useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useJobsStore } from "@/state/jobs-store";
import { useSessionStore } from "@/state/session-store";
import { ArrowLeft, Bookmark, Lock } from "lucide-react";

export default function SavedJobs() {
  const [, navigate] = useLocation();
  const { user } = useSessionStore();
  const { savedIds, jobsById } = useJobsStore();

  useEffect(() => {
    document.title = "JobHaven — Saved";
  }, []);

  const savedJobs = useMemo(() => {
    return Array.from(savedIds)
      .map((id) => jobsById[id])
      .filter(Boolean);
  }, [savedIds, jobsById]);

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <Card className="rounded-3xl border bg-card p-7 shadow-md" data-testid="card-auth-required">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              Sign in required
            </div>
            <div className="mt-2 font-serif text-3xl tracking-tight">Save jobs to build a shortlist</div>
            <p className="mt-2 text-sm text-muted-foreground">
              In this prototype, sign-in is mocked. In the full app, we’ll connect Google and LinkedIn login.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => navigate("/auth")} data-testid="button-go-auth">
                Go to sign in
              </Button>
              <Button variant="secondary" onClick={() => navigate("/")} data-testid="button-back-jobs">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to jobs
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-sm" data-testid="link-back-home">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-card shadow-xs">
                <ArrowLeft className="h-4 w-4" />
              </span>
              <span className="hidden sm:block text-muted-foreground">Jobs</span>
            </a>
          </Link>

          <div className="inline-flex items-center gap-2 text-sm">
            <Bookmark className="h-4 w-4" />
            Saved
            <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border" data-testid="text-saved-count">
              {savedJobs.length}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-14 pt-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-serif text-3xl tracking-tight">Your shortlist</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Jobs you’ve saved for later.
            </p>
          </div>
          <Button variant="secondary" onClick={() => useJobsStore.getState().clearSaved()} data-testid="button-clear-saved">
            Clear
          </Button>
        </div>

        <Separator className="my-6" />

        <div className="grid gap-3">
          {savedJobs.map((j) => (
            <Link key={j.id} href={`/job/${j.id}`}>
              <a className="rounded-2xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-testid={`row-saved-${j.id}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium" data-testid={`text-saved-title-${j.id}`}>{j.title}</div>
                    <div className="mt-1 text-sm text-muted-foreground" data-testid={`text-saved-meta-${j.id}`}>
                      {j.company} • {j.location}
                    </div>
                  </div>
                  <Badge variant="secondary" className="rounded-full" data-testid={`badge-saved-category-${j.id}`}>{j.category}</Badge>
                </div>
              </a>
            </Link>
          ))}

          {savedJobs.length === 0 && (
            <Card className="rounded-3xl border bg-card p-10 text-center" data-testid="empty-saved">
              <div className="font-serif text-2xl tracking-tight">No saved jobs yet</div>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse the job list and hit “Save”.
              </p>
              <div className="mt-5">
                <Button onClick={() => navigate("/")} data-testid="button-browse">
                  Browse jobs
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
