import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Updated users table for Firebase authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  credits: integer("credits").notNull().default(0),
  freePrompts: integer("free_prompts").notNull().default(1),
  createdAt: integer("created_at").notNull().default(Date.now()),
});

// Transaction history table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'payment', 'debit', 'free_prompt'
  amount: integer("amount").notNull(), // credits
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  status: text("status").notNull().default("completed"), // 'pending', 'completed', 'failed'
  createdAt: integer("created_at").notNull().default(Date.now()),
});

export const insertUserSchema = createInsertSchema(users).pick({
  firebaseUid: true,
  email: true,
  displayName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;

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
