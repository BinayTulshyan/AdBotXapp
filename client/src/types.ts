export interface ParsedTargetAudience {
  name: string;
  value: string;
}

export interface AuthFormData {
  email: string;
  password: string;
}

export interface AdObjective {
  id: number;
  name: string;
  description: string;
}

export interface AdCampaignFormData {
  title: string;
  objectiveId: number;
  budget: string;
  startDate: Date;
  endDate?: Date;
  targetAudience: ParsedTargetAudience[];
}

export interface AdSuggestion {
  id: number;
  title: string;
  targetAudience: ParsedTargetAudience[];
  headline: string;
  primaryText: string;
  callToAction: string;
  adType: string;
  objectiveId?: number;
  deployed: boolean;
  createdAt: Date;
}

export interface AdPerformanceMetric {
  id: number;
  date: Date;
  impressions: number;
  clicks: number;
  ctr: string;
  cpc: string;
  spend: string;
  campaignId?: number;
  conversions?: number;
  costPerConversion?: string;
  roas?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  metaAdAccountConnected: boolean;
  onboardingComplete: boolean;
}

export interface DateRange {
  from: Date;
  to?: Date;
} 