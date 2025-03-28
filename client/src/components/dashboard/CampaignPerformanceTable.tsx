import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdPerformanceMetric } from "../../../shared/schema";

interface CampaignPerformanceTableProps {
  campaigns: {
    id: number;
    name: string;
    objective: string;
    startDate: string;
    endDate: string | null;
    status: string;
    metrics: AdPerformanceMetric[];
  }[];
}

export function CampaignPerformanceTable({ campaigns }: CampaignPerformanceTableProps) {
  // Helper function to get aggregate metrics for a campaign
  const getAggregateMetrics = (metrics: AdPerformanceMetric[]) => {
    if (metrics.length === 0) {
      return {
        impressions: 0,
        clicks: 0,
        ctr: "0%",
        cpc: "$0",
        spend: "$0",
        conversions: 0,
        costPerConversion: "$0",
        roas: "0x"
      };
    }
    
    // Calculate totals
    const totalImpressions = metrics.reduce((sum, metric) => sum + metric.impressions, 0);
    const totalClicks = metrics.reduce((sum, metric) => sum + metric.clicks, 0);
    const totalSpend = metrics.reduce((sum, metric) => sum + parseFloat(metric.spend.replace(/[^\d.-]/g, '') || '0'), 0);
    const totalConversions = metrics.reduce((sum, metric) => sum + (metric.conversions || 0), 0);
    
    // Calculate averages for rates
    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%" : "0%";
    const cpc = totalClicks > 0 ? "$" + (totalSpend / totalClicks).toFixed(2) : "$0";
    const costPerConversion = totalConversions > 0 ? "$" + (totalSpend / totalConversions).toFixed(2) : "$0";
    
    // ROAS calculation (simplified)
    const conversionValue = totalConversions * 50; // Assuming $50 average value per conversion
    const roas = totalSpend > 0 ? (conversionValue / totalSpend).toFixed(1) + "x" : "0x";
    
    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr,
      cpc,
      spend: "$" + totalSpend.toFixed(2),
      conversions: totalConversions,
      costPerConversion,
      roas
    };
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Impressions</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>CTR</TableHead>
            <TableHead>CPC</TableHead>
            <TableHead>Spend</TableHead>
            <TableHead>Conversions</TableHead>
            <TableHead>Cost/Conv.</TableHead>
            <TableHead>ROAS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.length > 0 ? (
            campaigns.map((campaign) => {
              const metrics = getAggregateMetrics(campaign.metrics);
              return (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{campaign.name}</div>
                      <div className="text-xs text-muted-foreground">{campaign.objective}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={campaign.status} />
                  </TableCell>
                  <TableCell>{metrics.impressions.toLocaleString()}</TableCell>
                  <TableCell>{metrics.clicks.toLocaleString()}</TableCell>
                  <TableCell>{metrics.ctr}</TableCell>
                  <TableCell>{metrics.cpc}</TableCell>
                  <TableCell>{metrics.spend}</TableCell>
                  <TableCell>{metrics.conversions.toLocaleString()}</TableCell>
                  <TableCell>{metrics.costPerConversion}</TableCell>
                  <TableCell>{metrics.roas}</TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center">
                No campaigns available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  let variant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline" = "secondary";
  
  switch (status.toLowerCase()) {
    case "active":
      variant = "default";
      break;
    case "paused":
      variant = "secondary";
      break;
    case "ended":
    case "rejected":
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }
  
  return (
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
  );
}