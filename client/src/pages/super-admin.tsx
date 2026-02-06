import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Image, Link as LinkIcon, Save, Lock, LogIn, AlertCircle, Megaphone, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobsStore } from "@/state/jobs-store";
import { useSessionStore } from "@/state/session-store";
import { Header, SEOHead } from "./home";

export default function SuperAdmin() {
  const { adConfig, updateAdConfig, jobSubmissions, publishSubmission, analyticsId, setAnalyticsId } = useJobsStore();
  const { users } = useSessionStore();
  const [newAdConfig, setNewAdConfig] = useState(adConfig);
  const [gaInput, setGaInput] = useState(analyticsId || "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState("");
  
  const candidates = useMemo(
    () =>
      users.map((user, idx) => ({
        id: idx + 1,
        name: user.name,
        email: user.email,
        provider: user.provider,
        linkedin: user.linkedin || "—",
      })),
    [users],
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Invalid administrative credentials.");
        return;
      }
      setIsAuthenticated(true);
      setAdminEmail(email);
      window.localStorage.setItem("jobhaven-admin-email", email);
      await fetch("/api/admin/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_login",
          actor: email,
          details: "Superadmin login successful",
        }),
      });
    } catch {
      setError("Unable to reach admin auth service.");
    }
  };

  const handleSaveAd = async () => {
    updateAdConfig(newAdConfig);
    if (adminEmail) {
      await fetch("/api/admin/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ad_update",
          actor: adminEmail,
          details: `Updated banner to ${newAdConfig.targetUrl}`,
        }),
      });
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    if (adminEmail) {
      await fetch("/api/admin/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "admin_logout",
          actor: adminEmail,
          details: "Superadmin logout",
        }),
      });
    }
    setIsAuthenticated(false);
  };

  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/me")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setIsAuthenticated(Boolean(data?.authenticated));
      })
      .catch(() => {
        if (!mounted) return;
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (!mounted) return;
        setChecking(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("jobhaven-admin-email");
    if (stored) {
      setAdminEmail(stored);
    }
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-muted/30">
        <SEOHead title="SuperAdmin Access — Restricted" canonicalPath="/superadmin007" noIndex />
        <Header />
        <main id="main-content" className="mx-auto max-w-md px-4 py-24 text-center text-muted-foreground">
          Checking access...
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30">
      <SEOHead title="SuperAdmin Access — Restricted" canonicalPath="/superadmin007" noIndex />
        <Header />
        <main id="main-content" className="mx-auto max-w-md px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-3xl border shadow-xl overflow-hidden">
              <div className="h-2 bg-destructive" />
              <CardHeader className="text-center pb-2">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
                  <Lock className="h-6 w-6" />
                </div>
                <CardTitle className="font-serif text-2xl">Restricted Access</CardTitle>
                <CardDescription>Enter your SuperAdmin credentials to continue</CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4 pt-4">
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs font-medium text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Email</label>
                    <Input 
                      type="email" 
                      placeholder="admin@jobhaven.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
                    <Input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 pb-8">
                  <Button type="submit" className="w-full gap-2 h-11 text-base shadow-md">
                    <LogIn className="h-4 w-4" />
                    Verify Identity
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                    Access is logged and monitored
                  </p>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <SEOHead title="SuperAdmin Dashboard — JobHaven" canonicalPath="/superadmin007" noIndex />
      <Header />
      <main id="main-content" className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-serif text-3xl tracking-tight">SuperAdmin Access</h1>
              <p className="text-sm text-muted-foreground italic">Restricted Internal Panel — Not Indexed</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>

        <Tabs defaultValue="candidates" className="space-y-6">
          <TabsList className="bg-card border p-1 rounded-xl">
            <TabsTrigger value="candidates" className="rounded-lg gap-2">
              <Users className="h-4 w-4" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="advertising" className="rounded-lg gap-2">
              <Image className="h-4 w-4" />
              Advertising
            </TabsTrigger>
            <TabsTrigger value="submissions" className="rounded-lg gap-2">
              <Megaphone className="h-4 w-4" />
              Job Submissions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-lg gap-2">
              <Sparkles className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="candidates">
            <Card className="rounded-2xl border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Registered Candidates</CardTitle>
                <CardDescription>View and manage all users who have signed up to the platform.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Auth Provider</TableHead>
                        <TableHead>LinkedIn</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.email}</TableCell>
                          <TableCell className="capitalize">{c.provider}</TableCell>
                          <TableCell>{c.linkedin}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advertising">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="rounded-2xl border bg-card shadow-sm">
                <CardHeader>
                  <CardTitle>Global Ad Banner</CardTitle>
                  <CardDescription>Update the advertisement banner shown across the platform.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Banner Image URL</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Image className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input 
                          value={newAdConfig.imageUrl} 
                          onChange={(e) => setNewAdConfig({...newAdConfig, imageUrl: e.target.value})}
                          className="pl-9"
                          placeholder="https://..." 
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Target URL</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        value={newAdConfig.targetUrl} 
                        onChange={(e) => setNewAdConfig({...newAdConfig, targetUrl: e.target.value})}
                        className="pl-9"
                        placeholder="https://..." 
                      />
                    </div>
                  </div>
                  <Button className="w-full mt-4 gap-2" onClick={handleSaveAd}>
                    <Save className="h-4 w-4" />
                    Save Banner Changes
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>How the banner currently looks to users.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="rounded-xl border overflow-hidden">
                      <a href={newAdConfig.targetUrl} target="_blank" rel="noreferrer" className="block relative aspect-[4/1]">
                        <img src={newAdConfig.imageUrl} alt="Preview" className="h-full w-full object-cover" />
                        <div className="absolute top-2 right-2 rounded bg-black/50 px-2 py-1 text-[8px] font-bold text-white uppercase tracking-wider backdrop-blur-sm">Ad</div>
                      </a>
                   </div>
                   <p className="mt-4 text-xs text-muted-foreground text-center">Standard responsive banner behavior applied.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="submissions">
            <Card className="rounded-2xl border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Employer Job Submissions</CardTitle>
                <CardDescription>Review and promote approved roles to Featured Jobs.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Country</TableHead>
                        <TableHead>Poster</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {jobSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">{submission.title}</TableCell>
                          <TableCell>{submission.company}</TableCell>
                          <TableCell>{submission.country}</TableCell>
                          <TableCell>
                            <div className="text-sm">{submission.posterName}</div>
                            <div className="text-xs text-muted-foreground">{submission.posterEmail}</div>
                            <div className="text-xs text-muted-foreground">{submission.posterTelegram}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={async () => {
                                publishSubmission(submission.id, true);
                                if (adminEmail) {
                                  await fetch("/api/admin/log", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      action: "submission_promoted",
                                      actor: adminEmail,
                                      details: `Promoted ${submission.title} at ${submission.company} to featured`,
                                    }),
                                  });
                                }
                              }}
                            >
                              Post as Featured
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {jobSubmissions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                            No pending submissions yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="rounded-2xl border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Google Analytics</CardTitle>
                <CardDescription>Connect a GA4 Measurement ID to enable tracking.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="G-XXXXXXXXXX"
                  value={gaInput}
                  onChange={(e) => setGaInput(e.target.value)}
                />
                <Button
                  onClick={async () => {
                    setAnalyticsId(gaInput);
                    if (adminEmail) {
                      await fetch("/api/admin/log", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          action: "analytics_update",
                          actor: adminEmail,
                          details: `GA measurement ID set to ${gaInput}`,
                        }),
                      });
                    }
                  }}
                >
                  Save Measurement ID
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
