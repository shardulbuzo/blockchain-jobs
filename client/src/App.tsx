import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "./pages/not-found";
import Home from "./pages/home";
import JobDetail from "./pages/job";
import SavedJobs from "./pages/saved";
import Auth from "./pages/auth";
import Companies from "./pages/companies";
import CompanyDetail from "./pages/company-detail";
import SuperAdmin from "./pages/super-admin";
import AdminLogin from "./pages/admin-login";
import { queryClient } from "./lib/queryClient";
import { useJobsStore } from "@/state/jobs-store";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/job/:id" component={JobDetail} />
      <Route path="/companies" component={Companies} />
      <Route path="/company/:id" component={CompanyDetail} />
      <Route path="/saved" component={SavedJobs} />
      <Route path="/auth" component={Auth} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/superadmin007" component={SuperAdmin} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const { analyticsId } = useJobsStore();

  useEffect(() => {
    if (!analyticsId) return;
    const existing = document.querySelector(`script[data-ga="${analyticsId}"]`);
    if (existing) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    script.setAttribute("data-ga", analyticsId);
    document.head.appendChild(script);

    const inline = document.createElement("script");
    inline.setAttribute("data-ga-inline", analyticsId);
    inline.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${analyticsId}');
    `;
    document.head.appendChild(inline);
  }, [analyticsId]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
