import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-grid">
      <div className="mx-auto max-w-lg px-4 py-14">
        <Card className="rounded-3xl border bg-card p-8 shadow-md" data-testid="card-404">
          <div className="font-serif text-3xl tracking-tight" data-testid="text-404-title">
            Page not found
          </div>
          <p className="mt-2 text-sm text-muted-foreground" data-testid="text-404-desc">
            The page you’re looking for doesn’t exist.
          </p>
          <div className="mt-6">
            <Button asChild data-testid="button-404-home">
              <Link href="/">
                <a className="inline-flex items-center" data-testid="link-404-home-anchor">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to jobs
                </a>
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
