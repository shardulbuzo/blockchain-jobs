import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, LogIn, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header, SEOHead } from "./home";

export default function AdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
      navigate("/superadmin007");
    } catch {
      setError("Unable to reach admin auth service.");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <SEOHead title="Admin Login — Crypto Jobs" canonicalPath="/admin-login" noIndex />
      <Header />
      <main id="main-content" className="mx-auto max-w-md px-4 py-24">
        <Card className="rounded-3xl border shadow-xl overflow-hidden">
          <div className="h-2 bg-destructive" />
          <CardHeader className="text-center pb-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <CardTitle className="font-serif text-2xl">Admin Login</CardTitle>
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
      </main>
    </div>
  );
}
