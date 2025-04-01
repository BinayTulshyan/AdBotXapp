// Common types to be used across the client

export interface User {
  id: number;
  username: string;
  email: string;
  businessName: string;
  metaAccessToken?: string;
  metaAdAccountId?: string;
  onboardingComplete: boolean;
  createdAt: string;
}

export interface AdPerformanceMetric {
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

export interface TargetAudienceGroup {
  name: string;
  description: string;
}

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

export interface AdCampaign {
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

export interface OptimizationSuggestion {
  id: number;
  userId: number;
  campaignId: number;
  title: string;
  description: string;
  type: "warning" | "success" | "error";
  applied: boolean;
  status?: string;
  createdAt: string;
}
