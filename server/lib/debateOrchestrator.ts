import { callProvider } from "./providers/index.js";
import type { AgentConfig, DebateMessage } from "../../shared/schema.js";
import { randomUUID } from "crypto";

const TOTAL_ROUNDS = 10;
const MAX_CONTEXT_MESSAGES = 20;

const AGENT_PERSONALITIES = {
  analyst: {
    role: "The Analyst",
    traits: "data-driven, methodical, focuses on facts and evidence",
    style: "presents clear arguments with supporting data"
  },
  critic: {
    role: "The Critic",
    traits: "skeptical, questioning, identifies flaws and weaknesses",
    style: "challenges assumptions and points out logical inconsistencies"
  },
  synthesizer: {
    role: "The Synthesizer",
    traits: "integrative, balanced, seeks common ground",
    style: "finds connections and proposes unified perspectives"
  }
};

function getAgentPersonality(agentNumber: number) {
  const personalities = Object.values(AGENT_PERSONALITIES);
  return personalities[agentNumber % personalities.length];
}

function createSystemPrompt(
  agentName: string,
  agentNumber: number,
  agentConfig: AgentConfig,
  topic: string,
  round: number
): string {
  const personality = getAgentPersonality(agentNumber);
  
  return `You are ${agentName}, ${personality.role} in this debate.

Your personality traits: ${personality.traits}
Your communication style: ${personality.style}

Topic: "${topic}"
Round: ${round} of ${TOTAL_ROUNDS}

Your task:
- Stay true to your personality and role
- Provide substantive arguments (1-3 paragraphs)
- Reference previous arguments when relevant
- Be respectful but assertive in your position
- Build upon or challenge previous points made

Remember: You are ${personality.role}. ${personality.style}.`;
}

function createUserPrompt(
  history: DebateMessage[],
  round: number,
  agentName: string
): string {
  if (history.length === 0) {
    return `Begin the debate with your opening statement. Present your initial perspective on the topic in 1-3 paragraphs.`;
  }

  const recentHistory = history.slice(-MAX_CONTEXT_MESSAGES);
  const historyText = recentHistory
    .map((msg) => `${msg.agentName}: ${msg.message}`)
    .join("\n\n");

  return `Previous arguments:\n${historyText}\n\nNow it's your turn, ${agentName}. Respond to the previous arguments in 1-3 paragraphs. Build on strong points or challenge weak ones.`;
}

export async function runDebate(
  topic: string,
  agents: AgentConfig[],
  onMessage: (message: DebateMessage) => void
): Promise<DebateMessage[]> {
  const history: DebateMessage[] = [];

  for (let round = 1; round <= TOTAL_ROUNDS; round++) {
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const systemPrompt = createSystemPrompt(agent.name, i, agent, topic, round);
      const userPrompt = createUserPrompt(history, round, agent.name);

      try {
        const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
  
        const content = await callProvider(
        agent,
        combinedPrompt,
        []  
      );

      const message: DebateMessage = {
        id: randomUUID(),
        agentName: agent.name,
        agentNumber: i,
        message: content,
        timestamp: new Date().toISOString(),
        round,
      };

      history.push(message);
      onMessage(message);
    } catch (error) {
      console.error(`Error with agent ${agent.name}:`, error);
      const errorMessage: DebateMessage = {
        id: randomUUID(),
        agentName: agent.name,
        agentNumber: i,
        message: `Error generating response: ${error instanceof Error ? error.message : "Unknown error"}`,
        timestamp: new Date().toISOString(),
        round,
      };
      history.push(errorMessage);
      onMessage(errorMessage);
    }
    }
  }

  return history;
}
