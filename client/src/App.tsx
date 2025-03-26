import { Switch, Route, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Campaigns from "@/pages/campaigns";
import Suggestions from "@/pages/suggestions";
import Performance from "@/pages/performance";
import Settings from "@/pages/settings";
import AppShell from "@/components/layout/AppShell";
import LoginForm from "@/components/auth/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@/types";

function App() {
  const [location, setLocation] = useLocation();
  
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    // If user exists but hasn't completed onboarding, redirect to onboarding
    if (user && !user.onboardingComplete && location !== "/onboarding") {
      setLocation("/onboarding");
    }
    
    // If user is not logged in (401 error) and not already at login page
    if (error && location !== "/login") {
      setLocation("/login");
    }
    
    // If user is logged in and at login page or root, redirect to dashboard
    if (user && (location === "/login" || location === "/")) {
      setLocation("/dashboard");
    }
  }, [user, error, location, setLocation]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-48 mx-auto" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <LoginForm />
        </div>
      </Route>
      <Route path="/onboarding">
        <Onboarding />
      </Route>
      <Route path="/dashboard">
        <AppShell currentPage="Dashboard">
          <Dashboard />
        </AppShell>
      </Route>
      <Route path="/campaigns">
        <AppShell currentPage="Campaigns">
          <Campaigns />
        </AppShell>
      </Route>
      <Route path="/suggestions">
        <AppShell currentPage="AI Suggestions">
          <Suggestions />
        </AppShell>
      </Route>
      <Route path="/performance">
        <AppShell currentPage="Performance">
          <Performance />
        </AppShell>
      </Route>
      <Route path="/settings">
        <AppShell currentPage="Settings">
          <Settings />
        </AppShell>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default App;
