import { callOpenAI } from "./openai.js";
import { callGemini } from "./gemini.js";
import { callPerplexity } from "./perplexity.js";
import { callGrok } from "./grok.js";
import { callCustomAPI } from "./custom.js";
import type { AgentConfig } from "@shared/schema.js";

export interface ProviderResult {
  content: string;
  thinking?: string;
}

export async function callProvider(
  agent: AgentConfig,
  systemPrompt: string,
  userPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<ProviderResult> {
  try {
    switch (agent.provider) {
      case "openai": {
        const content = await callOpenAI(agent.apiKey, agent.model, systemPrompt, userPrompt, conversationHistory);
        return { content };
      }

      case "gemini": {
        // Gemini returns thinking separately
        return await callGemini(agent.apiKey, agent.model, systemPrompt, userPrompt, conversationHistory);
      }

      case "perplexity": {
        const content = await callPerplexity(agent.apiKey, agent.model, systemPrompt, userPrompt, conversationHistory);
        return { content };
      }

      case "grok": {
        const content = await callGrok(agent.apiKey, agent.model, systemPrompt, userPrompt, conversationHistory);
        return { content };
      }

      case "custom": {
        if (!agent.customEndpoint) {
          throw new Error("Custom endpoint is required for custom provider");
        }
        const content = await callCustomAPI(agent.apiKey, agent.customEndpoint, systemPrompt, userPrompt, conversationHistory);
        return { content };
      }

      default:
        throw new Error(`Unsupported provider: ${agent.provider}`);
    }
  } catch (error) {
    console.error(`Error calling ${agent.provider}:`, error);
    throw error;
  }
}
