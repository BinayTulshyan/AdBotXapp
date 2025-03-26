import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdObjective, AdSuggestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import AdSuggestionComponent from "@/components/ads/AdSuggestion";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Suggestions() {
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>("");
  const [count, setCount] = useState<number>(2);
  const { toast } = useToast();

  const { data: objectives, isLoading: objectivesLoading } = useQuery<AdObjective[]>({
    queryKey: ["/api/objectives"],
  });

  const { data: suggestions, isLoading: suggestionsLoading } = useQuery<AdSuggestion[]>({
    queryKey: ["/api/suggestions"],
  });

  const { mutate: generateSuggestions, isPending: isGenerating } = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/suggestions/generate", { 
        objectiveId: selectedObjectiveId, 
        count 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions"] });
      toast({
        title: "Suggestions generated",
        description: `${count} ad suggestions have been generated successfully.`,
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Failed to generate suggestions",
        description: "An error occurred while generating ad suggestions. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const handleGenerateSuggestions = () => {
    if (!selectedObjectiveId) {
      toast({
        title: "Please select an objective",
        description: "You need to select an ad objective to generate suggestions.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    generateSuggestions();
  };

  // Group suggestions by objective
  const suggestionsMap = new Map<number | undefined, AdSuggestion[]>();
  
  if (suggestions) {
    suggestions.forEach(suggestion => {
      const key = suggestion.objectiveId;
      if (!suggestionsMap.has(key)) {
        suggestionsMap.set(key, []);
      }
      suggestionsMap.get(key)?.push(suggestion);
    });
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">AI Ad Suggestions</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate New Suggestions</CardTitle>
          <CardDescription>
            Create AI-powered ad suggestions based on your business objectives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="objective">Select Ad Objective</Label>
              {objectivesLoading ? (
                <Skeleton className="h-10 w-full mt-2" />
              ) : (
                <Select 
                  value={selectedObjectiveId} 
                  onValueChange={setSelectedObjectiveId}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select an objective" />
                  </SelectTrigger>
                  <SelectContent>
                    {objectives?.map((objective) => (
                      <SelectItem key={objective.id} value={objective.id.toString()}>
                        {objective.objective}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="count">Number of Suggestions</Label>
              <Select 
                value={count.toString()} 
                onValueChange={(value) => setCount(parseInt(value))}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Number of suggestions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Suggestion</SelectItem>
                  <SelectItem value="2">2 Suggestions</SelectItem>
                  <SelectItem value="3">3 Suggestions</SelectItem>
                  <SelectItem value="4">4 Suggestions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                className="w-full bg-accent hover:bg-purple-600"
                onClick={handleGenerateSuggestions}
                disabled={!selectedObjectiveId || isGenerating}
              >
                <span className="material-icons text-sm mr-1">auto_awesome</span>
                {isGenerating ? "Generating..." : "Generate Suggestions"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {suggestionsLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ) : suggestions && suggestions.length > 0 ? (
        Array.from(suggestionsMap.entries()).map(([objectiveId, objSuggestions]) => {
          const objective = objectives?.find(o => o.id === objectiveId);
          
          return (
            <div key={objectiveId || "undefined"} className="mb-8">
              {objective && (
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Based on objective:</span> {objective.objective}
                  </p>
                </div>
              )}
              
              <div className="space-y-6">
                {objSuggestions.map((suggestion) => (
                  <AdSuggestionComponent key={suggestion.id} suggestion={suggestion} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-icons text-gray-400">lightbulb</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Ad Suggestions Yet</h3>
          <p className="text-gray-600 mb-4">
            Generate AI-powered ad suggestions based on your business goals
          </p>
          <Button 
            className="bg-accent hover:bg-purple-600"
            onClick={handleGenerateSuggestions}
            disabled={!selectedObjectiveId || isGenerating}
          >
            <span className="material-icons text-sm mr-1">auto_awesome</span>
            Generate Suggestions
          </Button>
        </div>
      )}
    </div>
  );
}
