import { callOpenAI } from "./openai.js";
import { callGemini } from "./gemini.js";
import { callPerplexity } from "./perplexity.js";
import { callCustomAPI } from "./custom.js";
import type { AgentConfig } from "@shared/schema.js";

export async function callProvider(
  agent: AgentConfig,
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    switch (agent.provider) {
      case "openai":
        return await callOpenAI(agent.apiKey, agent.model, systemPrompt, conversationHistory);
      
      case "gemini":
        return await callGemini(agent.apiKey, agent.model, systemPrompt, conversationHistory);
      
      case "perplexity":
        return await callPerplexity(agent.apiKey, agent.model, systemPrompt, conversationHistory);
      
      case "custom":
        if (!agent.customEndpoint) {
          throw new Error("Custom endpoint is required for custom provider");
        }
        return await callCustomAPI(agent.apiKey, agent.customEndpoint, systemPrompt, conversationHistory);
      
      default:
        throw new Error(`Unsupported provider: ${agent.provider}`);
    }
  } catch (error) {
    console.error(`Error calling ${agent.provider}:`, error);
    throw error;
  }
}
