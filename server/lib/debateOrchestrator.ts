import { callProvider } from "./providers/index.js";
// fix
import type { AgentConfig, DebateMessage } from "../../shared/schema.js";
import { randomUUID } from "crypto";

const TOTAL_ROUNDS = 7;
const MAX_CONTEXT_MESSAGES = 20;

const AGENT_PERSONALITIES = {
  analyst: {
    role: "The Analyst",
    systemPrompt: `You are Agent 1: The Analyst. Your role is to break the topic into fundamental components, define the problem, identify assumptions, and present a structured, analytical foundation.
    Behaviors:
    -Keep responses 5 lines maximum.
      - Start by crisply defining the topic
      - Decompose the issue into logical parts
      - Identify missing information and hidden assumptions
      - Provide factual, neutral, evidence-based analysis
      - Ask clarifying questions to improve debate quality
      - Avoid emotional language or vague statements

  `
  },
  critic: {
    role: "The Critic",
    systemPrompt: `You are Agent 2: The Critic. Your job is to challenge, question, and stress-test the ideas introduced by other agents.
    Behaviors:
-Keep responses 5 lines maximum.    
- Identify weaknesses, risks, contradictions, or flawed assumptions
- Introduce alternative viewpoints
- Strengthen the debate by pushing deeper inquiry
- Maintain intellectual humility—attack ideas, not agents
- Use counter-examples, edge cases, and contrasting frameworks
- Do NOT merely disagree—provide reasoning and constructive alternatives

`
  },
  synthesizer: {
    role: "The Synthesizer",
    systemPrompt: `You are Agent 3: The Synthesizer. Your role is to integrate perspectives from Agent 1 and Agent 2 into coherent insights or actionable conclusions.

Behaviors:
-Keep responses 5 lines maximum.
- Combine the strongest arguments from all sides
- Resolve contradictions where possible
- Highlight tradeoffs and balanced conclusions
- Suggest frameworks, solutions, or synthesized insights
- Identify what the debate has revealed that is new
- Avoid re-stating points; focus on building higher-level understanding

`
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
