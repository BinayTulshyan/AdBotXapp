import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { OnboardingWizard } from "@/components/onboarding";
import { useLocation } from "wouter";

export function OnboardingPage() {
  const [, setLocation] = useLocation();
  
  // Get user data to check if onboarding is complete
  const { data: user, isLoading } = useQuery<any>({
    queryKey: ["/api/auth/me"],
  });
  
  useEffect(() => {
    // If user is already onboarded, redirect to dashboard
    if (user && user.onboardingComplete) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);
  
  // If still loading user data, show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard />
    </div>
  );
}

export default OnboardingPage;