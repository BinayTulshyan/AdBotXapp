import { apiRequest } from "./queryClient";

export interface AdSuggestion {
  id: number;
  userId: number;
  objectiveId: number;
  title: string;
  headline: string;
  primaryText: string;
  callToAction: string;
  targetAudience: string;
  adType: string;
  deployed: boolean;
  createdAt: string;
}

export interface TargetAudienceGroup {
  name: string;
  description: string;
}

export interface ParsedAdSuggestion extends Omit<AdSuggestion, 'targetAudience'> {
  targetAudience: TargetAudienceGroup[];
}

export interface OptimizationSuggestion {
  id: number;
  userId: number;
  campaignId: number;
  title: string;
  description: string;
  type: "warning" | "success" | "error";
  applied: boolean;
  createdAt: string;
}

// Helper function to parse target audience string into array of objects
export function parseTargetAudience(targetAudienceStr: string): TargetAudienceGroup[] {
  try {
    if (!targetAudienceStr) return [];
    
    // If already an array, assume it's already parsed
    if (Array.isArray(targetAudienceStr)) {
      return targetAudienceStr as TargetAudienceGroup[];
    }
    
    // Otherwise parse the JSON string
    return JSON.parse(targetAudienceStr);
  } catch (error) {
    console.error("Error parsing target audience:", error);
    // Return as a single target audience item if parsing fails
    return [{
      name: "General Audience",
      description: targetAudienceStr || "No specific targeting defined"
    }];
  }
}

// Generate ad suggestions for a specific objective
export async function generateAdSuggestions(objectiveId: number, count: number = 2) {
  const { data } = await apiRequest("/api/suggestions/generate", {
    method: "POST",
    body: JSON.stringify({
      objectiveId,
      count
    })
  });
  
  return data;
}

// Generate optimization suggestions for a campaign
export async function generateOptimizationSuggestions(campaignId: number, count: number = 3) {
  const { data } = await apiRequest(`/api/campaigns/${campaignId}/optimize`, {
    method: "POST",
    body: JSON.stringify({ count })
  });
  
  return data;
}