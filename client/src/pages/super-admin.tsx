import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Image, Link as LinkIcon, Save, Lock, LogIn, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobsStore } from "@/state/jobs-store";
import { Header } from "./home";

export default function SuperAdmin() {
  const { adConfig, updateAdConfig } = useJobsStore();
  const [newAdConfig, setNewAdConfig] = useState(adConfig);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // Mock candidate data
  const candidates = [
    { id: 1, name: "Alex Candidate", email: "alex@example.com", provider: "google", savedJobs: 3 },
    { id: 2, name: "Sarah Dev", email: "sarah@blockchain.io", provider: "linkedin", savedJobs: 5 },
    { id: 3, name: "Jordan Smith", email: "jordan@web3.com", provider: "google", savedJobs: 1 },
  ];

  useEffect(() => {
    // Prevent indexing
    const robots = document.createElement('meta');
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    
    document.title = "SuperAdmin Access — Restricted";
    
    return () => {
      document.head.removeChild(robots);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple hardcoded mock credentials for the prototype
    if (email === "admin@jobhaven.com" && password === "admin123") {
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Invalid administrative credentials.");
    }
  };

  const handleSaveAd = () => {
    updateAdConfig(newAdConfig);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <main className="mx-auto max-w-md px-4 py-24">
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
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-12">
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
          <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>
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
                        <TableHead className="text-right">Saved Jobs</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">{c.name}</TableCell>
                          <TableCell>{c.email}</TableCell>
                          <TableCell className="capitalize">{c.provider}</TableCell>
                          <TableCell className="text-right">{c.savedJobs}</TableCell>
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
        </Tabs>
      </main>
    </div>
  );
}
