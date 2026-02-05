import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSessionStore } from "@/state/session-store";
import { Building2 } from "lucide-react";

function ProviderButton({
  label,
  onClick,
  testId,
}: {
  label: string;
  onClick: () => void;
  testId: string;
}) {
  return (
    <Button
      variant="secondary"
      className="w-full justify-between"
      onClick={onClick}
      data-testid={testId}
    >
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-background ring-1 ring-border">
          <Building2 className="h-4 w-4" />
        </span>
        {label}
      </span>
      <span className="text-xs text-muted-foreground">Mock</span>
    </Button>
  );
}

export default function Auth() {
  const [, navigate] = useLocation();
  const { user, signInMock, signOut } = useSessionStore();

  useEffect(() => {
    document.title = "JobHaven — Sign in";
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-lg px-4 py-12">
        <Card className="rounded-3xl border bg-card p-7 shadow-md" data-testid="card-auth">
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
                  signInMock({ provider: "google", name: "Alex Candidate", email: "alex@example.com" });
                  navigate("/");
                }}
                testId="button-auth-google"
              />
              <ProviderButton
                label="Continue with LinkedIn"
                onClick={() => {
                  signInMock({ provider: "linkedin", name: "Alex Candidate", email: "alex@linkedin.com" });
                  navigate("/");
                }}
                testId="button-auth-linkedin"
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
            This is a frontend-only prototype. When you share your Google Sheet link, we’ll swap the dummy data for live Sheet data.
          </p>
        </Card>
      </div>
    </div>
  );
}
