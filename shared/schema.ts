import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Added users table definition for subscription model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  credits: integer("credits").notNull().default(0),
  freePrompts: integer("free_prompts").notNull().default(1),
  // Optional: valid API key for BYOK
  apiKey: text("api_key"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  apiKey: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const agentConfigSchema = z.object({
  name: z.string(),
  provider: z.enum(["openai", "gemini", "perplexity", "custom", "builtin"]),
  model: z.string(),
  apiKey: z.string(),
  customEndpoint: z.string().optional(),
});

export const debateConfigSchema = z.object({
  topic: z.string().min(1),
  agents: z.array(agentConfigSchema).length(3),
});

export const debateMessageSchema = z.object({
  id: z.string(),
  agentName: z.string(),
  agentNumber: z.number().int().min(1).max(3),
  round: z.number().int().min(1).max(5),
  message: z.string(),
  timestamp: z.string(),
});

export const debateTranscriptSchema = z.object({
  topic: z.string(),
  agents: z.array(z.object({
    name: z.string(),
    provider: z.string(),
    model: z.string(),
  })),
  messages: z.array(debateMessageSchema),
  startedAt: z.string(),
  completedAt: z.string().optional(),
});

export type AgentConfig = z.infer<typeof agentConfigSchema>;
export type DebateConfig = z.infer<typeof debateConfigSchema>;
export type DebateMessage = z.infer<typeof debateMessageSchema>;
export type DebateTranscript = z.infer<typeof debateTranscriptSchema>;
