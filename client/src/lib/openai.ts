import { apiRequest } from "./queryClient";

// Ad suggestion interface
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

// Parsed target audience interface
export interface TargetAudienceGroup {
  name: string;
  description: string;
}

export interface ParsedAdSuggestion extends Omit<AdSuggestion, 'targetAudience'> {
  targetAudience: TargetAudienceGroup[];
}

// Optimization suggestion interface
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

// Parse the target audience JSON string
export function parseTargetAudience(targetAudienceStr: string): TargetAudienceGroup[] {
  try {
    return JSON.parse(targetAudienceStr);
  } catch (error) {
    console.error("Error parsing target audience:", error);
    return [];
  }
}

// Generate ad suggestions
export async function generateAdSuggestions(objectiveId: number, count: number = 2) {
  try {
    const { data } = await apiRequest<AdSuggestion[]>('/api/suggestions/generate', {
      method: 'POST',
      body: JSON.stringify({ objectiveId, count })
    });
    
    return data;
  } catch (error) {
    console.error("Error generating ad suggestions:", error);
    throw error;
  }
}

// Generate optimization suggestions
export async function generateOptimizationSuggestions(campaignId: number, count: number = 3) {
  try {
    const { data } = await apiRequest<OptimizationSuggestion[]>(`/api/campaigns/${campaignId}/optimize`, {
      method: 'POST',
      body: JSON.stringify({ count })
    });
    
    return data;
  } catch (error) {
    console.error("Error generating optimization suggestions:", error);
    throw error;
  }
}