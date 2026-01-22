import type { Express } from "express";
import { createServer, type Server } from "http";
import { debateConfigSchema } from "@shared/schema";
import { runDebate } from "./lib/debateOrchestrator";
import type { DebateMessage } from "@shared/schema";
import { storage } from "./storage";
import session from "express-session";
import { initializeFirebaseAdmin } from "./lib/firebase-admin";
import { requireAuth, optionalAuth } from "./lib/auth-middleware";
import { initializeRazorpay, getRazorpay } from "./lib/razorpay";
import crypto from "crypto";

// Extend session interface for anonymous usage
declare module "express-session" {
  interface SessionData {
    anonUsage?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Firebase Admin
  console.log("[registerRoutes] Initializing Firebase Admin...");
  let firebaseReady = false;
  try {
    initializeFirebaseAdmin();
    console.log("✓ Firebase Admin initialized");
    firebaseReady = true;
  } catch (error: any) {
    console.error("✗ Firebase Admin initialization failed:", error.message);
    console.warn("⚠ Auth features will not work without Firebase initialization");
  }

  // Check storage configuration
  console.log("[registerRoutes] Checking storage configuration...");
  if (process.env.DATABASE_URL) {
    console.log("✓ Using DatabaseStorage (Postgres)");
  } else {
    console.log("⚠ Using FirestoreStorage - Firebase must be initialized");
  }

  // Initialize Razorpay
  console.log("[registerRoutes] Initializing Razorpay...");
  let razorpayReady = false;
  try {
    initializeRazorpay();
    console.log("✓ Razorpay initialized");
    razorpayReady = true;
  } catch (error: any) {
    console.warn("⚠ Razorpay initialization failed - payment features will not work:", error.message);
  }

  // Session middleware (for anonymous user tracking only)
  app.use(session({
    secret: process.env.SESSION_SECRET || "keyboard-cat-secret-change-in-production",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      firebase: firebaseReady,
      razorpay: razorpayReady,
      database: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString(),
    });
  });

  // --- Firebase Auth Routes ---

  // Verify Firebase token and sync user with database
  app.post("/api/auth/verify-token", requireAuth, async (req, res) => {
    try {
      const firebaseUser = req.firebaseUser!;
      console.log(`[/api/auth/verify-token] Verifying user: ${firebaseUser.uid}, email: ${firebaseUser.email}`);

      if (!storage) {
        console.error("[/api/auth/verify-token] Storage not initialized");
        return res.status(500).json({ error: "Database storage not initialized" });
      }

      // Check if user exists in database
      let user = await storage.getUserByFirebaseUid(firebaseUser.uid);

      if (!user) {
        // Create new user
        console.log(`[/api/auth/verify-token] Creating new user for: ${firebaseUser.email}`);
        user = await storage.createUser({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || "",
          displayName: firebaseUser.name || null,
        });
        console.log(`✓ New user created: ${user.email}`);
      } else {
        console.log(`✓ User found: ${user.email}`);
      }

      res.json(user);
    } catch (error: any) {
      console.error("[/api/auth/verify-token] Error:", error.message || error);
      console.error("[/api/auth/verify-token] Stack:", error.stack);
      res.status(500).json({ error: "Failed to verify user", details: error.message });
    }
  });

  // Get current user (protected)
  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const firebaseUser = req.firebaseUser!;
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // --- Razorpay Payment Routes ---

  // Create Razorpay order
  app.post("/api/payment/create-order", requireAuth, async (req, res) => {
    try {
      const firebaseUser = req.firebaseUser!;
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { amount, currency = "INR" } = req.body; // amount in rupees (e.g., 10 for ₹10)

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
      }

      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency,
        receipt: `order_${user.id}_${Date.now()}`,
      });

      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      });
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  // Verify Razorpay payment and add credits
  app.post("/api/payment/verify", requireAuth, async (req, res) => {
    try {
      const firebaseUser = req.firebaseUser!;
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

      // Verify signature
      const keySecret = process.env.RAZORPAY_KEY_SECRET!;
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ error: "Invalid payment signature" });
      }

      // Calculate credits: ₹10 = 50 credits, so credits = (amount_in_paise / 100) * 5
      const amountInRupees = amount / 100;
      const creditsToAdd = Math.floor(amountInRupees * 5);

      // Update user credits
      const updatedUser = await storage.updateUserCredits(user.id, user.credits + creditsToAdd);

      // Record transaction
      await storage.createTransaction({
        userId: user.id,
        type: "payment",
        amount: creditsToAdd,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: "completed",
      });

      console.log(`Payment successful: ${user.email} +${creditsToAdd} credits`);
      res.json({ success: true, credits: updatedUser.credits, creditsAdded: creditsToAdd });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Payment verification failed" });
    }
  });

  // --- Debate Route ---
  app.post("/api/debate/start", optionalAuth, async (req, res) => {
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

        if (req.firebaseUser) {
          // LOGGED IN USER FLOW (Firebase authenticated)
          const firebaseUser = req.firebaseUser;
          const user = await storage.getUserByFirebaseUid(firebaseUser.uid);

          if (!user) {
            return res.status(404).json({ error: "User not found. Please sign in again." });
          }

          // Check Free Prompts
          if (user.freePrompts > 0) {
            await storage.decrementFreePrompt(user.id);
            await storage.createTransaction({
              userId: user.id,
              type: "free_prompt",
              amount: -1,
              status: "completed",
            });
          }
          // Check Credits
          else if (user.credits >= 10) {
            await storage.updateUserCredits(user.id, user.credits - 10);
            await storage.createTransaction({
              userId: user.id,
              type: "debit",
              amount: -10,
              status: "completed",
            });
          }
          else {
            return res.status(402).json({ error: "Insufficient credits. Please buy more credits to continue." });
          }
        } else {
          // ANONYMOUS USER FLOW
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
