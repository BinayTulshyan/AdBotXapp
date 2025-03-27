import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdSuggestionCard } from "./AdSuggestionCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { parseTargetAudience } from "@/lib/openai";
import { generateAdSuggestions } from "@/lib/openai";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdSuggestionsListProps {
  objectives: any[];
}

export function AdSuggestionsList({ objectives }: AdSuggestionsListProps) {
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get ad suggestions
  const { 
    data: suggestions = [], 
    isLoading, 
    isError 
  } = useQuery<any[]>({
    queryKey: ["/api/suggestions"],
    enabled: true
  });

  // Generate new suggestions mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedObjectiveId) {
        toast({
          title: "Select an objective",
          description: "Please select a business objective to generate suggestions",
          variant: "destructive"
        });
        throw new Error("No objective selected");
      }
      return generateAdSuggestions(parseInt(selectedObjectiveId), 3);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      toast({
        title: "Suggestions generated",
        description: "New ad suggestions have been created based on your objective"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate suggestions. Please try again.",
        variant: "destructive"
      });
    }
  });

  const filteredSuggestions = selectedObjectiveId
    ? suggestions.filter((s: any) => s.objectiveId === parseInt(selectedObjectiveId))
    : suggestions;

  // Parse the target audience JSON string in each suggestion
  const parsedSuggestions = filteredSuggestions.map((suggestion: any) => ({
    ...suggestion,
    targetAudience: parseTargetAudience(suggestion.targetAudience)
  }));

  const handleSuggestionDeployed = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
    queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="w-full md:w-1/3">
          <Select 
            value={selectedObjectiveId} 
            onValueChange={setSelectedObjectiveId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by objective" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Suggestions</SelectItem>
              {objectives.map((objective) => (
                <SelectItem key={objective.id} value={objective.id.toString()}>
                  {objective.objective}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending || !selectedObjectiveId}
          className="w-full md:w-auto"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate New Suggestions
            </>
          )}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive">
          Failed to load suggestions. Please try again later.
        </div>
      ) : parsedSuggestions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {selectedObjectiveId ? 
            "No suggestions found for this objective. Generate new ones!" : 
            "No suggestions found. Select an objective and generate some!"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parsedSuggestions.map((suggestion: any) => (
            <AdSuggestionCard 
              key={suggestion.id} 
              suggestion={suggestion} 
              onDeployed={handleSuggestionDeployed}
            />
          ))}
        </div>
      )}
    </div>
  );
}