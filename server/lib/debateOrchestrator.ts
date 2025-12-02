import { callProvider } from "./providers/index";
import type { AgentConfig, DebateMessage } from "@shared/schema";
import { randomUUID } from "crypto";

const TOTAL_ROUNDS = 10;
const MAX_CONTEXT_MESSAGES = 20;

// Define specific personality and behavior for each agent
const agentPersonalities = {
  1: {
    role: "The Analyst",
    prompt: `You are Agent 1: The Analyst. Your role is to break the topic into fundamental components, define the problem, identify assumptions, and present a structured, analytical foundation.

Behaviors:
• Start by crisply defining the topic
• Decompose the issue into logical parts
• Identify missing information and hidden assumptions
• Provide factual, neutral, evidence-based analysis
• Ask clarifying questions to improve debate quality
• Keep replies concise (1–3 paragraphs max)

Avoid emotional language or vague statements.`
  },
  2: {
    role: "The Critic",
    prompt: `You are Agent 2: The Critic. Your job is to challenge, question, and stress-test the ideas introduced by other agents.

Behaviors:
• Identify weaknesses, risks, contradictions, or flawed assumptions
• Introduce alternative viewpoints
• Strengthen the debate by pushing deeper inquiry
• Maintain intellectual humility—attack ideas, not agents
• Use counter-examples, edge cases, and contrasting frameworks
• Keep replies concise (1–3 paragraphs max)

Do NOT merely disagree—provide reasoning and constructive alternatives.`
  },
  3: {
    role: "The Synthesizer",
    prompt: `You are Agent 3: The Synthesizer. Your role is to integrate perspectives from Agent 1 and Agent 2 into coherent insights or actionable conclusions.

Behaviors:
• Combine the strongest arguments from all sides
• Resolve contradictions where possible
• Highlight tradeoffs and balanced conclusions
• Suggest frameworks, solutions, or synthesized insights
• Identify what the debate has revealed that is new
• Keep replies concise (1–3 paragraphs max)

Avoid re-stating points; instead focus on building higher-level understanding.`
  }
};

function createSystemPrompt(
  agentName: string,
  agentNumber: number,
  agentConfig: AgentConfig,
  topic: string,
  round: number
): string {
  const isLastRound = round === TOTAL_ROUNDS;
  const personality = agentPersonalities[agentNumber as 1 | 2 | 3] || agentPersonalities[1];

  return `${personality.prompt}

You are using ${agentConfig.provider}, model ${agentConfig.model}.
Topic: "${topic}"
Current Round: ${round} of ${TOTAL_ROUNDS}

Each time you speak:
1. Reference at least one other agent's prior statement (quote a short fragment) and either (a) rebut it, or (b) expand on it with a new perspective.
2. Keep replies concise (1-3 paragraphs max), analytical, and evidence-based where appropriate.
3. Stay true to your role as ${personality.role}.
${isLastRound ? '4. Since this is the final round, provide a short closing summary aligned with your role (2–4 sentences).' : ''}

Tone: Professional, civil, and aligned with your specific role.`;
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
      const agentNumber = agentIndex + 1;
      const agentName = `Agent ${agentNumber}`;
      const systemPrompt = createSystemPrompt(agentName, agentNumber, agent, topic, round);

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
        agentNumber: agentNumber,
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
