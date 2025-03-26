import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdCampaign, AdPerformanceMetric } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import PerformanceCard from "@/components/dashboard/PerformanceCard";
import PerformanceMetrics from "@/components/performance/PerformanceMetrics";

export default function Performance() {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [dateRange, setDateRange] = useState("7");

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<AdCampaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery<AdPerformanceMetric[]>({
    queryKey: ["/api/campaigns", parseInt(selectedCampaignId), "performance"],
    enabled: !!selectedCampaignId,
  });

  const handleRefresh = () => {
    if (selectedCampaignId) {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/campaigns", parseInt(selectedCampaignId), "performance"]
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">Performance Analytics</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setDateRange("7")}
            className={dateRange === "7" ? "bg-gray-100" : ""}
          >
            <span className="material-icons text-sm mr-1">calendar_today</span>
            Last 7 days
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setDateRange("30")}
            className={dateRange === "30" ? "bg-gray-100" : ""}
          >
            <span className="material-icons text-sm mr-1">calendar_today</span>
            Last 30 days
          </Button>
          <Button variant="outline" onClick={handleRefresh}>
            <span className="material-icons text-sm mr-1">refresh</span>
            Refresh
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Select 
              value={selectedCampaignId} 
              onValueChange={setSelectedCampaignId}
            >
              <SelectTrigger className="w-full md:w-72">
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {campaignsLoading ? (
                  <SelectItem value="loading" disabled>Loading campaigns...</SelectItem>
                ) : campaigns && campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <SelectItem key={campaign.id} value={campaign.id.toString()}>
                      {campaign.campaignName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No campaigns available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedCampaignId ? (
            <>
              {metricsLoading ? (
                <>
                  <Skeleton className="h-64 w-full rounded-lg mb-6" />
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </div>
                </>
              ) : performanceMetrics && performanceMetrics.length > 0 ? (
                <>
                  <div className="mb-6">
                    <PerformanceChart />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <PerformanceCard 
                      title="Impressions" 
                      value={performanceMetrics[0].impressions.toLocaleString()}
                      change={{ value: "12.3%", type: "increase" }}
                      size="small"
                    />
                    <PerformanceCard 
                      title="Clicks" 
                      value={performanceMetrics[0].clicks.toLocaleString()}
                      change={{ value: "5.7%", type: "increase" }}
                      size="small"
                    />
                    <PerformanceCard 
                      title="CTR" 
                      value={performanceMetrics[0].ctr}
                      change={{ value: "0.3%", type: "decrease" }}
                      size="small"
                    />
                    <PerformanceCard 
                      title="Cost per Click" 
                      value={performanceMetrics[0].cpc}
                      change={{ value: "2.1%", type: "increase" }}
                      size="small"
                    />
                  </div>
                  
                  <div className="mt-6">
                    <PerformanceMetrics metrics={performanceMetrics[0]} />
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-icons text-gray-400">analytics</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No Performance Data Available</h3>
                  <p className="text-gray-600 mb-4">
                    No metrics have been collected for this campaign yet. Data will appear once your campaign starts running.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a Campaign</h3>
              <p className="text-gray-600">
                Choose a campaign from the dropdown above to view its performance metrics
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
