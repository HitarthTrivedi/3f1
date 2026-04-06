import { callProvider } from "./providers/index.js";
import type { AgentConfig, DebateMessage } from "../../shared/schema.js";
import { randomUUID } from "crypto";

const TOTAL_ROUNDS = 5;
const MAX_CONTEXT_MESSAGES = 12;

// Minimal one-line system prompts — no bullet points, no structure for the model to echo
const AGENT_SYSTEM_PROMPTS: Record<number, string> = {
  0: "You are The Analyst in a debate. Provide precise, structured, evidence-based arguments breaking topics into logical components.",
  1: "You are The Critic in a debate. Challenge assumptions, expose contradictions, introduce counter-arguments and edge cases.",
  2: "You are The Synthesizer in a debate. Integrate perspectives, resolve conflicts, and build toward balanced higher-level insight.",
};

const ROUND_LABELS: Record<number, string> = {
  1: "Opening Statement",
  2: "Rebuttal",
  3: "Deep Analysis",
  4: "Counter-Arguments",
  5: "Closing Statement",
};

function getSystemPrompt(agentIndex: number): string {
  return AGENT_SYSTEM_PROMPTS[agentIndex % 3];
}

function createUserPrompt(
  topic: string,
  round: number,
  history: DebateMessage[],
  agentName: string
): string {
  const roundLabel = ROUND_LABELS[round] || `Round ${round}`;
  let prompt = "";

  if (history.length > 0) {
    const recent = history.slice(-MAX_CONTEXT_MESSAGES);
    for (const msg of recent) {
      prompt += `${msg.agentName}: ${msg.message}\n\n`;
    }
    prompt += `---\n`;
  }

  prompt += `Debate Topic: "${topic}"\n`;
  prompt += `Current Round: ${roundLabel} (Round ${round}/${TOTAL_ROUNDS})\n\n`;
  prompt += `Role: You are ${agentName}.\n\n`;
  
  prompt += `INSTRUCTIONS:\n`;
  prompt += `1. Perform any internal reasoning, planning, or format checks.\n`;
  prompt += `2. Write your FINAL debate response inside these exact tags: @@@ANSWER_START@@@ ... @@@ANSWER_END@@@\n`;
  prompt += `3. The response inside the tags MUST start with a bold title (**Title**) followed by 5-7 bullet points.\n\n`;
  
  prompt += `Example output structure:\n`;
  prompt += `My internal thoughts about the topic...\n`;
  prompt += `@@@ANSWER_START@@@\n`;
  prompt += `**[Your Title Here]**\n`;
  prompt += `- **[Point 1 Keyword]:** Explanation...\n`;
  prompt += `- **[Point 2 Keyword]:** Explanation...\n`;
  prompt += `@@@ANSWER_END@@@\n`;

  return prompt;
}

/**
 * Split the AI response into 'thinking' and 'content' based on the @@@ANSWER_START@@@ tag.
 */
function splitThinkingAndContent(raw: string): { content: string; thinking?: string } {
  const startTag = "@@@ANSWER_START@@@";
  const endTag = "@@@ANSWER_END@@@";
  
  if (raw.includes(startTag)) {
    const parts = raw.split(startTag);
    const thinking = parts[0].trim();
    let content = parts[1].split(endTag)[0].trim();
    
    return { content, thinking: thinking || undefined };
  }

  // Fallback to line detection if tags are missing (should not happen with good prompts)
  const lines = raw.split("\n");
  const CONTENT_START = [
    /^\*\*[^*]/, 
    /^#+\s+\S/,  
    /^[-•]\s+\*\*/, 
  ];

  let contentStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;
    if (CONTENT_START.some((p) => p.test(trimmed))) {
      contentStart = i;
      break;
    }
  }

  if (contentStart > 0) {
    const thinkingLines = lines.slice(0, contentStart).filter((l) => l.trim());
    const content = lines.slice(contentStart).join("\n").trim();
    const thinking = thinkingLines.join("\n").trim();
    return { content, thinking: thinking || undefined };
  }

  return { content: raw.trim() };
}

/**
 * Clean leftover echo artifacts from the content portion only.
 */
function cleanContent(raw: string): string {
  let text = raw;
  // Strip tags if they remained
  text = text.replace(/@@@ANSWER_START@@@/g, "");
  text = text.replace(/@@@ANSWER_END@@@/g, "");
  
  // Strip any leftover preamble lines that slipped through
  const preamblePatterns = [
    /^(Role|Task|Round|Format|Constraints|Topic|Components|Assumptions|Goal|Output|Summary|Analysis|Context|Note):[^\n]*/gim,
    /^Now respond as .*$/gim,
    /^Format your response.*$/gim,
    /^Start directly with.*$/gim,
    /^---+\s*$/gim,
    /^Re:\s*/gim,
    /^Regarding:\s*/gim,
    /^\*?\s*(Formal|Logical|Concise|Bulleted|No "Re:")\??\s*(Yes|No)\.?\s*$/gim,
  ];

  for (const pattern of preamblePatterns) {
    text = text.replace(pattern, "");
  }

  // Collapse 3+ blank lines into 2
  text = text.replace(/\n{3,}/g, "\n\n");
  
  return text.trim();
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runDebate(
  topic: string,
  agents: AgentConfig[],
  onMessage: (message: DebateMessage) => void
): Promise<DebateMessage[]> {
  const history: DebateMessage[] = [];

  for (let round = 1; round <= TOTAL_ROUNDS; round++) {
    for (let i = 0; i < agents.length; i++) {
      if (round > 1 || i > 0) {
        await sleep(5000);
      }

      const agent = agents[i];
      const systemPrompt = getSystemPrompt(i);
      const userPrompt = createUserPrompt(topic, round, history, agent.name);

      try {
        const { content: rawContent, thinking: apiThinking } = await callProvider(
          agent,
          systemPrompt,
          userPrompt,
          []
        );

        // Decisive splitting based on tags
        const { content: splitContent, thinking: textThinking } = splitThinkingAndContent(rawContent);
        const content = cleanContent(splitContent);

        // Prefer API-level thinking (Gemini thought parts) over text-extracted thinking
        const thinking = apiThinking || textThinking;

        const message: DebateMessage = {
          id: randomUUID(),
          agentName: agent.name,
          agentNumber: i,
          message: content,
          thinking: thinking ? thinking.trim() : undefined,
          timestamp: new Date().toISOString(),
          round,
        };

        history.push(message);
        onMessage(message);
      } catch (error) {
        console.error(`Error with agent ${agent.name}:`, error);
        throw error;
      }
    }
  }

  return history;
}
