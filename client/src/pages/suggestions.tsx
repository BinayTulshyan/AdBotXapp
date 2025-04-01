import { useQuery } from "@tanstack/react-query";
import { AdSuggestionsList } from "@/components/suggestions";
import { Button } from "@/components/ui/button";
import { Plus, Lightbulb } from "lucide-react";
import { useLocation } from "wouter";

export function SuggestionsPage() {
  const [, setLocation] = useLocation();
  
  // Get user's ad objectives
  const { 
    data: objectives = [], 
    isLoading: isLoadingObjectives 
  } = useQuery<any[]>({
    queryKey: ["/api/objectives"],
  });
  
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Ad Suggestions</h1>
          <p className="text-muted-foreground mt-1">
            AI-generated ad ideas based on your business objectives
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setLocation("/campaigns")}
            className="flex items-center gap-2"
          >
            View Active Campaigns
          </Button>
          
          <Button
            onClick={() => setLocation("/onboarding")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Ad Objective
          </Button>
        </div>
      </div>
      
      {objectives.length === 0 && !isLoadingObjectives ? (
        <div className="bg-muted rounded-lg p-8 text-center">
          <div className="bg-primary/10 inline-flex items-center justify-center p-3 rounded-full mb-4">
            <Lightbulb className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No ad objectives found</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            You need to create at least one business objective to generate personalized ad suggestions.
          </p>
          <Button onClick={() => setLocation("/onboarding")}>
            Create Your First Objective
          </Button>
        </div>
      ) : (
        <AdSuggestionsList objectives={objectives} />
      )}
    </div>
  );
}

export default SuggestionsPage;