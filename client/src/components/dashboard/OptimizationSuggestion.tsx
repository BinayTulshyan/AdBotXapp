import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OptimizationSuggestion } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OptimizationSuggestionProps {
  suggestion: OptimizationSuggestion;
}

export default function OptimizationSuggestionComponent({ suggestion }: OptimizationSuggestionProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState(suggestion.status);
  
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: async (newStatus: "applied" | "dismissed") => {
      return apiRequest("PATCH", `/api/suggestions/optimization/${suggestion.id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/suggestions/optimization"] });
      toast({
        title: status === "applied" ? "Suggestion applied" : "Suggestion dismissed",
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: "Error updating suggestion",
        description: "An error occurred while updating the suggestion.",
        variant: "destructive",
        duration: 3000,
      });
      setStatus(suggestion.status);
    }
  });

  const handleStatusChange = (newStatus: "applied" | "dismissed") => {
    setStatus(newStatus);
    updateStatus(newStatus);
  };

  if (status !== "pending") {
    return null; // Hide non-pending suggestions
  }

  const getBorderColor = () => {
    switch (suggestion.type) {
      case "warning":
        return "border-warning bg-yellow-50";
      case "success":
        return "border-secondary bg-green-50";
      case "error":
        return "border-error bg-red-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getIcon = () => {
    switch (suggestion.type) {
      case "warning":
        return "lightbulb";
      case "success":
        return "trending_up";
      case "error":
        return "priority_high";
      default:
        return "info";
    }
  };

  const getIconColor = () => {
    switch (suggestion.type) {
      case "warning":
        return "text-warning";
      case "success":
        return "text-secondary";
      case "error":
        return "text-error";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className={`border-l-4 ${getBorderColor()} p-4 rounded-r-lg`}>
      <div className="flex">
        <span className={`material-icons ${getIconColor()} mr-3`}>{getIcon()}</span>
        <div>
          <h3 className="font-medium text-gray-800">{suggestion.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
          <div className="mt-2">
            <Button 
              variant="link" 
              className="text-sm text-primary font-medium hover:text-blue-700 p-0"
              onClick={() => handleStatusChange("applied")}
              disabled={isPending}
            >
              {isPending ? "Applying..." : "Apply Suggestion"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
