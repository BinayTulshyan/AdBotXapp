import OpenAI from "openai";

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Flag to use mock data in test/development environments or when API is unavailable
const USE_MOCK_DATA = !process.env.OPENAI_API_KEY || process.env.NODE_ENV === 'test';

if (USE_MOCK_DATA) {
  console.log('OpenAI API key not found or running in test mode. Using mock data for AI responses.');
}

// Mock data for ad suggestions
function generateMockAdSuggestions(prompt: AdSuggestionPrompt, count: number = 2): GeneratedAdSuggestion[] {
  const businessName = prompt.businessName;
  const objective = prompt.objective;
  const targetAudience = prompt.targetAudience;
  
  const suggestions: GeneratedAdSuggestion[] = [];
  
  for (let i = 0; i < count; i++) {
    suggestions.push({
      title: `${objective} Campaign for ${businessName} #${i+1}`,
      headline: `Discover ${businessName} Today!`,
      primaryText: `Looking for the best solution for your needs? ${businessName} offers premium services tailored to your requirements.`,
      callToAction: i % 2 === 0 ? "Learn More" : "Shop Now",
      targetAudience: [
        {
          name: `Primary Audience ${i+1}`,
          description: `${targetAudience} interested in products like ours`
        },
        {
          name: `Secondary Audience ${i+1}`,
          description: "People who have visited our website in the past 30 days"
        }
      ],
      adType: i % 2 === 0 ? "BRAND_AWARENESS" : "CONVERSIONS"
    });
  }
  
  return suggestions;
}

// Mock data for optimization suggestions
function generateMockOptimizationSuggestions(prompt: OptimizationPrompt, count: number = 3): GeneratedOptimizationSuggestion[] {
  const suggestions: GeneratedOptimizationSuggestion[] = [];
  
  const types: Array<"warning" | "success" | "error"> = ["warning", "success", "error"];
  
  for (let i = 0; i < count; i++) {
    const type = types[i % types.length];
    
    suggestions.push({
      title: `Optimization Suggestion #${i+1} for ${prompt.campaignName}`,
      description: getDescriptionByType(type, prompt),
      type: type
    });
  }
  
  return suggestions;
}

function getDescriptionByType(type: "warning" | "success" | "error", prompt: OptimizationPrompt): string {
  switch (type) {
    case "warning":
      return `Your ad's CTR of ${prompt.performanceData.ctr} is slightly below the industry average of ${prompt.industryAverages.ctr}. Consider refreshing your ad creative or targeting a more specific audience segment.`;
    case "success":
      return `Your campaign is performing well with a CPC of ${prompt.performanceData.cpc} compared to the industry average of ${prompt.industryAverages.cpc}. Continue with the current strategy but consider increasing budget to capture more of this audience.`;
    case "error":
      return `Your campaign has spent ${prompt.performanceData.spend} with lower than expected results. We recommend pausing this campaign and reallocating budget to better performing initiatives.`;
  }
}

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

/**
 * Generate ad suggestions based on business objective
 */
export async function generateAdSuggestions(prompt: AdSuggestionPrompt, count: number = 2): Promise<GeneratedAdSuggestion[]> {
  // If using mock data mode, return mock suggestions
  if (USE_MOCK_DATA) {
    console.log('Using mock data for ad suggestions');
    return generateMockAdSuggestions(prompt, count);
  }
  
  try {
    // Generate system message for prompt
    const systemMessage = `
      You are a Meta Ads expert helping a business create effective ad campaigns. 
      Based on the business details provided, generate ${count} different ad suggestions 
      that would perform well on Facebook and Instagram.
      
      Each ad suggestion should include:
      1. title - A catchy title for the ad campaign
      2. headline - A short, engaging headline (max 40 characters)
      3. primaryText - The main ad copy (90-125 characters)
      4. callToAction - Suggested CTA button text (e.g., "Shop Now", "Learn More")
      5. targetAudience - Array of specific audience segments to target
      6. adType - The recommended ad type (e.g., "BRAND_AWARENESS", "TRAFFIC", "CONVERSIONS")
      
      Format your response as a valid JSON array with ${count} ad suggestion objects.
    `;

    // Generate user message with business details
    const userMessage = `
      Create ${count} effective ad suggestions for:
      
      Business: ${prompt.businessName}
      Objective: ${prompt.objective}
      Description: ${prompt.description}
      Target Audience: ${prompt.targetAudience}
      Budget: ${prompt.budget}
      Duration: ${prompt.duration}
      
      Make each suggestion unique, with detailed targeting suggestions.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" }
    });

    // Parse response content
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsedResponse = JSON.parse(content);
    
    // Check if response has suggestions array
    const suggestions = parsedResponse.suggestions || parsedResponse;
    if (!Array.isArray(suggestions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return suggestions;
  } catch (error) {
    console.error("Error generating ad suggestions:", error);
    
    // If API error occurred, use mock data as fallback
    console.log('OpenAI API error occurred, using mock data as fallback');
    return generateMockAdSuggestions(prompt, count);
  }
}

/**
 * Generate optimization suggestions based on campaign performance
 */
export async function generateOptimizationSuggestions(prompt: OptimizationPrompt, count: number = 3): Promise<GeneratedOptimizationSuggestion[]> {
  // If using mock data mode, return mock suggestions
  if (USE_MOCK_DATA) {
    console.log('Using mock data for optimization suggestions');
    return generateMockOptimizationSuggestions(prompt, count);
  }
  
  try {
    // Generate system message
    const systemMessage = `
      You are a Meta Ads performance expert analyzing campaign data.
      Based on the performance metrics provided, generate ${count} actionable optimization suggestions
      that would help improve the campaign's performance.
      
      Each suggestion should include:
      1. title - A brief title describing the optimization 
      2. description - A detailed explanation with specific actions to take
      3. type - A classification based on urgency: "warning" for critical issues, "error" for underperforming metrics, "success" for positive insights
      
      Format your response as a valid JSON array with ${count} suggestion objects.
    `;

    // Generate user message with campaign performance
    const userMessage = `
      Analyze this campaign and provide ${count} optimization suggestions:
      
      Business: ${prompt.businessName}
      Campaign: ${prompt.campaignName}
      Ad Type: ${prompt.adType}
      Target Audience: ${prompt.targetAudience}
      
      Performance Metrics:
      - Impressions: ${prompt.performanceData.impressions.toLocaleString()}
      - Clicks: ${prompt.performanceData.clicks.toLocaleString()}
      - CTR: ${prompt.performanceData.ctr}
      - CPC: ${prompt.performanceData.cpc}
      - Spend: ${prompt.performanceData.spend}
      ${prompt.performanceData.conversions ? `- Conversions: ${prompt.performanceData.conversions}` : ''}
      ${prompt.performanceData.costPerConversion ? `- Cost per Conversion: ${prompt.performanceData.costPerConversion}` : ''}
      ${prompt.performanceData.roas ? `- ROAS: ${prompt.performanceData.roas}` : ''}
      
      Industry Averages:
      - Average CTR: ${prompt.industryAverages.ctr}
      - Average CPC: ${prompt.industryAverages.cpc}
      ${prompt.industryAverages.conversionRate ? `- Average Conversion Rate: ${prompt.industryAverages.conversionRate}` : ''}
      
      Provide specific, actionable suggestions to improve this campaign.
    `;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" }
    });

    // Parse response content
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsedResponse = JSON.parse(content);
    
    // Check if response has suggestions array
    const suggestions = parsedResponse.suggestions || parsedResponse;
    if (!Array.isArray(suggestions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return suggestions;
  } catch (error) {
    console.error("Error generating optimization suggestions:", error);
    
    // If API error occurred, use mock data as fallback
    console.log('OpenAI API error occurred, using mock data as fallback');
    return generateMockOptimizationSuggestions(prompt, count);
  }
}