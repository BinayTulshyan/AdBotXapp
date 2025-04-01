import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  email: text("email").notNull().unique(),
  metaAdAccountId: text("meta_ad_account_id"),
  metaAdAccountConnected: boolean("meta_ad_account_connected").default(false),
  onboardingComplete: boolean("onboarding_complete").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  businessName: true,
  email: true,
});

// Ad objectives schema
export const adObjectives = pgTable("ad_objectives", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  objective: text("objective").notNull(),
  description: text("description").notNull(),
  targetAudience: text("target_audience").notNull(),
  budget: text("budget").notNull(),
  duration: text("duration").notNull(),
});

export const insertAdObjectiveSchema = createInsertSchema(adObjectives).pick({
  userId: true,
  objective: true,
  description: true,
  targetAudience: true,
  budget: true,
  duration: true,
});

// Ad suggestion schema
export const adSuggestions = pgTable("ad_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  objectiveId: integer("objective_id").references(() => adObjectives.id),
  title: text("title").notNull(),
  headline: text("headline").notNull(),
  primaryText: text("primary_text").notNull(),
  callToAction: text("call_to_action").notNull(),
  targetAudience: jsonb("target_audience").notNull(),
  adType: text("ad_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  deployed: boolean("deployed").default(false),
});

export const insertAdSuggestionSchema = createInsertSchema(adSuggestions).pick({
  userId: true,
  objectiveId: true,
  title: true,
  headline: true,
  primaryText: true,
  callToAction: true,
  targetAudience: true,
  adType: true,
});

// Ad campaigns schema
export const adCampaigns = pgTable("ad_campaigns", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  suggestedAdId: integer("suggested_ad_id").references(() => adSuggestions.id),
  campaignName: text("campaign_name").notNull(),
  metaCampaignId: text("meta_campaign_id"),
  status: text("status").notNull(),
  budget: text("budget").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  objective: text("objective").notNull(),
});

export const insertAdCampaignSchema = createInsertSchema(adCampaigns).pick({
  userId: true,
  suggestedAdId: true,
  campaignName: true,
  metaCampaignId: true,
  status: true,
  budget: true,
  startDate: true,
  endDate: true,
  objective: true,
});

// Ad performance metrics schema
export const adPerformanceMetrics = pgTable("ad_performance_metrics", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => adCampaigns.id),
  date: timestamp("date").notNull(),
  impressions: integer("impressions").notNull(),
  clicks: integer("clicks").notNull(),
  ctr: text("ctr").notNull(),
  cpc: text("cpc").notNull(),
  spend: text("spend").notNull(),
  conversions: integer("conversions"),
  costPerConversion: text("cost_per_conversion"),
  roas: text("roas"),
});

export const insertAdPerformanceMetricSchema = createInsertSchema(adPerformanceMetrics).pick({
  campaignId: true,
  date: true,
  impressions: true,
  clicks: true,
  ctr: true,
  cpc: true,
  spend: true,
  conversions: true,
  costPerConversion: true,
  roas: true,
});

// Optimization suggestions schema
export const optimizationSuggestions = pgTable("optimization_suggestions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  campaignId: integer("campaign_id").references(() => adCampaigns.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // warning, success, error
  status: text("status").notNull(), // pending, applied, dismissed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOptimizationSuggestionSchema = createInsertSchema(optimizationSuggestions).pick({
  userId: true,
  campaignId: true, 
  title: true,
  description: true,
  type: true,
  status: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type AdObjective = typeof adObjectives.$inferSelect;
export type InsertAdObjective = z.infer<typeof insertAdObjectiveSchema>;

export type AdSuggestion = typeof adSuggestions.$inferSelect;
export type InsertAdSuggestion = z.infer<typeof insertAdSuggestionSchema>;

export type AdCampaign = typeof adCampaigns.$inferSelect;
export type InsertAdCampaign = z.infer<typeof insertAdCampaignSchema>;

export type AdPerformanceMetric = typeof adPerformanceMetrics.$inferSelect;
export type InsertAdPerformanceMetric = z.infer<typeof insertAdPerformanceMetricSchema>;

export type OptimizationSuggestion = typeof optimizationSuggestions.$inferSelect;
export type InsertOptimizationSuggestion = z.infer<typeof insertOptimizationSuggestionSchema>;
