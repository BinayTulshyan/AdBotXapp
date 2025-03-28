import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PerformanceMetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: string;
  trendUp?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export function PerformanceMetricsCard({
  title,
  value,
  description,
  trend,
  trendUp,
  className,
  icon,
}: PerformanceMetricsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              <CardTitle className="text-2xl font-bold">{value}</CardTitle>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center space-x-1 rounded-md px-2 py-1 text-xs font-medium",
                trendUp
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
              )}
            >
              {trendUp ? (
                <ArrowUpIcon className="h-3 w-3" />
              ) : (
                <ArrowDownIcon className="h-3 w-3" />
              )}
              <span>{trend}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}