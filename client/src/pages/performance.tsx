import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";

// Import and define AdPerformanceMetric and AdCampaign here for local use
interface AdPerformanceMetric {
  id: number;
  campaignId: number;
  date: string;
  impressions: number;
  clicks: number;
  ctr: string;
  cpc: string;
  spend: string;
  conversions: number | null;
  costPerConversion: string | null;
  roas: string | null;
}

interface AdCampaign {
  id: number;
  userId: number;
  objective: string;
  budget: string;
  suggestedAdId: number | null;
  campaignName: string;
  metaCampaignId: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
}

export default function Performance() {
  const [selectedTab, setSelectedTab] = useState<string>("dashboard");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("7d");

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<AdCampaign[]>({
    queryKey: ["/api/campaigns"],
  });

  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery<AdPerformanceMetric[]>({
    queryKey: ["/api/campaigns", selectedCampaignId ? parseInt(selectedCampaignId) : null, "performance"],
    enabled: !!selectedCampaignId,
  });

  const handleRefresh = () => {
    // Refresh dashboard data
    queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    
    // Refresh campaign-specific data if selected
    if (selectedCampaignId) {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/campaigns", parseInt(selectedCampaignId), "performance"]
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            Refresh Data
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Analytics Dashboard</TabsTrigger>
          <TabsTrigger value="campaign">Campaign Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="campaign">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Details</CardTitle>
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
                metricsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-64 w-full rounded-lg" />
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                      <Skeleton className="h-24 w-full rounded-lg" />
                    </div>
                  </div>
                ) : performanceMetrics && performanceMetrics.length > 0 ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Impressions</div>
                            <div className="text-2xl font-bold">{performanceMetrics[0].impressions.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Clicks</div>
                            <div className="text-2xl font-bold">{performanceMetrics[0].clicks.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">CTR</div>
                            <div className="text-2xl font-bold">{performanceMetrics[0].ctr}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">CPC</div>
                            <div className="text-2xl font-bold">{performanceMetrics[0].cpc}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Advanced Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Total Spend</div>
                            <div className="text-2xl font-bold">{performanceMetrics[0].spend}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Conversions</div>
                            <div className="text-2xl font-bold">{performanceMetrics[0].conversions ?? 0}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Cost per Conversion</div>
                            <div className="text-2xl font-bold">{performanceMetrics[0].costPerConversion ?? 'N/A'}</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">ROAS</div>
                            <div className="text-2xl font-bold">{performanceMetrics[0].roas ?? 'N/A'}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <div className="h-6 w-6 bg-foreground/10 rounded-full"></div>
                    </div>
                    <h3 className="text-lg font-semibold">No Performance Data Available</h3>
                    <p className="text-sm text-muted-foreground max-w-md mt-2">
                      No metrics have been collected for this campaign yet. Data will appear once your campaign starts running.
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <h3 className="text-lg font-semibold">Select a Campaign</h3>
                  <p className="text-sm text-muted-foreground max-w-md mt-2">
                    Choose a campaign from the dropdown above to view its detailed performance metrics
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
