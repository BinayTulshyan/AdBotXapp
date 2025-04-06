import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { metaAdsAPI, type MetaAccountInput } from "./metaAdsApi";
import { 
  generateAdSuggestions, 
  generateOptimizationSuggestions, 
  type AdSuggestionPrompt, 
  type OptimizationPrompt 
} from "./openai";
import { z } from "zod";
import { insertUserSchema, insertAdObjectiveSchema, insertAdSuggestionSchema, insertAdCampaignSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
    businessName: string;
    metaAccessToken?: string;
  }
}

interface SessionUser {
  userId: number;
}

function getUserId(req: Request): number {
  const userId = (req.session as any).userId;
  if (!userId) {
    throw new Error('User not authenticated');
  }
  return userId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Log current users in storage at startup
  console.log("Current users in storage at startup:", Array.from((storage as any).users.entries()));
  
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "adsy-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
    })
  );

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.session.userId) {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized. Please login." });
    }
  };

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      console.log("Registration request received:", req.body);
      
      try {
        const userInput = insertUserSchema.parse(req.body);
        console.log("Parsed user input:", userInput);
        
        console.log("Registration attempt with username:", userInput.username);
        
        // Check if user already exists
        const existingUser = await storage.getUserByUsername(userInput.username);
        console.log("Existing user check result:", existingUser);
        
        if (existingUser) {
          console.log("Rejecting registration: Username already exists");
          return res.status(400).json({ message: "Username already exists" });
        }
        
        const existingEmail = await storage.getUserByEmail(userInput.email);
        console.log("Existing email check result:", existingEmail);
        
        if (existingEmail) {
          console.log("Rejecting registration: Email already exists");
          return res.status(400).json({ message: "Email already exists" });
        }
      } catch (parseError) {
        console.error("Error parsing registration data:", parseError);
        return res.status(400).json({ message: "Invalid input data", error: parseError });
      }
      
      // Need to parse userInput again here since it's in a different scope
      const userInput = insertUserSchema.parse(req.body);
      console.log("Creating user with data:", userInput);
      const user = await storage.createUser(userInput);
      
      // Store user data in session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.businessName = user.businessName;
      
      res.status(201).json({
        id: user.id,
        username: user.username,
        businessName: user.businessName,
        email: user.email,
        onboardingComplete: user.onboardingComplete,
        metaAdAccountConnected: user.metaAdAccountConnected
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to register user" });
      }
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Store user data in session
      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.businessName = user.businessName;
      
      res.status(200).json({
        id: user.id,
        username: user.username,
        businessName: user.businessName,
        email: user.email,
        onboardingComplete: user.onboardingComplete,
        metaAdAccountConnected: user.metaAdAccountConnected
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({
        id: user.id,
        username: user.username,
        businessName: user.businessName,
        email: user.email,
        onboardingComplete: user.onboardingComplete,
        metaAdAccountConnected: user.metaAdAccountConnected
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Meta Ad Account routes
  
  // Get Meta login URL for OAuth
  app.get("/api/meta/auth-url", isAuthenticated, (req: Request, res: Response) => {
    try {
      const authUrl = metaAdsAPI.getAuthUrl();
      res.status(200).json({ authUrl });
    } catch (error) {
      console.error("Error generating Meta auth URL:", error);
      res.status(500).json({ message: "Failed to generate Meta auth URL" });
    }
  });

  // OAuth callback handler
  app.get("/api/meta/oauth-callback", async (req: Request, res: Response) => {
    try {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({ message: "Authorization code is required" });
      }
      
      // Exchange code for token
      const oauthData = await metaAdsAPI.handleOAuthCallback(code);
      
      if (!oauthData) {
        return res.status(400).json({ message: "Failed to authenticate with Meta" });
      }
      
      // Store token in session
      if (req.session) {
        req.session.metaAccessToken = oauthData.access_token;
      }
      
      // Redirect to onboarding or dashboard
      if (req.session && req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        const redirectPath = user?.onboardingComplete ? '/dashboard' : '/onboarding';
        
        // Close the OAuth popup and redirect the main window
        res.send(`
          <html>
          <head>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'META_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '${redirectPath}';
              }
            </script>
          </head>
          <body>
            <p>Authentication successful! You can close this window.</p>
          </body>
          </html>
        `);
      } else {
        res.redirect('/login');
      }
    } catch (error) {
      console.error("Error handling Meta OAuth callback:", error);
      res.status(500).send(`
        <html>
        <body>
          <h2>Authentication Error</h2>
          <p>Failed to authenticate with Meta. Please try again.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'META_AUTH_ERROR' }, '*');
              setTimeout(() => window.close(), 3000);
            } else {
              setTimeout(() => window.location.href = '/login', 3000);
            }
          </script>
        </body>
        </html>
      `);
    }
  });
  
  app.post("/api/meta/connect", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { accountId } = req.body;
      if (!accountId) {
        return res.status(400).json({ message: "Account ID is required" });
      }
      
      const metaAccount = await metaAdsAPI.connectToAdAccount(accountId);
      if (!metaAccount) {
        return res.status(400).json({ message: "Failed to connect to Meta Ad Account" });
      }
      
      const updatedUser = await storage.updateUser(userId, {
        metaAdAccountId: metaAccount.id,
        metaAdAccountConnected: true
      });
      
      res.status(200).json({
        metaAccount,
        user: {
          metaAdAccountId: updatedUser?.metaAdAccountId,
          metaAdAccountConnected: updatedUser?.metaAdAccountConnected
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to connect Meta Ad Account" });
    }
  });

  app.post("/api/meta/create-account", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const accountInput: MetaAccountInput = {
        businessName: req.body.businessName || req.session.businessName,
        email: req.body.email,
        country: req.body.country,
        currency: req.body.currency,
        timezone: req.body.timezone
      };
      
      const metaAccount = await metaAdsAPI.createAdAccount(accountInput);
      if (!metaAccount) {
        return res.status(400).json({ message: "Failed to create Meta Ad Account" });
      }
      
      // Update user with Meta Ad Account info
      const updatedUser = await storage.updateUser(req.session.userId, {
        metaAdAccountId: metaAccount.id,
        metaAdAccountConnected: true
      });
      
      res.status(201).json({
        metaAccount,
        user: {
          metaAdAccountId: updatedUser?.metaAdAccountId,
          metaAdAccountConnected: updatedUser?.metaAdAccountConnected
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create Meta Ad Account" });
      }
    }
  });

  // Ad Objective routes
  app.post("/api/objectives", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const objectiveInput = insertAdObjectiveSchema.parse({
        ...req.body,
        userId
      });
      
      const objective = await storage.createAdObjective(objectiveInput);
      
      // If this is the first objective, mark onboarding as complete
      const user = await storage.getUser(userId);
      if (user && !user.onboardingComplete) {
        await storage.updateUser(userId, { onboardingComplete: true });
      }
      
      res.status(201).json(objective);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create ad objective" });
      }
    }
  });

  app.get("/api/objectives", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const objectives = await storage.getAdObjectivesByUserId(userId);
      res.status(200).json(objectives);
    } catch (error) {
      res.status(500).json({ message: "Failed to get ad objectives" });
    }
  });

  // Ad Suggestion routes
  app.post("/api/suggestions/generate", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { objectiveId, count } = req.body;
      if (!objectiveId) {
        return res.status(400).json({ message: "Objective ID is required" });
      }
      
      // Get the objective and user data
      const objective = await storage.getAdObjective(parseInt(objectiveId));
      if (!objective) {
        return res.status(404).json({ message: "Ad objective not found" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Generate ad suggestions using OpenAI
      const prompt: AdSuggestionPrompt = {
        businessName: user.businessName,
        objective: objective.objective,
        description: objective.description,
        targetAudience: objective.targetAudience,
        budget: objective.budget,
        duration: objective.duration
      };
      
      try {
        const suggestions = await generateAdSuggestions(prompt, count || 2);
        
        // Save the generated suggestions to the database
        const savedSuggestions = await Promise.all(
          suggestions.map(suggestion => 
            storage.createAdSuggestion({
              userId,
              objectiveId: objective.id,
              title: suggestion.title,
              headline: suggestion.headline,
              primaryText: suggestion.primaryText,
              callToAction: suggestion.callToAction,
              targetAudience: JSON.stringify(suggestion.targetAudience),
              adType: suggestion.adType
            })
          )
        );
        
        res.status(201).json(savedSuggestions);
      } catch (error) {
        console.error("Error generating ad suggestions:", error);
        res.status(500).json({ message: "Failed to generate ad suggestions" });
      }
    } catch (error) {
      console.error("Error in suggestions/generate endpoint:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.get("/api/suggestions", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const suggestions = await storage.getAdSuggestionsByUserId(userId);
      res.status(200).json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get ad suggestions" });
    }
  });

  // Ad Campaign routes
  app.post("/api/campaigns", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const campaignInput = insertAdCampaignSchema.parse({
        ...req.body,
        userId
      });
      
      // If user has Meta account connected, create the campaign on Meta
      const user = await storage.getUser(userId);
      if (user && user.metaAdAccountConnected && user.metaAdAccountId) {
        const startDate = new Date(campaignInput.startDate);
        const endDate = campaignInput.endDate ? new Date(campaignInput.endDate) : undefined;
        
        // Create the campaign on Meta Ads
        const metaCampaign = await metaAdsAPI.createCampaign(
          user.metaAdAccountId,
          campaignInput.campaignName,
          campaignInput.objective,
          campaignInput.budget,
          startDate,
          endDate
        );
        
        if (metaCampaign) {
          campaignInput.metaCampaignId = metaCampaign.id;
        }
      }
      
      const campaign = await storage.createAdCampaign(campaignInput);
      
      // If the campaign is created from a suggestion, mark the suggestion as deployed
      if (campaignInput.suggestedAdId) {
        await storage.updateAdSuggestion(campaignInput.suggestedAdId, { deployed: true });
      }
      
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid input", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create ad campaign" });
      }
    }
  });

  app.get("/api/campaigns", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const campaigns = await storage.getAdCampaignsByUserId(userId);
      res.status(200).json(campaigns);
    } catch (error) {
      res.status(500).json({ message: "Failed to get ad campaigns" });
    }
  });

  // Performance Metrics routes
  app.get("/api/campaigns/:campaignId/performance", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const campaignId = parseInt(req.params.campaignId);
      const campaign = await storage.getAdCampaignById(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      // Get performance metrics from storage
      const metrics = await storage.getAdPerformanceMetricsByCampaignId(campaignId);
      
      // If no metrics are stored and campaign has metaCampaignId, fetch from Meta
      if (metrics.length === 0 && campaign.metaCampaignId) {
        const startDate = new Date(campaign.startDate);
        const endDate = campaign.endDate ? new Date(campaign.endDate) : new Date();
        
        const metaInsights = await metaAdsAPI.getCampaignInsights(
          campaign.metaCampaignId,
          startDate,
          endDate
        );
        
        if (metaInsights) {
          // Store the fetched metrics
          const metric = await storage.createAdPerformanceMetric({
            campaignId,
            date: new Date(),
            impressions: metaInsights.impressions,
            clicks: metaInsights.clicks,
            ctr: metaInsights.ctr,
            cpc: metaInsights.cpc,
            spend: metaInsights.spend,
            conversions: metaInsights.conversions,
            costPerConversion: metaInsights.cost_per_conversion,
            roas: metaInsights.return_on_ad_spend
          });
          
          return res.status(200).json([metric]);
        }
      }
      
      res.status(200).json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to get performance metrics" });
    }
  });
  
  // Historical performance data for a specific campaign
  app.get("/api/campaigns/:campaignId/performance/history", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const campaignId = parseInt(req.params.campaignId);
      const campaign = await storage.getAdCampaignById(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      // Parse date range from query parameters
      const startDateParam = req.query.startDate as string | undefined;
      const endDateParam = req.query.endDate as string | undefined;
      const startDate = startDateParam ? new Date(startDateParam) : new Date(campaign.startDate);
      const endDate = endDateParam ? new Date(endDateParam) : (campaign.endDate ? new Date(campaign.endDate) : new Date());
      
      // Get historical performance metrics
      const metrics = await storage.getPerformanceMetricsByDateRange(campaignId, startDate, endDate);
      
      // If no historical data exists and campaign has a Meta ID, fetch daily data
      if (metrics.length === 0 && campaign.metaCampaignId && campaign.startDate) {
        // Initialize array for daily metrics
        const dailyMetrics: AdPerformanceMetric[] = [];
        
        // Create a temporary date for looping
        const currentDate = new Date(startDate);
        currentDate.setHours(0, 0, 0, 0);
        
        // Loop through each day from start to end
        while (currentDate <= endDate) {
          // Create end of day
          const dayEnd = new Date(currentDate);
          dayEnd.setHours(23, 59, 59, 999);
          
          // Fetch data for this day from Meta
          const dailyInsights = await metaAdsAPI.getCampaignInsights(
            campaign.metaCampaignId,
            currentDate,
            dayEnd
          );
          
          if (dailyInsights) {
            // Store this day's metrics
            const metric = await storage.createAdPerformanceMetric({
              campaignId,
              date: new Date(currentDate),
              impressions: dailyInsights.impressions,
              clicks: dailyInsights.clicks,
              ctr: dailyInsights.ctr,
              cpc: dailyInsights.cpc,
              spend: dailyInsights.spend,
              conversions: dailyInsights.conversions,
              costPerConversion: dailyInsights.cost_per_conversion,
              roas: dailyInsights.return_on_ad_spend
            });
            
            dailyMetrics.push(metric);
          }
          
          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        // Return the generated daily metrics
        return res.status(200).json(dailyMetrics);
      }
      
      res.status(200).json(metrics);
    } catch (error) {
      console.error("Error fetching historical performance:", error);
      res.status(500).json({ message: "Failed to fetch historical campaign performance" });
    }
  });
  
  // Analytics data for all campaigns of a user
  app.get("/api/analytics", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const period = req.query.period as string | undefined;
      
      // Get performance metrics for all campaigns
      const metricsMap = await storage.getPerformanceMetricsByUserId(userId, period);
      
      // Get all user campaigns for reference
      const campaigns = await storage.getAdCampaignsByUserId(userId);
      
      // Format the response data with campaign info
      const analytics = {
        campaigns: campaigns.map(campaign => ({
          id: campaign.id,
          name: campaign.campaignName,
          objective: campaign.objective,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          status: campaign.status,
          metrics: metricsMap[campaign.id] || []
        })),
        // Add aggregated metrics
        aggregated: calculateAggregatedMetrics(metricsMap)
      };
      
      res.status(200).json(analytics);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      res.status(500).json({ message: "Failed to fetch analytics data" });
    }
  });
  
  // Helper function to calculate aggregated metrics
  function calculateAggregatedMetrics(metricsMap: Record<number, AdPerformanceMetric[]>) {
    // Initialize aggregated values
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalConversions = 0;
    
    // Count for averages
    let ctrDataPoints = 0;
    let cpcDataPoints = 0;
    let conversionRateDataPoints = 0;
    let costPerConversionDataPoints = 0;
    let roasDataPoints = 0;
    
    // Sum for averages
    let ctrSum = 0;
    let cpcSum = 0;
    let costPerConversionSum = 0;
    let roasSum = 0;
    
    // Process all metrics
    Object.values(metricsMap).forEach(campaignMetrics => {
      campaignMetrics.forEach(metric => {
        // Add to totals
        totalImpressions += metric.impressions;
        totalClicks += metric.clicks;
        totalSpend += parseFloat(metric.spend.replace(/[^\d.-]/g, '') || '0');
        if (metric.conversions) {
          totalConversions += metric.conversions;
        }
        
        // Add to averages
        if (metric.ctr) {
          ctrSum += parseFloat(metric.ctr.replace(/[^\d.-]/g, '') || '0');
          ctrDataPoints++;
        }
        
        if (metric.cpc) {
          cpcSum += parseFloat(metric.cpc.replace(/[^\d.-]/g, '') || '0');
          cpcDataPoints++;
        }
        
        if (metric.costPerConversion) {
          costPerConversionSum += parseFloat(metric.costPerConversion.replace(/[^\d.-]/g, '') || '0');
          costPerConversionDataPoints++;
        }
        
        if (metric.roas) {
          roasSum += parseFloat(metric.roas.replace(/[^\d.-]/g, '') || '0');
          roasDataPoints++;
        }
      });
    });
    
    // Calculate averages
    const avgCTR = ctrDataPoints > 0 ? (ctrSum / ctrDataPoints).toFixed(2) + '%' : '0%';
    const avgCPC = cpcDataPoints > 0 ? '$' + (cpcSum / cpcDataPoints).toFixed(2) : '$0';
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) + '%' : '0%';
    const avgCostPerConversion = costPerConversionDataPoints > 0 
      ? '$' + (costPerConversionSum / costPerConversionDataPoints).toFixed(2) 
      : '$0';
    const avgROAS = roasDataPoints > 0 ? (roasSum / roasDataPoints).toFixed(1) + 'x' : '0x';
    
    return {
      impressions: totalImpressions,
      clicks: totalClicks,
      spend: '$' + totalSpend.toFixed(2),
      conversions: totalConversions,
      ctr: avgCTR,
      cpc: avgCPC,
      conversionRate,
      costPerConversion: avgCostPerConversion,
      roas: avgROAS
    };
  }

  // Optimization Suggestions routes
  app.post("/api/campaigns/:campaignId/optimize", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const campaignId = parseInt(req.params.campaignId);
      const campaign = await storage.getAdCampaignById(campaignId);
      
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      
      if (campaign.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to campaign" });
      }
      
      // Get performance metrics for the campaign
      const metrics = await storage.getAdPerformanceMetricsByCampaignId(campaignId);
      if (metrics.length === 0) {
        return res.status(400).json({ message: "No performance data available for optimization" });
      }
      
      // Get the ad suggestion if available
      let adType = "Single Image";
      let targetAudience = "General audience";
      
      if (campaign.suggestedAdId) {
        const adSuggestion = await storage.getAdSuggestionById(campaign.suggestedAdId);
        if (adSuggestion) {
          adType = adSuggestion.adType;
          targetAudience = JSON.parse(adSuggestion.targetAudience).map((t: any) => t.name).join(", ");
        }
      }
      
      // Get the user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Use the latest metrics
      const latestMetric = metrics[metrics.length - 1];
      
      // Generate optimization suggestions using OpenAI
      const prompt: OptimizationPrompt = {
        businessName: user.businessName,
        campaignName: campaign.campaignName,
        adType,
        targetAudience,
        performanceData: {
          impressions: latestMetric.impressions,
          clicks: latestMetric.clicks,
          ctr: latestMetric.ctr,
          cpc: latestMetric.cpc,
          spend: latestMetric.spend,
          conversions: latestMetric.conversions,
          costPerConversion: latestMetric.costPerConversion,
          roas: latestMetric.roas
        },
        industryAverages: {
          ctr: "2.0%",
          cpc: "$0.50",
          conversionRate: "5.0%"
        }
      };
      
      const suggestions = await generateOptimizationSuggestions(prompt, 3);
      
      // Save the generated suggestions to the database
      const savedSuggestions = await Promise.all(
        suggestions.map(suggestion => 
          storage.createOptimizationSuggestion({
            userId,
            campaignId,
            title: suggestion.title,
            description: suggestion.description,
            type: suggestion.type,
            status: "pending"
          })
        )
      );
      
      res.status(201).json(savedSuggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate optimization suggestions" });
    }
  });

  app.get("/api/suggestions/optimization", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const suggestions = await storage.getOptimizationSuggestionsByUserId(userId);
      res.status(200).json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get optimization suggestions" });
    }
  });

  app.patch("/api/suggestions/optimization/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const suggestionId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["applied", "dismissed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'applied' or 'dismissed'" });
      }
      
      const updatedSuggestion = await storage.updateOptimizationSuggestion(suggestionId, { status });
      
      if (!updatedSuggestion) {
        return res.status(404).json({ message: "Optimization suggestion not found" });
      }
      
      res.status(200).json(updatedSuggestion);
    } catch (error) {
      res.status(500).json({ message: "Failed to update optimization suggestion" });
    }
  });

  // Onboarding routes
  app.patch("/api/user/onboarding", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { onboardingComplete } = req.body;
      
      if (typeof onboardingComplete !== "boolean") {
        return res.status(400).json({ message: "Invalid input. onboardingComplete must be a boolean" });
      }
      
      const updatedUser = await storage.updateUser(userId, { onboardingComplete });
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(200).json({ onboardingComplete: updatedUser.onboardingComplete });
    } catch (error) {
      res.status(500).json({ message: "Failed to update onboarding status" });
    }
  });

  return httpServer;
}
