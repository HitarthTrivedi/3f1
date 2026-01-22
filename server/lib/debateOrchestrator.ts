import { callProvider } from "./providers/index.js";
// fix
import type { AgentConfig, DebateMessage } from "../../shared/schema.js";
import { randomUUID } from "crypto";

const TOTAL_ROUNDS = 5;
const MAX_CONTEXT_MESSAGES = 20;

const AGENT_PERSONALITIES = {
  analyst: {
    role: "The Analyst",
    traits: "Analytical, Structured, Objective, Inquisitive",
    style: "Formal, logical, and concise. Focuses on definitions and data.",
    systemPrompt: `You are Agent 1: The Analyst. Your role is to break the topic into fundamental components, define the problem, identify assumptions, and present a structured, analytical foundation.
    Behaviors:
    - ALWAYS use a bulleted list for your main points.
    - Keep responses concise (maximum 5-7 bullet points).
    - Start by crisply defining the topic.
    - Decompose the issue into logical parts.
    - Identify missing information and hidden assumptions.
    - Provide factual, neutral, evidence-based analysis.
    - Ask a clarifying question to improve debate quality.
    - Avoid emotional language or vague statements.
  `
  },
  critic: {
    role: "The Critic",
    traits: "Skeptical, Critical, Direct, Challenging",
    style: "Sharp, questioning, and provocative. Focuses on flaws and contradictions.",
    systemPrompt: `You are Agent 2: The Critic. Your job is to challenge, question, and stress-test the ideas introduced by other agents.
    Behaviors:
    - ALWAYS use a bulleted list for your main points.
    - Keep responses concise (maximum 5-7 bullet points).
    - Identify weaknesses, risks, contradictions, or flawed assumptions.
    - Introduce alternative viewpoints.
    - Strengthen the debate by pushing deeper inquiry.
    - Maintain intellectual humility—attack ideas, not agents.
    - Use counter-examples, edge cases, and contrasting frameworks.
    - Do NOT merely disagree—provide reasoning and constructive alternatives.
`
  },
  synthesizer: {
    role: "The Synthesizer",
    traits: "Integrative, Diplomatic, Holistic, Solution-oriented",
    style: "Balanced, constructive, and forward-looking. Focuses on harmony and resolution.",
    systemPrompt: `You are Agent 3: The Synthesizer. Your role is to integrate perspectives from Agent 1 and Agent 2 into coherent insights or actionable conclusions.
    Behaviors:
    - ALWAYS use a bulleted list for your main points.
    - Keep responses concise (maximum 5-7 bullet points).
    - Combine the strongest arguments from all sides.
    - Resolve contradictions where possible.
    - Highlight tradeoffs and balanced conclusions.
    - Suggest frameworks, solutions, or synthesized insights.
    - Identify what the debate has revealed that is new.
    - Avoid re-stating points; focus on building higher-level understanding.
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
- PROVIDE YOUR ARGUMENTS IN BULLETED POINTS (point-wise structure)
- Keep it concise (max 7 points)
- Reference previous arguments when relevant
- Be respectful but assertive in your position
- Build upon or challenge previous points made

Remember: You are ${personality.role}. ${personality.style}. Always use bullet points. Do NOT prefix points with 'Re:' or 'Regarding:'. Use natural conversational headings or bold text for emphasis instead.`;
}

function createUserPrompt(
  history: DebateMessage[],
  round: number,
  agentName: string
): string {
  if (history.length === 0) {
    return `Begin the debate with your opening statement. Present your initial perspective on the topic in a bulleted point list (maximum 7 points).`;
  }

  const recentHistory = history.slice(-MAX_CONTEXT_MESSAGES);
  const historyText = recentHistory
    .map((msg) => `${msg.agentName}: ${msg.message}`)
    .join("\n\n");

  return `Previous arguments:\n${historyText}\n\nNow it's your turn, ${agentName}. Respond to the previous arguments using bulleted points. Build on strong points or challenge weak ones. Keep it concise.`;
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
