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
import { queryClient } from "./lib/queryClient";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/job/:id" component={JobDetail} />
      <Route path="/companies" component={Companies} />
      <Route path="/company/:id" component={CompanyDetail} />
      <Route path="/saved" component={SavedJobs} />
      <Route path="/auth" component={Auth} />
      <Route path="/superadminaccess" component={SuperAdmin} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
