// Meta Marketing API Integration
// https://developers.facebook.com/docs/marketing-apis/

import { z } from "zod";
import axios from "axios";

// Base URL for Meta Graph API
const META_API_BASE_URL = "https://graph.facebook.com/v18.0";

export interface MetaAdAccount {
  id: string;
  name: string;
  currency: string;
  timezone_id: number;
  status: string;
}

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  budget: string;
  start_time: string;
  stop_time?: string;
}

export interface MetaAdSet {
  id: string;
  name: string;
  campaign_id: string;
  targeting: {
    age_min: number;
    age_max: number;
    genders: number[];
    interests: string[];
    geo_locations: {
      countries: string[];
    };
  };
  daily_budget: string;
  bid_amount: string;
}

export interface MetaAd {
  id: string;
  name: string;
  adset_id: string;
  creative: {
    id: string;
    title: string;
    body: string;
    image_url?: string;
    video_id?: string;
    call_to_action_type: string;
  };
  status: string;
}

export interface MetaAdInsights {
  impressions: number;
  clicks: number;
  ctr: string;
  cpc: string;
  spend: string;
  conversions?: number;
  cost_per_conversion?: string;
  return_on_ad_spend?: string;
  date_start: string;
  date_stop: string;
}

// OAuth Data returned from Meta
export interface MetaOAuthData {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id?: string;
}

// Schema for creating new Meta Ad accounts
const metaAccountSchema = z.object({
  accountId: z.string().optional(),
  businessName: z.string(),
  email: z.string().email(),
  country: z.string(),
  currency: z.string(),
  timezone: z.string(),
});

export type MetaAccountInput = z.infer<typeof metaAccountSchema>;

export class MetaAdsAPI {
  private isInitialized: boolean = false;
  private accessToken?: string;
  private appId?: string;
  private appSecret?: string;
  private redirectUri: string = "";

  constructor() {
    this.appId = process.env.META_APP_ID;
    this.appSecret = process.env.META_APP_SECRET;
    this.accessToken = process.env.META_ACCESS_TOKEN;
    this.redirectUri = process.env.META_REDIRECT_URI || "http://localhost:5000/api/meta/oauth-callback";
    
    // Check if we have the minimum required credentials
    this.isInitialized = !!(this.appId && this.appSecret);
    
    // For development, we'll still support simulated data if not initialized
    if (!this.isInitialized) {
      console.warn("Meta Ads API not fully initialized. Running in simulation mode.");
    }
  }

  public isConnected(): boolean {
    return this.isInitialized;
  }

  // Generate Meta login URL for OAuth
  public getAuthUrl(): string {
    if (!this.appId) {
      throw new Error("Meta APP ID not configured");
    }
    
    const scopes = [
      'ads_management',
      'ads_read',
      'business_management',
      'email',
      'pages_show_list',
      'public_profile'
    ];
    
    return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${this.appId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(scopes.join(','))}&response_type=code`;
  }
  
  // Handle OAuth callback and exchange code for token
  public async handleOAuthCallback(code: string): Promise<MetaOAuthData | null> {
    if (!this.appId || !this.appSecret) {
      throw new Error("Meta APP credentials not configured");
    }
    
    try {
      const tokenUrl = `${META_API_BASE_URL}/oauth/access_token`;
      const response = await axios.get(tokenUrl, {
        params: {
          client_id: this.appId,
          client_secret: this.appSecret,
          redirect_uri: this.redirectUri,
          code: code
        }
      });
      
      if (response.data && response.data.access_token) {
        // Store the token for future API calls
        this.accessToken = response.data.access_token;
        return response.data;
      }
      
      throw new Error("Invalid response from Meta OAuth endpoint");
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      
      // For development, return simulated data
      if (!this.isInitialized) {
        return {
          access_token: "simulated_access_token",
          token_type: "bearer",
          expires_in: 5184000, // 60 days in seconds
        };
      }
      
      return null;
    }
  }

  // Connect to existing Meta Ad account
  public async connectToAdAccount(accountId: string): Promise<MetaAdAccount | null> {
    try {
      if (this.isInitialized && this.accessToken) {
        // Make real API call if we have proper credentials
        const url = `${META_API_BASE_URL}/${accountId}`;
        const response = await axios.get(url, {
          params: {
            access_token: this.accessToken,
            fields: 'id,name,currency,timezone_id,account_status'
          }
        });
        
        if (response.data) {
          return {
            id: response.data.id,
            name: response.data.name,
            currency: response.data.currency,
            timezone_id: response.data.timezone_id,
            status: this.mapAccountStatus(response.data.account_status)
          };
        }
        return null;
      } else {
        // Simulation mode
        console.log("Using simulation mode for connectToAdAccount");
        return {
          id: accountId,
          name: "Sample Business",
          currency: "USD",
          timezone_id: 1,
          status: "ACTIVE"
        };
      }
    } catch (error) {
      console.error("Error connecting to Meta Ad account:", error);
      
      // If in development mode, still return sample data
      if (!this.isInitialized) {
        return {
          id: accountId,
          name: "Sample Business",
          currency: "USD",
          timezone_id: 1,
          status: "ACTIVE"
        };
      }
      
      return null;
    }
  }

  // Create a new Meta Ad account
  public async createAdAccount(input: MetaAccountInput): Promise<MetaAdAccount | null> {
    try {
      if (this.isInitialized && this.accessToken) {
        // Make real API call if we have proper credentials
        const url = `${META_API_BASE_URL}/act_${input.accountId || 'me'}/adaccounts`;
        const response = await axios.post(url, {
          name: input.businessName,
          currency: input.currency,
          timezone_id: this.getTimezoneId(input.timezone),
          end_advertiser: input.businessName,
          media_agency: "NONE",
          partner: "NONE",
          access_token: this.accessToken
        });
        
        if (response.data && response.data.id) {
          return {
            id: response.data.id,
            name: input.businessName,
            currency: input.currency,
            timezone_id: this.getTimezoneId(input.timezone),
            status: "ACTIVE"
          };
        }
        return null;
      } else {
        // Simulation mode
        console.log("Using simulation mode for createAdAccount");
        return {
          id: `act_${Math.floor(Math.random() * 1000000000)}`,
          name: input.businessName,
          currency: input.currency || "USD",
          timezone_id: 1,
          status: "ACTIVE"
        };
      }
    } catch (error) {
      console.error("Error creating Meta Ad account:", error);
      
      // If in development mode, still return sample data
      if (!this.isInitialized) {
        return {
          id: `act_${Math.floor(Math.random() * 1000000000)}`,
          name: input.businessName,
          currency: input.currency || "USD",
          timezone_id: 1,
          status: "ACTIVE"
        };
      }
      
      return null;
    }
  }

  // Create a new Meta Ad campaign
  public async createCampaign(
    adAccountId: string,
    campaignName: string,
    objective: string,
    budget: string,
    startTime: Date,
    endTime?: Date
  ): Promise<MetaCampaign | null> {
    try {
      if (this.isInitialized && this.accessToken) {
        // Make real API call if we have proper credentials
        const url = `${META_API_BASE_URL}/${adAccountId}/campaigns`;
        const budgetAmount = parseFloat(budget.replace(/[^0-9.]/g, '')) * 100; // Convert to cents
        
        const response = await axios.post(url, {
          name: campaignName,
          objective: this.mapObjective(objective),
          status: 'ACTIVE',
          special_ad_categories: [],
          daily_budget: budgetAmount,
          start_time: startTime.toISOString(),
          end_time: endTime?.toISOString(),
          access_token: this.accessToken
        });
        
        if (response.data && response.data.id) {
          return {
            id: response.data.id,
            name: campaignName,
            status: "ACTIVE",
            objective,
            budget,
            start_time: startTime.toISOString(),
            stop_time: endTime?.toISOString()
          };
        }
        return null;
      } else {
        // Simulation mode
        console.log("Using simulation mode for createCampaign");
        return {
          id: `23${Math.floor(Math.random() * 10000000000)}`,
          name: campaignName,
          status: "ACTIVE",
          objective,
          budget,
          start_time: startTime.toISOString(),
          stop_time: endTime?.toISOString()
        };
      }
    } catch (error) {
      console.error("Error creating Meta Ad campaign:", error);
      
      // If in development mode, still return sample data
      if (!this.isInitialized) {
        return {
          id: `23${Math.floor(Math.random() * 10000000000)}`,
          name: campaignName,
          status: "ACTIVE",
          objective,
          budget,
          start_time: startTime.toISOString(),
          stop_time: endTime?.toISOString()
        };
      }
      
      return null;
    }
  }

  // Get campaign insights
  public async getCampaignInsights(
    campaignId: string,
    startDate: Date,
    endDate: Date
  ): Promise<MetaAdInsights | null> {
    try {
      if (this.isInitialized && this.accessToken) {
        // Make real API call if we have proper credentials
        const url = `${META_API_BASE_URL}/${campaignId}/insights`;
        const response = await axios.get(url, {
          params: {
            time_range: JSON.stringify({
              since: startDate.toISOString().split('T')[0],
              until: endDate.toISOString().split('T')[0]
            }),
            fields: 'impressions,clicks,ctr,cpc,spend,actions',
            access_token: this.accessToken
          }
        });
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          const insights = response.data.data[0];
          const conversions = this.extractConversions(insights.actions);
          
          return {
            impressions: parseInt(insights.impressions) || 0,
            clicks: parseInt(insights.clicks) || 0,
            ctr: `${insights.ctr || 0}%`,
            cpc: `$${insights.cpc || 0}`,
            spend: `$${insights.spend || 0}`,
            conversions: conversions.count,
            cost_per_conversion: conversions.count ? `$${(parseFloat(insights.spend) / conversions.count).toFixed(2)}` : undefined,
            return_on_ad_spend: conversions.value ? `${(conversions.value / parseFloat(insights.spend)).toFixed(1)}x` : undefined,
            date_start: startDate.toISOString(),
            date_stop: endDate.toISOString()
          };
        }
        return null;
      } else {
        // Simulation mode
        console.log("Using simulation mode for getCampaignInsights");
        const randomCTR = (Math.random() * 5).toFixed(2);
        const randomClicks = Math.floor(Math.random() * 2000) + 100;
        const randomImpressions = randomClicks * (100 / parseInt(randomCTR));
        const randomCPC = ((Math.random() * 1.5) + 0.25).toFixed(2);
        const randomSpend = (randomClicks * parseFloat(randomCPC)).toFixed(2);
        
        return {
          impressions: Math.floor(randomImpressions),
          clicks: randomClicks,
          ctr: `${randomCTR}%`,
          cpc: `$${randomCPC}`,
          spend: `$${randomSpend}`,
          conversions: Math.floor(randomClicks * 0.1),
          cost_per_conversion: `$${(parseFloat(randomSpend) / (randomClicks * 0.1)).toFixed(2)}`,
          return_on_ad_spend: `${(Math.random() * 5 + 1).toFixed(1)}x`,
          date_start: startDate.toISOString(),
          date_stop: endDate.toISOString()
        };
      }
    } catch (error) {
      console.error("Error getting Meta Ad campaign insights:", error);
      
      // If in development mode, still return sample data
      if (!this.isInitialized) {
        const randomCTR = (Math.random() * 5).toFixed(2);
        const randomClicks = Math.floor(Math.random() * 2000) + 100;
        const randomImpressions = randomClicks * (100 / parseInt(randomCTR));
        const randomCPC = ((Math.random() * 1.5) + 0.25).toFixed(2);
        const randomSpend = (randomClicks * parseFloat(randomCPC)).toFixed(2);
        
        return {
          impressions: Math.floor(randomImpressions),
          clicks: randomClicks,
          ctr: `${randomCTR}%`,
          cpc: `$${randomCPC}`,
          spend: `$${randomSpend}`,
          conversions: Math.floor(randomClicks * 0.1),
          cost_per_conversion: `$${(parseFloat(randomSpend) / (randomClicks * 0.1)).toFixed(2)}`,
          return_on_ad_spend: `${(Math.random() * 5 + 1).toFixed(1)}x`,
          date_start: startDate.toISOString(),
          date_stop: endDate.toISOString()
        };
      }
      
      return null;
    }
  }

  // List all campaigns for an account
  public async listCampaigns(adAccountId: string): Promise<MetaCampaign[]> {
    try {
      if (this.isInitialized && this.accessToken) {
        // Make real API call if we have proper credentials
        const url = `${META_API_BASE_URL}/${adAccountId}/campaigns`;
        const response = await axios.get(url, {
          params: {
            fields: 'id,name,status,objective,daily_budget,start_time,stop_time',
            access_token: this.accessToken
          }
        });
        
        if (response.data && response.data.data) {
          return response.data.data.map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            status: this.mapCampaignStatus(campaign.status),
            objective: this.reverseMapObjective(campaign.objective),
            budget: `$${(campaign.daily_budget / 100).toFixed(2)}`,
            start_time: campaign.start_time,
            stop_time: campaign.stop_time
          }));
        }
        return [];
      } else {
        // Simulation mode
        console.log("Using simulation mode for listCampaigns");
        return [
          {
            id: "23848458394859",
            name: "Summer Collection Promotion",
            status: "ACTIVE",
            objective: "CONVERSIONS",
            budget: "$50.00",
            start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "23848458394860",
            name: "Brand Awareness Campaign",
            status: "ACTIVE",
            objective: "BRAND_AWARENESS",
            budget: "$30.00",
            start_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "23848458394861",
            name: "Website Traffic Boost",
            status: "PAUSED",
            objective: "TRAFFIC",
            budget: "$25.00",
            start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            stop_time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
      }
    } catch (error) {
      console.error("Error listing Meta Ad campaigns:", error);
      
      // If in development mode, still return sample data
      if (!this.isInitialized) {
        return [
          {
            id: "23848458394859",
            name: "Summer Collection Promotion",
            status: "ACTIVE",
            objective: "CONVERSIONS",
            budget: "$50.00",
            start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "23848458394860",
            name: "Brand Awareness Campaign",
            status: "ACTIVE",
            objective: "BRAND_AWARENESS",
            budget: "$30.00",
            start_time: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: "23848458394861",
            name: "Website Traffic Boost",
            status: "PAUSED",
            objective: "TRAFFIC",
            budget: "$25.00",
            start_time: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            stop_time: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
      }
      
      return [];
    }
  }

  // Helper methods
  private mapAccountStatus(status: number): string {
    const statusMap: Record<number, string> = {
      1: "ACTIVE",
      2: "DISABLED",
      3: "UNSETTLED",
      7: "PENDING_REVIEW",
      8: "PENDING_CLOSURE",
      9: "CLOSED",
      100: "PENDING_RISK_REVIEW",
      101: "PENDING_SETTLEMENT",
      201: "ANY_ACTIVE",
      202: "ANY_CLOSED"
    };
    return statusMap[status] || "UNKNOWN";
  }

  private mapObjective(objective: string): string {
    const objectiveMap: Record<string, string> = {
      "BRAND_AWARENESS": "BRAND_AWARENESS",
      "CONVERSIONS": "CONVERSIONS",
      "LINK_CLICKS": "LINK_CLICKS",
      "TRAFFIC": "TRAFFIC",
      "REACH": "REACH",
      "APP_INSTALLS": "APP_INSTALLS",
      "VIDEO_VIEWS": "VIDEO_VIEWS",
      "LEAD_GENERATION": "LEAD_GENERATION",
      "MESSAGES": "MESSAGES",
      "ENGAGEMENT": "POST_ENGAGEMENT"
    };
    return objectiveMap[objective] || "CONVERSIONS";
  }

  private reverseMapObjective(objective: string): string {
    const objectiveMap: Record<string, string> = {
      "BRAND_AWARENESS": "BRAND_AWARENESS",
      "CONVERSIONS": "CONVERSIONS",
      "LINK_CLICKS": "LINK_CLICKS",
      "TRAFFIC": "TRAFFIC",
      "REACH": "REACH",
      "APP_INSTALLS": "APP_INSTALLS",
      "VIDEO_VIEWS": "VIDEO_VIEWS",
      "LEAD_GENERATION": "LEAD_GENERATION",
      "MESSAGES": "MESSAGES",
      "POST_ENGAGEMENT": "ENGAGEMENT"
    };
    return objectiveMap[objective] || "CONVERSIONS";
  }

  private mapCampaignStatus(status: string): string {
    const statusMap: Record<string, string> = {
      "ACTIVE": "ACTIVE",
      "PAUSED": "PAUSED",
      "DELETED": "DELETED",
      "ARCHIVED": "ARCHIVED"
    };
    return statusMap[status] || "UNKNOWN";
  }

  private getTimezoneId(timezone: string): number {
    // Simplified mapping for common timezones
    const timezoneMap: Record<string, number> = {
      "America/New_York": 1,
      "America/Chicago": 2,
      "America/Denver": 3,
      "America/Los_Angeles": 4,
      "America/Anchorage": 5,
      "America/Halifax": 6,
      "America/St_Johns": 7,
      "Europe/London": 8,
      "Europe/Paris": 9,
      "Europe/Moscow": 10,
      "Asia/Shanghai": 11,
      "Asia/Tokyo": 12,
      "Australia/Sydney": 13
    };
    return timezoneMap[timezone] || 1; // Default to New York
  }

  private extractConversions(actions: any[] | undefined): { count: number, value: number } {
    if (!actions || !Array.isArray(actions)) return { count: 0, value: 0 };
    
    // Look for purchase and conversion actions
    const conversionActions = actions.filter(action => 
      ['purchase', 'conversion', 'lead', 'complete_registration'].includes(action.action_type?.toLowerCase() || '')
    );
    
    let count = 0;
    let value = 0;
    
    conversionActions.forEach(action => {
      count += parseInt(action.value) || 0;
      // If we have conversion value data
      if (action.action_type === 'purchase' && action.value) {
        value += parseFloat(action.value) || 0;
      }
    });
    
    return { count, value };
  }
}

export const metaAdsAPI = new MetaAdsAPI();
