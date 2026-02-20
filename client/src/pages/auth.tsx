import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSessionStore } from "@/state/session-store";
import { Linkedin, Chrome, Sparkles } from "lucide-react";
import { SEOHead } from "./home";

function ProviderButton({
  label,
  onClick,
  testId,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  testId: string;
  icon: React.ElementType;
}) {
  return (
    <Button
      variant="secondary"
      className="w-full justify-between"
      onClick={onClick}
      data-testid={testId}
    >
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-background ring-1 ring-border">
          <Icon className="h-4 w-4" />
        </span>
        {label}
      </span>
      <span className="text-xs text-muted-foreground">OAuth</span>
    </Button>
  );
}

export default function Auth() {
  const [, navigate] = useLocation();
  const { user, signInWithProvider, signOut } = useSessionStore();

  return (
    <div className="min-h-screen">
      <SEOHead title="Sign In — Crypto Jobs" description="Sign in to save jobs and manage your shortlist." canonicalPath="/auth" />
      <main id="main-content" className="mx-auto max-w-lg px-4 py-12">
        <Card className="rounded-3xl border bg-card p-7 shadow-md" data-testid="card-auth">
          <div className="inline-flex items-center gap-2 self-start rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Secure sign in
          </div>
          <div className="font-serif text-3xl tracking-tight">Welcome</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to save jobs and view your shortlist.
          </p>

          <Separator className="my-6" />

          {!user ? (
            <div className="grid gap-3">
              <ProviderButton
                label="Continue with Google"
                onClick={() => {
                  signInWithProvider("google");
                }}
                testId="button-auth-google"
                icon={Chrome}
              />
              <ProviderButton
                label="Continue with LinkedIn"
                onClick={() => {
                  signInWithProvider("linkedin");
                }}
                testId="button-auth-linkedin"
                icon={Linkedin}
              />
            </div>
          ) : (
            <div>
              <div className="rounded-2xl border bg-background/60 p-4" data-testid="card-auth-user">
                <div className="text-sm font-medium" data-testid="text-user-name">{user.name}</div>
                <div className="text-sm text-muted-foreground" data-testid="text-user-email">{user.email}</div>
                <div className="mt-2 text-xs text-muted-foreground" data-testid="text-user-provider">
                  Signed in via {user.provider}
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <Button onClick={() => navigate("/saved")} data-testid="button-go-saved">
                  View saved jobs
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                  data-testid="button-signout"
                >
                  Sign out
                </Button>
              </div>
            </div>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            Secure OAuth via Google and LinkedIn. Your profile is stored in our database.
          </p>
        </Card>
      </main>
    </div>
  );
}
