import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ParsedAdSuggestion, TargetAudienceGroup } from "@/lib/openai";
import { useLocation } from "wouter";
import { CheckCircle, ArrowRight, Users, Target } from "lucide-react";

interface AdSuggestionCardProps {
  suggestion: ParsedAdSuggestion;
  onDeployed: () => void;
}

export function AdSuggestionCard({ suggestion, onDeployed }: AdSuggestionCardProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const handleDeploy = async () => {
    try {
      setIsDeploying(true);
      
      // Create a campaign from this suggestion
      const today = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Default to 1 month duration
      
      await apiRequest("/api/campaigns", {
        method: "POST",
        body: JSON.stringify({
          suggestedAdId: suggestion.id,
          campaignName: suggestion.title,
          objective: suggestion.adType,
          headline: suggestion.headline,
          primaryText: suggestion.primaryText,
          callToAction: suggestion.callToAction,
          status: "ACTIVE",
          startDate: today.toISOString(),
          endDate: endDate.toISOString()
        })
      });
      
      toast({
        title: "Campaign created",
        description: "Your campaign has been deployed and is now active",
      });
      
      onDeployed();
    } catch (error) {
      console.error("Error deploying campaign:", error);
      toast({
        title: "Error",
        description: "Failed to deploy campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{suggestion.title}</CardTitle>
            <CardDescription className="mt-1">{suggestion.adType} Ad</CardDescription>
          </div>
          {suggestion.deployed ? (
            <Badge variant="outline" className="flex items-center gap-1 bg-primary/10">
              <CheckCircle className="h-3 w-3" />
              Deployed
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Headline</h3>
          <p className="font-semibold text-lg">{suggestion.headline}</p>
        </div>
        
        <div>
          <h3 className="font-medium text-sm text-muted-foreground mb-1">Primary Text</h3>
          <p>{suggestion.primaryText}</p>
        </div>
        
        <Separator />
        
        <div>
          <div className="flex items-center gap-1 mb-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium text-sm">Target Audiences</h3>
          </div>
          
          <div className="space-y-3">
            {suggestion.targetAudience.map((audience: TargetAudienceGroup, index: number) => (
              <div key={index} className="bg-muted/50 p-3 rounded-md">
                <h4 className="font-medium text-sm">{audience.name}</h4>
                <p className="text-sm text-muted-foreground">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3 pt-2">
        <Button 
          onClick={handleDeploy} 
          disabled={isDeploying || suggestion.deployed} 
          className="w-full"
        >
          {isDeploying ? "Creating Campaign..." : suggestion.deployed ? "Already Deployed" : "Deploy as Campaign"}
        </Button>
        
        {suggestion.deployed && (
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => setLocation("/campaigns")}
          >
            View Active Campaigns
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}