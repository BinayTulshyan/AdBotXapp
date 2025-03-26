import { Skeleton } from "@/components/ui/skeleton";

interface PerformanceCardProps {
  title: string;
  value?: string;
  change?: {
    value: string;
    type: "increase" | "decrease" | "neutral";
  };
  size?: "default" | "small";
}

export default function PerformanceCard({ 
  title, 
  value, 
  change,
  size = "default" 
}: PerformanceCardProps) {
  const getChangeColor = (type: string) => {
    switch (type) {
      case "increase":
        return "text-success";
      case "decrease":
        return "text-error";
      default:
        return "text-gray-500";
    }
  };

  const getChangeIcon = (type: string) => {
    switch (type) {
      case "increase":
        return "arrow_upward";
      case "decrease":
        return "arrow_downward";
      default:
        return "remove";
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <div className="flex items-baseline">
        {value ? (
          <h3 className={size === "small" ? "text-xl font-bold text-gray-800" : "text-2xl font-bold text-gray-800"}>
            {value}
          </h3>
        ) : (
          <Skeleton className={size === "small" ? "h-6 w-16" : "h-8 w-24"} />
        )}
        
        {change && (
          <span className={`ml-2 text-xs ${getChangeColor(change.type)} flex items-center`}>
            <span className="material-icons text-xs">{getChangeIcon(change.type)}</span>
            {change.value}
          </span>
        )}
      </div>
    </div>
  );
}
