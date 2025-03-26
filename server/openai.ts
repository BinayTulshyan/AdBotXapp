import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-your-api-key" });

export interface AdSuggestionPrompt {
  businessName: string;
  objective: string;
  description: string;
  targetAudience: string;
  budget: string;
  duration: string;
}

export interface OptimizationPrompt {
  businessName: string;
  campaignName: string;
  adType: string;
  targetAudience: string;
  performanceData: {
    impressions: number;
    clicks: number;
    ctr: string;
    cpc: string;
    spend: string;
    conversions?: number;
    costPerConversion?: string;
    roas?: string;
  };
  industryAverages: {
    ctr: string;
    cpc: string;
    conversionRate?: string;
  };
}

export interface GeneratedAdSuggestion {
  title: string;
  headline: string;
  primaryText: string;
  callToAction: string;
  targetAudience: { name: string; description: string }[];
  adType: string;
}

export interface GeneratedOptimizationSuggestion {
  title: string;
  description: string;
  type: "warning" | "success" | "error";
}

export async function generateAdSuggestions(prompt: AdSuggestionPrompt, count: number = 2): Promise<GeneratedAdSuggestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert Meta advertising strategist. Generate ${count} creative and effective ad suggestions for a business based on their objectives. 
          Each ad suggestion should include a title, headline, primary text, call to action, target audience segments, and the type of ad (e.g. Single Image, Carousel, Video). 
          Format your response as a JSON array of objects with the following structure:
          [{ 
            "title": "Suggestion name",
            "headline": "Ad headline text (max 40 chars)",
            "primaryText": "Primary ad text (max 125 chars)",
            "callToAction": "One of Meta's standard CTAs like 'Shop Now', 'Learn More', etc.",
            "targetAudience": [{"name": "audience name", "description": "brief description"}],
            "adType": "Single Image, Carousel, or Video"
          }]`
        },
        {
          role: "user",
          content: `Generate ${count} Meta ad suggestions for the following business:
          
          Business Name: ${prompt.businessName}
          Objective: ${prompt.objective}
          Description: ${prompt.description}
          Target Audience: ${prompt.targetAudience}
          Budget: ${prompt.budget}
          Duration: ${prompt.duration}
          
          Be creative and strategic with your suggestions.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const suggestions = JSON.parse(response.choices[0].message.content || "{}");
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error("Error generating ad suggestions:", error);
    return [];
  }
}

export async function generateOptimizationSuggestions(prompt: OptimizationPrompt, count: number = 3): Promise<GeneratedOptimizationSuggestion[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert Meta advertising analyst. Generate ${count} optimization suggestions for a business based on their campaign performance data.
          Each suggestion should include a title, detailed description, and suggestion type (warning, success, error).
          - Use "warning" for areas that need attention but aren't critical
          - Use "success" for opportunities to expand successful strategies
          - Use "error" for critical issues that need immediate attention
          
          Format your response as a JSON array of objects with the following structure:
          [{ 
            "title": "Short actionable title",
            "description": "Detailed explanation with specific recommendations",
            "type": "warning|success|error"
          }]`
        },
        {
          role: "user",
          content: `Generate ${count} optimization suggestions for the following campaign:
          
          Business Name: ${prompt.businessName}
          Campaign Name: ${prompt.campaignName}
          Ad Type: ${prompt.adType}
          Target Audience: ${prompt.targetAudience}
          
          Performance Data:
          - Impressions: ${prompt.performanceData.impressions}
          - Clicks: ${prompt.performanceData.clicks}
          - CTR: ${prompt.performanceData.ctr}
          - CPC: ${prompt.performanceData.cpc}
          - Spend: ${prompt.performanceData.spend}
          ${prompt.performanceData.conversions ? `- Conversions: ${prompt.performanceData.conversions}` : ''}
          ${prompt.performanceData.costPerConversion ? `- Cost per Conversion: ${prompt.performanceData.costPerConversion}` : ''}
          ${prompt.performanceData.roas ? `- ROAS: ${prompt.performanceData.roas}` : ''}
          
          Industry Averages:
          - CTR: ${prompt.industryAverages.ctr}
          - CPC: ${prompt.industryAverages.cpc}
          ${prompt.industryAverages.conversionRate ? `- Conversion Rate: ${prompt.industryAverages.conversionRate}` : ''}
          
          Be specific in your suggestions for what actions should be taken.`
        }
      ],
      response_format: { type: "json_object" }
    });

    const suggestions = JSON.parse(response.choices[0].message.content || "{}");
    return Array.isArray(suggestions) ? suggestions : [];
  } catch (error) {
    console.error("Error generating optimization suggestions:", error);
    return [];
  }
}
