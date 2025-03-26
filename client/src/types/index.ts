export interface User {
  id: number;
  username: string;
  businessName: string;
  email: string;
  onboardingComplete: boolean;
  metaAdAccountConnected: boolean;
  metaAdAccountId?: string;
}

export interface AdObjective {
  id: number;
  userId: number;
  objective: string;
  description: string;
  targetAudience: string;
  budget: string;
  duration: string;
}

export interface AdSuggestion {
  id: number;
  userId: number;
  objectiveId?: number;
  title: string;
  headline: string;
  primaryText: string;
  callToAction: string;
  targetAudience: string; // JSON string of array of { name, description }
  adType: string;
  createdAt: string;
  deployed: boolean;
}

export interface ParsedTargetAudience {
  name: string;
  description: string;
}

export interface AdCampaign {
  id: number;
  userId: number;
  suggestedAdId?: number;
  campaignName: string;
  metaCampaignId?: string;
  status: string;
  budget: string;
  startDate: string;
  endDate?: string;
  objective: string;
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
  conversions?: number;
  costPerConversion?: string;
  roas?: string;
}

export interface OptimizationSuggestion {
  id: number;
  userId: number;
  campaignId?: number;
  title: string;
  description: string;
  type: "warning" | "success" | "error";
  status: "pending" | "applied" | "dismissed";
  createdAt: string;
}

export type OnboardingStep = "connect" | "objectives" | "setup";

export interface AuthFormData {
  username: string;
  password: string;
  businessName?: string;
  email?: string;
}

export interface MetaAccountFormData {
  accountId?: string;
  businessName?: string;
  email?: string;
  country?: string;
  currency?: string;
  timezone?: string;
}

export interface AdObjectiveFormData {
  objective: string;
  description: string;
  targetAudience: string;
  budget: string;
  duration: string;
}

export interface AdCampaignFormData {
  suggestedAdId?: number;
  campaignName: string;
  status: string;
  budget: string;
  startDate: string;
  endDate?: string;
  objective: string;
}
