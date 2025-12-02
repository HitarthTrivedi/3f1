import { callProvider } from "./providers/index";
import type { AgentConfig, DebateMessage } from "@shared/schema";
import { randomUUID } from "crypto";

const TOTAL_ROUNDS = 5;
const MAX_CONTEXT_MESSAGES = 20;

function createSystemPrompt(agentName: string, agentConfig: AgentConfig, topic: string, round: number): string {
  const isLastRound = round === TOTAL_ROUNDS;
  
  return `You are ${agentName} (${agentConfig.provider}, model ${agentConfig.model}). You will take part in a debate about the topic: "${topic}". 

Each time you speak you must:
1. Read the conversation so far and explicitly reference at least one other agent's prior statement (quote a short fragment) and either (a) rebut it, or (b) expand on it with a new perspective.
2. Keep replies concise (3–6 paragraphs max), analytical, and evidence-based where appropriate.
3. Try to surface at least one unique perspective not yet raised.
${isLastRound ? '4. Since this is the final round (round 5), provide a short closing summary and a clear "Oppose" position to the motion (2–4 sentences).' : ''}

Tone: analytical, professional, and civil.`;
}

function trimConversationHistory(
  history: Array<{ role: string; content: string }>
): Array<{ role: string; content: string }> {
  if (history.length <= MAX_CONTEXT_MESSAGES) {
    return history;
  }

  return history.slice(-MAX_CONTEXT_MESSAGES);
}

export async function runDebate(
  topic: string,
  agents: AgentConfig[],
  onMessage: (message: DebateMessage) => void
): Promise<DebateMessage[]> {
  const messages: DebateMessage[] = [];
  const conversationHistory: Array<{ role: string; content: string }> = [];

  for (let round = 1; round <= TOTAL_ROUNDS; round++) {
    for (let agentIndex = 0; agentIndex < agents.length; agentIndex++) {
      const agent = agents[agentIndex];
      const agentName = `Agent ${agentIndex + 1}`;
      const systemPrompt = createSystemPrompt(agentName, agent, topic, round);

      const agentHistory: Array<{ role: string; content: string }> = [];
      
      for (let i = 0; i < conversationHistory.length; i++) {
        const historyRole = i % 2 === 0 ? "user" : "assistant";
        agentHistory.push({
          role: historyRole,
          content: conversationHistory[i].content,
        });
      }

      const trimmedHistory = trimConversationHistory(agentHistory);

      const response = await callProvider(agent, systemPrompt, trimmedHistory);

      const message: DebateMessage = {
        id: randomUUID(),
        agentName,
        agentNumber: agentIndex + 1,
        round,
        message: response,
        timestamp: new Date().toISOString(),
      };

      messages.push(message);
      conversationHistory.push({
        role: "message",
        content: `${agentName}: ${response}`,
      });

      onMessage(message);
    }
  }

  return messages;
}
