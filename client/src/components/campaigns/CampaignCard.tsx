import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AdCampaign, AdPerformanceMetric, AdSuggestion } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CampaignCardProps {
  campaign: AdCampaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const { data: metrics, isLoading: metricsLoading } = useQuery<AdPerformanceMetric[]>({
    queryKey: ["/api/campaigns", campaign.id, "performance"],
    enabled: isExpanded,
  });

  const { data: suggestion, isLoading: suggestionLoading } = useQuery<AdSuggestion>({
    queryKey: ["/api/suggestions", campaign.suggestedAdId],
    enabled: !!campaign.suggestedAdId && isExpanded,
  });

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: async (status: string) => {
      return apiRequest("PATCH", `/api/campaigns/${campaign.id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign updated",
        description: "Campaign status has been updated successfully.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update campaign status. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const { mutate: generateOptimizations, isPending: isGeneratingOptimizations } = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/campaigns/${campaign.id}/optimize`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions/optimization"] });
      toast({
        title: "Optimization suggestions generated",
        description: "New optimization suggestions have been generated for this campaign.",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Generation failed",
        description: "Failed to generate optimization suggestions. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "PAUSED":
        return "bg-yellow-100 text-yellow-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleStatus = () => {
    const newStatus = campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    updateStatus(newStatus);
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-medium text-gray-800">{campaign.campaignName}</h3>
          <Badge className={`ml-2 ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </Badge>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleStatus}
            disabled={isUpdating}
          >
            {campaign.status === "ACTIVE" ? "Pause" : "Activate"}
          </Button>
          <button
            className="text-gray-500 hover:text-primary"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            <span className="material-icons">
              {isExpanded ? "expand_less" : "expand_more"}
            </span>
          </button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Objective</p>
            <p className="text-gray-800">{campaign.objective}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Budget</p>
            <p className="text-gray-800">{campaign.budget}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Duration</p>
            <p className="text-gray-800">
              {new Date(campaign.startDate).toLocaleDateString()} 
              {campaign.endDate ? ` to ${new Date(campaign.endDate).toLocaleDateString()}` : " (Ongoing)"}
            </p>
          </div>
        </div>
        
        {isExpanded && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="mb-4">
              <h4 className="text-lg font-medium text-gray-800 mb-2">Performance Metrics</h4>
              
              {metricsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              ) : metrics && metrics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Impressions</p>
                    <p className="text-lg font-semibold text-gray-800">{metrics[0].impressions.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Clicks</p>
                    <p className="text-lg font-semibold text-gray-800">{metrics[0].clicks.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">CTR</p>
                    <p className="text-lg font-semibold text-gray-800">{metrics[0].ctr}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Spend</p>
                    <p className="text-lg font-semibold text-gray-800">{metrics[0].spend}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No performance data available yet.</p>
              )}
            </div>
            
            {campaign.suggestedAdId && (
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">Ad Details</h4>
                
                {suggestionLoading ? (
                  <Skeleton className="h-24 w-full rounded-lg" />
                ) : suggestion ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">{suggestion.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.headline}</p>
                    <p className="text-sm text-gray-600 mt-1">{suggestion.primaryText}</p>
                    <p className="text-sm text-gray-600 mt-1">CTA: {suggestion.callToAction}</p>
                  </div>
                ) : (
                  <p className="text-gray-600">Ad details not available.</p>
                )}
              </div>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsExpanded(false)}
              >
                Collapse
              </Button>
              <Button
                onClick={() => generateOptimizations()}
                disabled={isGeneratingOptimizations}
              >
                <span className="material-icons text-sm mr-1">psychology</span>
                {isGeneratingOptimizations ? "Generating..." : "Generate Optimizations"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
