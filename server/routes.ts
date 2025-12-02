import type { Express } from "express";
import { createServer, type Server } from "http";
import { debateConfigSchema } from "@shared/schema";
import { runDebate } from "./lib/debateOrchestrator";
import type { DebateMessage } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/debate/start", async (req, res) => {
    try {
      const validatedConfig = debateConfigSchema.parse(req.body);

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
