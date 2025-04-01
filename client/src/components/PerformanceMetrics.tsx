import { AdPerformanceMetric } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface PerformanceMetricsProps {
  metrics: AdPerformanceMetric;
}

export default function PerformanceMetrics({ metrics }: PerformanceMetricsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Metrics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Basic Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Impressions</span>
                <span className="font-medium text-gray-800">{metrics.impressions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Clicks</span>
                <span className="font-medium text-gray-800">{metrics.clicks.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CTR (Click-Through Rate)</span>
                <span className="font-medium text-gray-800">{metrics.ctr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">CPC (Cost Per Click)</span>
                <span className="font-medium text-gray-800">{metrics.cpc}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Spend</span>
                <span className="font-medium text-gray-800">{metrics.spend}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Conversion Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Conversions</span>
                <span className="font-medium text-gray-800">{metrics.conversions || "Not tracked"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per Conversion</span>
                <span className="font-medium text-gray-800">{metrics.costPerConversion || "Not tracked"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-medium text-gray-800">
                  {metrics.conversions 
                    ? `${((metrics.conversions / metrics.clicks) * 100).toFixed(2)}%` 
                    : "Not tracked"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">ROAS (Return on Ad Spend)</span>
                <span className="font-medium text-gray-800">{metrics.roas || "Not tracked"}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Benchmarks</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Industry Avg. CTR</span>
                <span className="font-medium text-gray-800">2.0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Industry Avg. CPC</span>
                <span className="font-medium text-gray-800">$0.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Industry Avg. Conversion Rate</span>
                <span className="font-medium text-gray-800">5.0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Performance</span>
                <span className={`font-medium ${
                  parseFloat(metrics.ctr.replace('%', '')) > 2.0 
                    ? "text-success" 
                    : "text-error"
                }`}>
                  {parseFloat(metrics.ctr.replace('%', '')) > 2.0 
                    ? "Above Average" 
                    : "Below Average"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Recommendations</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Optimize your ad creative to improve CTR</li>
            <li>Refine your targeting to reach more relevant audiences</li>
            <li>Consider adjusting your bidding strategy for better cost efficiency</li>
            <li>Test different ad formats to find what works best for your audience</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
