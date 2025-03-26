import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { User, AdSuggestion, OptimizationSuggestion, AdCampaign, AdPerformanceMetric } from "@/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PerformanceCard from "./PerformanceCard";
import PerformanceChart from "./PerformanceChart";
import OptimizationSuggestionComponent from "./OptimizationSuggestion";
import AdSuggestionComponent from "../ads/AdSuggestion";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState("7");

  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery<AdCampaign[]>({
    queryKey: ["/api/campaigns"],
    enabled: !!user,
  });

  const { data: adSuggestions, isLoading: suggestionsLoading } = useQuery<AdSuggestion[]>({
    queryKey: ["/api/suggestions"],
    enabled: !!user,
  });

  const { data: optimizations, isLoading: optimizationsLoading } = useQuery<OptimizationSuggestion[]>({
    queryKey: ["/api/suggestions/optimization"],
    enabled: !!user,
  });

  // Get metrics for active campaigns
  const activeCampaignIds = campaigns?.filter(c => c.status === "ACTIVE").map(c => c.id) || [];
  
  // We'll just fetch metrics for the first active campaign for simplicity
  const firstActiveCampaignId = activeCampaignIds[0];
  
  const { data: performanceMetrics, isLoading: metricsLoading } = useQuery<AdPerformanceMetric[]>({
    queryKey: ["/api/campaigns", firstActiveCampaignId, "performance"],
    enabled: !!firstActiveCampaignId,
  });

  const isLoading = userLoading || campaignsLoading || suggestionsLoading || optimizationsLoading || metricsLoading;

  // Calculate some basic stats for the dashboard
  const totalAdSpend = performanceMetrics?.[0]?.spend || "$0.00";
  const activeCampaignsCount = activeCampaignIds.length;
  const avgRoas = performanceMetrics?.[0]?.roas || "0.0x";

  // Filter to get only pending optimization suggestions
  const pendingOptimizations = optimizations?.filter(o => o.status === "pending") || [];

  // Filter to get non-deployed ad suggestions
  const nonDeployedSuggestions = adSuggestions?.filter(s => !s.deployed) || [];

  return (
    <div>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">Dashboard</h1>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setDateRange("7")}
              className={dateRange === "7" ? "bg-gray-100" : ""}
            >
              <span className="material-icons text-sm mr-1">calendar_today</span>
              Last 7 days
            </Button>
            <Button variant="outline">
              <span className="material-icons text-sm mr-1">refresh</span>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Connected Account Section */}
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center mb-4 sm:mb-0">
              <span className="w-12 h-12 flex items-center justify-center bg-blue-100 text-primary rounded-lg">
                <span className="material-icons">facebook</span>
              </span>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-800">Connected Meta Ad Account</h2>
                <p className="text-sm text-gray-600">
                  {user?.businessName} · 
                  {user?.metaAdAccountId ? ` Account ID: ${user.metaAdAccountId}` : " Not connected"}
                </p>
              </div>
            </div>
            <Button variant="outline">
              <span className="material-icons text-sm mr-1">settings</span>
              Manage Connection
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PerformanceCard 
              title="Total Ad Spend" 
              value={isLoading ? undefined : totalAdSpend}
              change={{ value: "4.5%", type: "increase" }}
            />
            <PerformanceCard 
              title="Active Campaigns" 
              value={isLoading ? undefined : activeCampaignsCount.toString()}
              change={activeCampaignsCount > 0 ? { value: "1", type: "decrease" } : undefined}
            />
            <PerformanceCard 
              title="Avg. ROAS" 
              value={isLoading ? undefined : avgRoas}
              change={{ value: "0.2", type: "increase" }}
            />
          </div>
        </div>
      </div>

      {/* AI Suggestions Section */}
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-10 h-10 flex items-center justify-center bg-purple-100 text-accent rounded-lg">
                <span className="material-icons">auto_awesome</span>
              </span>
              <h2 className="ml-3 text-lg font-semibold text-gray-800">AI-Generated Ad Suggestions</h2>
            </div>
            <Button className="bg-accent hover:bg-purple-600">
              <span className="material-icons text-sm mr-1">auto_awesome</span>
              Generate New
            </Button>
          </div>
        </div>
        
        <div className="p-6">
          {user?.onboardingComplete && (
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Based on your objectives:</span> {suggestionsLoading ? (
                  <Skeleton className="h-4 w-40 inline-block ml-1" />
                ) : "Increase online store traffic and boost sales of summer collection"}
              </p>
            </div>
          )}
          
          {suggestionsLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          ) : nonDeployedSuggestions.length > 0 ? (
            <div className="space-y-6">
              {nonDeployedSuggestions.slice(0, 2).map((suggestion) => (
                <AdSuggestionComponent key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-gray-400">lightbulb</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Ad Suggestions Yet</h3>
              <p className="text-gray-600 mb-4">
                Generate AI-powered ad suggestions based on your business goals
              </p>
              <Button className="bg-accent hover:bg-purple-600">
                <span className="material-icons text-sm mr-1">auto_awesome</span>
                Generate Suggestions
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Performance Analytics Section */}
      <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center">
            <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-primary rounded-lg">
              <span className="material-icons">analytics</span>
            </span>
            <h2 className="ml-3 text-lg font-semibold text-gray-800">Performance Analytics</h2>
          </div>
        </div>
        
        <div className="p-6">
          {metricsLoading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : performanceMetrics && performanceMetrics.length > 0 ? (
            <PerformanceChart />
          ) : (
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <p className="text-gray-500 flex flex-col items-center">
                <span className="material-icons text-4xl mb-2">insert_chart</span>
                <span>No performance data available yet</span>
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <PerformanceCard 
              title="Impressions" 
              value={isLoading ? undefined : performanceMetrics?.[0]?.impressions.toLocaleString() || "0"}
              change={{ value: "12.3%", type: "increase" }}
              size="small"
            />
            <PerformanceCard 
              title="Clicks" 
              value={isLoading ? undefined : performanceMetrics?.[0]?.clicks.toLocaleString() || "0"}
              change={{ value: "5.7%", type: "increase" }}
              size="small"
            />
            <PerformanceCard 
              title="CTR" 
              value={isLoading ? undefined : performanceMetrics?.[0]?.ctr || "0%"}
              change={{ value: "0.3%", type: "decrease" }}
              size="small"
            />
            <PerformanceCard 
              title="Cost per Click" 
              value={isLoading ? undefined : performanceMetrics?.[0]?.cpc || "$0.00"}
              change={{ value: "2.1%", type: "increase" }}
              size="small"
            />
          </div>
        </div>
      </div>

      {/* AI Optimization Suggestions Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center">
            <span className="w-10 h-10 flex items-center justify-center bg-green-100 text-secondary rounded-lg">
              <span className="material-icons">psychology</span>
            </span>
            <h2 className="ml-3 text-lg font-semibold text-gray-800">Optimization Suggestions</h2>
          </div>
        </div>
        
        <div className="p-6">
          {optimizationsLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          ) : pendingOptimizations.length > 0 ? (
            <div className="space-y-4">
              {pendingOptimizations.map((suggestion) => (
                <OptimizationSuggestionComponent 
                  key={suggestion.id}
                  suggestion={suggestion}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-gray-400">psychology</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Optimization Suggestions Yet</h3>
              <p className="text-gray-600 mb-4">
                Run campaigns to get AI-powered optimization suggestions
              </p>
              <Button className="bg-secondary hover:bg-green-700">
                <span className="material-icons text-sm mr-1">campaign</span>
                Create Campaign
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
