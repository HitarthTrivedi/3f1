import type { Express } from "express";
import { createServer, type Server } from "http";
import { debateConfigSchema, insertUserSchema } from "@shared/schema";
import { runDebate } from "./lib/debateOrchestrator";
import type { DebateMessage } from "@shared/schema";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

// --- Auth Setup ---
// Extend session interface for anonymous usage
declare module "express-session" {
  interface SessionData {
    anonUsage?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: true, // Changed to true to track anonymous sessions
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) { // In production use bcrypt
        return done(null, false);
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // --- User Routes ---
  app.post("/api/register", async (req, res) => {
    try {
      // Logic for new user: 1 free prompt
      const userData = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(userData.username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const user = await storage.createUser(userData);
      req.login(user, (err) => {
        if (err) return res.status(500).json({ error: "Login failed" });
        return res.json(user);
      });
    } catch (err) {
      res.status(400).json({ error: "Invalid registration data" });
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.json(req.user);
  });

  app.get("/api/user", (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    res.json(req.user);
  });

  app.post("/api/pay", (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const user = req.user as any;
    // Mock payment: Add 100 credits for 10 rupees (or just add 10 credits)
    // User said "pay 10rupees for each and every subsequent prompt".
    // So 10 rupees = 1 prompt = 10 credits (if I stick to my plan "Costs 10 credits").
    // Let's say pay adds 50 credits (5 prompts).
    storage.updateUserCredits(user.id, user.credits + 50)
      .then((updated) => res.json(updated))
      .catch((err) => res.status(500).json({ error: err.message }));
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // --- Debate Route ---
  app.post("/api/debate/start", async (req, res) => {
    try {
      const validatedConfig = debateConfigSchema.parse(req.body);

      // Check for Built-in usage
      const usesCredits = validatedConfig.agents.some(a => a.provider === "builtin");

      if (!usesCredits) {
        // BYOK Flow: Verify all have keys
        const missingKeys = validatedConfig.agents.some(a => !a.apiKey || a.apiKey.trim().length === 0);
        if (missingKeys) {
          return res.status(400).json({ error: "Missing API keys for external providers." });
        }
        // Proceed unlimited
      } else {
        // Built-in Flow -> Check Subscription / Free Tier

        if (req.isAuthenticated()) {
          // LOGGED IN USER FLOW
          const user = req.user as any;

          // Check Free Prompts
          if (user.freePrompts > 0) {
            await storage.decrementFreePrompt(user.id);
          }
          // Check Credits
          else if (user.credits >= 10) {
            await storage.updateUserCredits(user.id, user.credits - 10);
          }
          else {
            return res.status(402).json({ error: "Insufficient credits. Please buy more credits to continue." });
          }
        } else {
          // ANONYMOUS USER FLOW (Refined Logic)
          // strict 1 free prompt per session
          const usage = req.session.anonUsage || 0;

          if (usage >= 1) {
            return res.status(401).json({
              error: "Free anon limit reached. Please login to continue.",
              requiresAuth: true
            });
          }

          // Increment anonymous usage
          req.session.anonUsage = usage + 1;
        }

        // Inject System Keys and Map Provider
        validatedConfig.agents = validatedConfig.agents.map(agent => {
          if (agent.provider === "builtin") {
            return {
              ...agent,
              provider: "gemini", // Map to underlying provider
              apiKey: process.env.GEMINI_API_KEY || "" // Inject env var
            };
          }
          // Ensure other agents have keys (already checked generally, but safe to keep as is)
          return agent;
        });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const sendMessage = (message: DebateMessage) => {
        res.write(`data: ${JSON.stringify(message)}\n\n`);
      };

      try {
        const messages = await runDebate(
          validatedConfig.topic,
          validatedConfig.agents,
          sendMessage
        );

        res.write(`data: ${JSON.stringify({ type: "complete", messages })}\n\n`);
        res.end();
      } catch (debateError) {
        console.error("Debate error:", debateError);
        res.write(`data: ${JSON.stringify({
          type: "error",
          error: debateError instanceof Error ? debateError.message : "Debate execution failed"
        })}\n\n`);
        res.end();
      }
    } catch (error) {
      console.error("Validation error:", error);
      res.status(400).json({
        error: "Invalid debate configuration",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function getSystemKey(provider: string): string | undefined {
  // Simple helper to get env vars based on provider
  switch (provider.toLowerCase()) {
    case "openai": return process.env.OPENAI_API_KEY;
    case "gemini": return process.env.GEMINI_API_KEY;
    case "perplexity": return process.env.PERPLEXITY_API_KEY;
    default: return undefined;
  }
}
