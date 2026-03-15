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
        console.error(`[Payment Verify] Signature mismatch for user ${user.email}`);
        console.error(`Expected: ${generatedSignature}`);
        console.error(`Received: ${razorpay_signature}`);
        return res.status(400).json({ error: "Invalid payment signature" });
      }

      // Calculate credits based on frontend packages
      const amountInRupees = Number(amount) / 100;
      let creditsToAdd = 0;

      console.log(`[Payment Verify] Processing payment: ₹${amountInRupees} for user ${user.email}`);

      if (amountInRupees === 10) creditsToAdd = 50;
      else if (amountInRupees === 50) creditsToAdd = 300;
      else if (amountInRupees === 100) creditsToAdd = 650;
      else if (amountInRupees === 500) creditsToAdd = 3500;
      else {
        // Fallback to standard ₹1 = 5 credits
        creditsToAdd = Math.floor(amountInRupees * 5);
      }

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

      console.log(`[Payment Verify] Success: Added ${creditsToAdd} credits to ${user.email}. New balance: ${updatedUser.credits}`);
      res.json({ success: true, credits: updatedUser.credits, creditsAdded: creditsToAdd });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ error: "Payment verification failed" });
    }
  });

  // --- Debate Routes ---

  // Get active debate for user
  app.get("/api/debate/active", requireAuth, async (req, res) => {
    try {
      const firebaseUser = req.firebaseUser!;
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const activeDebate = await storage.getActiveDebate(user.id);

      if (!activeDebate) {
        return res.json({ hasActiveDebate: false });
      }

      res.json({
        hasActiveDebate: true,
        debate: activeDebate
      });
    } catch (error) {
      console.error("Error fetching active debate:", error);
      res.status(500).json({ error: "Failed to fetch active debate" });
    }
  });

  // Clear active debate
  app.delete("/api/debate/active", requireAuth, async (req, res) => {
    try {
      const firebaseUser = req.firebaseUser!;
      const user = await storage.getUserByFirebaseUid(firebaseUser.uid);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.clearActiveDebate(user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing active debate:", error);
      res.status(500).json({ error: "Failed to clear active debate" });
    }
  });

  app.post("/api/debate/start", optionalAuth, async (req, res) => {
    try {
      const validatedConfig = debateConfigSchema.parse(req.body);

      let localUser: any = null;
      if (req.firebaseUser) {
        localUser = await storage.getUserByFirebaseUid(req.firebaseUser.uid);
        if (!localUser) {
          return res.status(404).json({ error: "User not found. Please sign in again." });
        }
      }

      // Check for Built-in usage
      const usesCredits = validatedConfig.agents.some(a => a.provider === "builtin" || a.provider === "builtin_grok");

      if (!usesCredits) {
        // BYOK Flow: Verify all have keys
        const missingKeys = validatedConfig.agents.some(a => !a.apiKey || a.apiKey.trim().length === 0);
        if (missingKeys) {
          return res.status(400).json({ error: "Missing API keys for external providers." });
        }
        // Proceed unlimited
      } else {
        // Built-in Flow -> Pre-check Subscription / Free Tier
        if (localUser) {
          // Pre-check only
          if (localUser.freePrompts <= 0 && localUser.credits < 10) {
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
        }

        // Inject System Keys and Map Provider with better rotation
        const availableGeminiKeys = [
          process.env.GEMINI_API_KEY_1,
          process.env.GEMINI_API_KEY_2,
          process.env.GEMINI_API_KEY_3,
          process.env.GEMINI_API_KEY
        ].filter((key): key is string => !!key && key.length > 0 && !key.includes("_here"));

        const availableGrokKeys = [
          process.env.GROK_API_KEY
        ].filter((key): key is string => !!key && key.length > 0 && !key.includes("_here"));

        validatedConfig.agents = validatedConfig.agents.map((agent, index) => {
          if (agent.provider === "builtin") {
            // Mapping for Built-in Gemini
            const selectedKey = availableGeminiKeys.length > 0
              ? availableGeminiKeys[index % availableGeminiKeys.length]
              : "";

            console.log(`[Built-in Gemini] Agent ${index + 1} allotted key: ${selectedKey.substring(0, 8)}...`);
            return {
              ...agent,
              provider: "gemini", // Map to underlying provider
              apiKey: selectedKey,
              model: "gemini-2.5-flash" // Force model for builtin
            };
          } else if (agent.provider === "builtin_grok") {
            // Mapping for Built-in Grok
            const selectedKey = availableGrokKeys.length > 0
              ? availableGrokKeys[index % availableGrokKeys.length]
              : "";

            console.log(`[Built-in Grok] Agent ${index + 1} allotted key: ${selectedKey.substring(0, 8)}...`);
            return {
              ...agent,
              provider: "grok", // Map to underlying provider
              apiKey: selectedKey,
              model: "grok-4-latest" // Force model for builtin
            };
          }
          return agent;
        });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const sentMessages: DebateMessage[] = [];

      if (localUser) {
        try {
          await storage.saveActiveDebate(localUser.id, {
            topic: validatedConfig.topic,
            agents: validatedConfig.agents,
            messages: sentMessages
          });
        } catch (e) {
          console.error("Failed to save initial active debate:", e);
        }
      }

      const sendMessage = (message: DebateMessage) => {
        res.write(`data: ${JSON.stringify(message)}\n\n`);
        sentMessages.push(message);

        if (localUser) {
          storage.saveActiveDebate(localUser.id, {
            topic: validatedConfig.topic,
            agents: validatedConfig.agents,
            messages: [...sentMessages]
          }).catch(e => console.error("Mid-debate save error:", e));
        }
      };

      try {
        const messages = await runDebate(
          validatedConfig.topic,
          validatedConfig.agents,
          sendMessage
        );

        // ONLY DEDUCT AFTER SUCCESSFUL DEBATE
        if (usesCredits && req.firebaseUser) {
          const firebaseUser = req.firebaseUser;
          const user = await storage.getUserByFirebaseUid(firebaseUser.uid);

          if (user) {
            if (user.freePrompts > 0) {
              await storage.decrementFreePrompt(user.id);
              await storage.createTransaction({
                userId: user.id,
                type: "free_prompt",
                amount: -1,
                status: "completed",
              });
              console.log(`[Debate Success] Deducted 1 free prompt from ${user.email}`);
            } else if (user.credits >= 10) {
              await storage.updateUserCredits(user.id, user.credits - 10);
              await storage.createTransaction({
                userId: user.id,
                type: "debit",
                amount: -10,
                status: "completed",
              });
              console.log(`[Debate Success] Deducted 10 credits from ${user.email}`);
            }
          }
        } else if (usesCredits && !req.firebaseUser) {
          // ANONYMOUS USER FLOW - Increment usage after successful debate
          req.session.anonUsage = (req.session.anonUsage || 0) + 1;
          console.log(`[Debate Success] Anonymous user used 1 free prompt. Total: ${req.session.anonUsage}`);
        }

        // Final save just to be sure, and to log completion
        if (localUser && messages.length > 0) {
          try {
            await storage.saveActiveDebate(localUser.id, {
              topic: validatedConfig.topic,
              agents: validatedConfig.agents,
              messages: messages
            });
            console.log(`[Debate Persistence] Saved final state for ${localUser.email}`);
          } catch (storageError) {
            console.error("Failed to save final active debate:", storageError);
          }
        }

        res.write(`data: ${JSON.stringify({ type: "complete", messages })}\n\n`);
        res.end();
      } catch (debateError: any) {
        console.error("Debate error:", debateError);

        let errorMessage = "Debate execution failed";
        const errorStr = JSON.stringify(debateError).toLowerCase();
        const message = (debateError?.message || debateError?.error || debateError?.toString() || "").toLowerCase();

        if (message.includes("api_key_invalid") || message.includes("expired") || errorStr.includes("api_key_invalid")) {
          errorMessage = "AI Service Error: The API key for the AI provider is invalid or expired. Check your configuration.";
        } else if (message.includes("credits or licenses") || message.includes("insufficient_quota") || message.includes("credit limit") || errorStr.includes("credits or licenses") || errorStr.includes("insufficient_quota")) {
          errorMessage = "External Provider Error: Your AI provider account (Grok/x.ai) has no credits. Please top up your balance at https://console.x.ai/. (Note: This is separate from your 3F1 credits).";
        } else if (debateError instanceof Error) {
          errorMessage = debateError.message;
        } else if (typeof debateError === "string") {
          errorMessage = debateError;
        }

        res.write(`data: ${JSON.stringify({ type: "error", error: errorMessage })}\n\n`);
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

  // --- Speechify TTS Route ---
  const AGENT_VOICES: Record<number, string> = {
    0: "george",   // Agent 1 (Analyst) — calm, measured
    1: "henry",    // Agent 2 (Critic) — sharp, direct
    2: "kristy",   // Agent 3 (Synthesizer) — balanced, warm
  };

  app.post("/api/tts/generate", optionalAuth, async (req, res) => {
    try {
      const speechifyKey = process.env.SPEECHIFY_API_KEY;
      if (!speechifyKey || speechifyKey.includes("_here")) {
        return res.status(500).json({ error: "Speechify API key not configured on server." });
      }

      // Require authentication for TTS
      if (!req.firebaseUser) {
        return res.status(401).json({ error: "Login required to use Listen Up." });
      }

      const firebaseUser = req.firebaseUser;
      const ttsUser = await storage.getUserByFirebaseUid(firebaseUser.uid);

      if (!ttsUser) {
        return res.status(404).json({ error: "User not found. Please sign in again." });
      }

      const { messages } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "No messages provided." });
      }

      // Deduct 5 credits for TTS
      const TTS_CREDIT_COST = 5;
      if (ttsUser.credits < TTS_CREDIT_COST) {
        return res.status(402).json({ error: `Insufficient credits. Listen Up requires ${TTS_CREDIT_COST} credits.` });
      }

      await storage.updateUserCredits(ttsUser.id, ttsUser.credits - TTS_CREDIT_COST);
      await storage.createTransaction({
        userId: ttsUser.id,
        type: "debit",
        amount: -TTS_CREDIT_COST,
        status: "completed",
      });
      console.log(`TTS credit deduction: ${ttsUser.email} -${TTS_CREDIT_COST} credits`);

      let creditsDeducted = true;
      const refundCredits = async () => {
        if (!creditsDeducted) return;
        try {
          const currentUser = await storage.getUserByFirebaseUid(firebaseUser.uid);
          if (currentUser) {
            await storage.updateUserCredits(currentUser.id, currentUser.credits + TTS_CREDIT_COST);
            await storage.createTransaction({
              userId: currentUser.id,
              type: "refund",
              amount: TTS_CREDIT_COST,
              status: "completed",
            });
            console.log(`TTS credit refund: ${currentUser.email} +${TTS_CREDIT_COST} credits (Generation Failed)`);
          }
          creditsDeducted = false;
        } catch (e) {
          console.error("Failed to refund credits:", e);
        }
      };

      try {
        // Process messages in chronological order, generating audio for each
        const audioSegments: Array<{
          agentName: string;
          agentNumber: number;
          round: number;
          audioBase64: string;
        }> = [];

        for (const msg of messages) {
          const voiceId = AGENT_VOICES[msg.agentNumber] || "george";

          try {
            // Strip markdown formatting for cleaner TTS
            const cleanText = msg.message
              .replace(/[*_#`~]/g, "")
              .replace(/\n{3,}/g, "\n\n")
              .trim();

            if (!cleanText) continue;

            const speechifyResponse = await fetch("https://api.sws.speechify.com/v1/audio/speech", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${speechifyKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                input: cleanText.substring(0, 5000), // Speechify has input limits
                voice_id: voiceId,
                audio_format: "mp3",
              }),
            });

            if (!speechifyResponse.ok) {
              const errText = await speechifyResponse.text();
              console.error(`Speechify error for ${msg.agentName}:`, errText);
              continue; // Skip this segment but continue with others
            }

            const result = await speechifyResponse.json() as any;

            audioSegments.push({
              agentName: msg.agentName,
              agentNumber: msg.agentNumber,
              round: msg.round,
              audioBase64: result.audio_data, // Speechify returns base64 audio_data
            });

          } catch (ttsError) {
            console.error(`TTS error for ${msg.agentName}:`, ttsError);
            continue;
          }
        }

        if (audioSegments.length === 0) {
          await refundCredits();
          return res.status(500).json({ error: "Failed to generate any audio segments." });
        }

        res.json({ segments: audioSegments });
      } catch (processError) {
        await refundCredits();
        throw processError;
      }
    } catch (error) {
      console.error("TTS generation error:", error);
      res.status(500).json({
        error: "Failed to generate speech",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
