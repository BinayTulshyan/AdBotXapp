import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AdPerformanceMetric } from '../../../shared/schema';
import { PerformanceChart } from './PerformanceChart';
import { PerformanceMetricsCard } from './PerformanceMetricsCard';
import { CampaignPerformanceTable } from './CampaignPerformanceTable';

interface AnalyticsResponse {
  campaigns: {
    id: number;
    name: string;
    objective: string;
    startDate: string;
    endDate: string | null;
    status: string;
    metrics: AdPerformanceMetric[];
  }[];
  aggregated: {
    impressions: number;
    clicks: number;
    spend: string;
    conversions: number;
    ctr: string;
    cpc: string;
    conversionRate: string;
    costPerConversion: string;
    roas: string;
  };
}

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<string>('30d');
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const { data, isLoading, error } = useQuery<AnalyticsResponse>({
    queryKey: ['/api/analytics', period],
    queryFn: async () => {
      const response = await fetch(`/api/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return response.json();
    }
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-[180px] w-full" />
          ))}
        </div>
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              An error occurred while loading analytics data. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { aggregated, campaigns } = data;
  
  // Prepare data for charts
  const hasData = campaigns.some(campaign => campaign.metrics.length > 0);
  
  const allDates = new Set<string>();
  const campaignData: Record<string, Record<string, number>> = {};
  
  // Extract all unique dates and organize metrics by campaign
  campaigns.forEach(campaign => {
    if (campaign.metrics.length > 0) {
      campaignData[campaign.name] = {};
      campaign.metrics.forEach(metric => {
        const dateStr = new Date(metric.date).toLocaleDateString();
        allDates.add(dateStr);
        campaignData[campaign.name][dateStr] = metric.impressions;
      });
    }
  });
  
  // Prepare chart data
  const sortedDates = Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  
  const chartData = sortedDates.map(date => {
    const point: Record<string, any> = { date };
    Object.keys(campaignData).forEach(campaign => {
      point[campaign] = campaignData[campaign][date] || 0;
    });
    return point;
  });
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Analytics Dashboard</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="trends">Performance Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <PerformanceMetricsCard 
              title="Impressions" 
              value={aggregated.impressions.toLocaleString()} 
              description="Total ad views"
              trend={"+12.3%"}
              trendUp={true}
            />
            <PerformanceMetricsCard 
              title="Clicks" 
              value={aggregated.clicks.toLocaleString()} 
              description="Total interactions"
              trend={"+8.7%"}
              trendUp={true}
            />
            <PerformanceMetricsCard 
              title="Click-Through Rate" 
              value={aggregated.ctr} 
              description="Engagement rate"
              trend={"-2.1%"}
              trendUp={false}
            />
            <PerformanceMetricsCard 
              title="Cost per Click" 
              value={aggregated.cpc} 
              description="Avg. cost per click"
              trend={"-5.4%"}
              trendUp={true}
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Impressions Overview</CardTitle>
                <CardDescription>Daily impressions across all campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <div className="h-[350px]">
                    <PerformanceChart 
                      data={chartData} 
                      dataKeys={Object.keys(campaignData)}
                      xAxisKey="date"
                    />
                  </div>
                ) : (
                  <div className="flex h-[350px] items-center justify-center">
                    <p className="text-center text-muted-foreground">
                      No performance data available yet. Data will appear here once your campaigns start running.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Key Metrics</CardTitle>
                <CardDescription>Overall campaign performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Spend</span>
                    <span className="font-medium">{aggregated.spend}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversions</span>
                    <span className="font-medium">{aggregated.conversions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Conversion Rate</span>
                    <span className="font-medium">{aggregated.conversionRate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cost per Conversion</span>
                    <span className="font-medium">{aggregated.costPerConversion}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">ROAS</span>
                    <span className="font-medium">{aggregated.roas}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
              <CardDescription>Compare metrics across all active campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length > 0 ? (
                <CampaignPerformanceTable campaigns={campaigns} />
              ) : (
                <div className="flex h-[200px] items-center justify-center">
                  <p className="text-center text-muted-foreground">
                    No campaigns available. Create a campaign to see performance metrics.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Click-Through Rate Trend</CardTitle>
                <CardDescription>CTR over time</CardDescription>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <div className="h-[300px]">
                    <PerformanceChart 
                      data={campaigns.flatMap(campaign => 
                        campaign.metrics.map(metric => ({
                          date: new Date(metric.date).toLocaleDateString(),
                          [campaign.name]: parseFloat(metric.ctr.replace('%', ''))
                        }))
                      )} 
                      dataKeys={campaigns.map(c => c.name)}
                      xAxisKey="date"
                    />
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-center text-muted-foreground">
                      No trend data available yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cost per Click Trend</CardTitle>
                <CardDescription>CPC over time</CardDescription>
              </CardHeader>
              <CardContent>
                {hasData ? (
                  <div className="h-[300px]">
                    <PerformanceChart 
                      data={campaigns.flatMap(campaign => 
                        campaign.metrics.map(metric => ({
                          date: new Date(metric.date).toLocaleDateString(),
                          [campaign.name]: parseFloat(metric.cpc.replace('$', ''))
                        }))
                      )} 
                      dataKeys={campaigns.map(c => c.name)}
                      xAxisKey="date"
                    />
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-center text-muted-foreground">
                      No trend data available yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}