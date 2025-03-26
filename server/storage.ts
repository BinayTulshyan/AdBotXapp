import { 
  users, type User, type InsertUser,
  adObjectives, type AdObjective, type InsertAdObjective,
  adSuggestions, type AdSuggestion, type InsertAdSuggestion,
  adCampaigns, type AdCampaign, type InsertAdCampaign,
  adPerformanceMetrics, type AdPerformanceMetric, type InsertAdPerformanceMetric,
  optimizationSuggestions, type OptimizationSuggestion, type InsertOptimizationSuggestion
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Ad Objective methods
  createAdObjective(objective: InsertAdObjective): Promise<AdObjective>;
  getAdObjectivesByUserId(userId: number): Promise<AdObjective[]>;
  getAdObjective(id: number): Promise<AdObjective | undefined>;
  
  // Ad Suggestion methods
  createAdSuggestion(suggestion: InsertAdSuggestion): Promise<AdSuggestion>;
  getAdSuggestionsByUserId(userId: number): Promise<AdSuggestion[]>;
  getAdSuggestionById(id: number): Promise<AdSuggestion | undefined>;
  updateAdSuggestion(id: number, updates: Partial<AdSuggestion>): Promise<AdSuggestion | undefined>;
  
  // Ad Campaign methods
  createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign>;
  getAdCampaignsByUserId(userId: number): Promise<AdCampaign[]>;
  getAdCampaignById(id: number): Promise<AdCampaign | undefined>;
  updateAdCampaign(id: number, updates: Partial<AdCampaign>): Promise<AdCampaign | undefined>;
  
  // Ad Performance Metrics methods
  createAdPerformanceMetric(metric: InsertAdPerformanceMetric): Promise<AdPerformanceMetric>;
  getAdPerformanceMetricsByCampaignId(campaignId: number): Promise<AdPerformanceMetric[]>;
  
  // Optimization Suggestion methods
  createOptimizationSuggestion(suggestion: InsertOptimizationSuggestion): Promise<OptimizationSuggestion>;
  getOptimizationSuggestionsByUserId(userId: number): Promise<OptimizationSuggestion[]>;
  getOptimizationSuggestionsByCampaignId(campaignId: number): Promise<OptimizationSuggestion[]>;
  updateOptimizationSuggestion(id: number, updates: Partial<OptimizationSuggestion>): Promise<OptimizationSuggestion | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private adObjectives: Map<number, AdObjective>;
  private adSuggestions: Map<number, AdSuggestion>;
  private adCampaigns: Map<number, AdCampaign>;
  private adPerformanceMetrics: Map<number, AdPerformanceMetric>;
  private optimizationSuggestions: Map<number, OptimizationSuggestion>;
  
  private nextUserId = 1;
  private nextAdObjectiveId = 1;
  private nextAdSuggestionId = 1;
  private nextAdCampaignId = 1;
  private nextAdPerformanceMetricId = 1;
  private nextOptimizationSuggestionId = 1;

  constructor() {
    this.users = new Map();
    this.adObjectives = new Map();
    this.adSuggestions = new Map();
    this.adCampaigns = new Map();
    this.adPerformanceMetrics = new Map();
    this.optimizationSuggestions = new Map();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      metaAdAccountId: null, 
      metaAdAccountConnected: false, 
      onboardingComplete: false 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Ad Objective methods
  async createAdObjective(objective: InsertAdObjective): Promise<AdObjective> {
    const id = this.nextAdObjectiveId++;
    const newObjective = { ...objective, id };
    this.adObjectives.set(id, newObjective);
    return newObjective;
  }

  async getAdObjectivesByUserId(userId: number): Promise<AdObjective[]> {
    return Array.from(this.adObjectives.values()).filter(
      objective => objective.userId === userId
    );
  }

  async getAdObjective(id: number): Promise<AdObjective | undefined> {
    return this.adObjectives.get(id);
  }

  // Ad Suggestion methods
  async createAdSuggestion(suggestion: InsertAdSuggestion): Promise<AdSuggestion> {
    const id = this.nextAdSuggestionId++;
    const now = new Date();
    const newSuggestion = { 
      ...suggestion, 
      id, 
      createdAt: now, 
      deployed: false 
    };
    this.adSuggestions.set(id, newSuggestion);
    return newSuggestion;
  }

  async getAdSuggestionsByUserId(userId: number): Promise<AdSuggestion[]> {
    return Array.from(this.adSuggestions.values()).filter(
      suggestion => suggestion.userId === userId
    );
  }

  async getAdSuggestionById(id: number): Promise<AdSuggestion | undefined> {
    return this.adSuggestions.get(id);
  }

  async updateAdSuggestion(id: number, updates: Partial<AdSuggestion>): Promise<AdSuggestion | undefined> {
    const suggestion = await this.getAdSuggestionById(id);
    if (!suggestion) return undefined;
    
    const updatedSuggestion = { ...suggestion, ...updates };
    this.adSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }

  // Ad Campaign methods
  async createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign> {
    const id = this.nextAdCampaignId++;
    const newCampaign = { ...campaign, id };
    this.adCampaigns.set(id, newCampaign);
    return newCampaign;
  }

  async getAdCampaignsByUserId(userId: number): Promise<AdCampaign[]> {
    return Array.from(this.adCampaigns.values()).filter(
      campaign => campaign.userId === userId
    );
  }

  async getAdCampaignById(id: number): Promise<AdCampaign | undefined> {
    return this.adCampaigns.get(id);
  }

  async updateAdCampaign(id: number, updates: Partial<AdCampaign>): Promise<AdCampaign | undefined> {
    const campaign = await this.getAdCampaignById(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...updates };
    this.adCampaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  // Ad Performance Metrics methods
  async createAdPerformanceMetric(metric: InsertAdPerformanceMetric): Promise<AdPerformanceMetric> {
    const id = this.nextAdPerformanceMetricId++;
    const newMetric = { ...metric, id };
    this.adPerformanceMetrics.set(id, newMetric);
    return newMetric;
  }

  async getAdPerformanceMetricsByCampaignId(campaignId: number): Promise<AdPerformanceMetric[]> {
    return Array.from(this.adPerformanceMetrics.values()).filter(
      metric => metric.campaignId === campaignId
    );
  }

  // Optimization Suggestions methods
  async createOptimizationSuggestion(suggestion: InsertOptimizationSuggestion): Promise<OptimizationSuggestion> {
    const id = this.nextOptimizationSuggestionId++;
    const now = new Date();
    const newSuggestion = { 
      ...suggestion, 
      id, 
      createdAt: now 
    };
    this.optimizationSuggestions.set(id, newSuggestion);
    return newSuggestion;
  }

  async getOptimizationSuggestionsByUserId(userId: number): Promise<OptimizationSuggestion[]> {
    return Array.from(this.optimizationSuggestions.values()).filter(
      suggestion => suggestion.userId === userId
    );
  }

  async getOptimizationSuggestionsByCampaignId(campaignId: number): Promise<OptimizationSuggestion[]> {
    return Array.from(this.optimizationSuggestions.values()).filter(
      suggestion => suggestion.campaignId === campaignId
    );
  }

  async updateOptimizationSuggestion(id: number, updates: Partial<OptimizationSuggestion>): Promise<OptimizationSuggestion | undefined> {
    const suggestion = this.optimizationSuggestions.get(id);
    if (!suggestion) return undefined;
    
    const updatedSuggestion = { ...suggestion, ...updates };
    this.optimizationSuggestions.set(id, updatedSuggestion);
    return updatedSuggestion;
  }
}

export const storage = new MemStorage();
