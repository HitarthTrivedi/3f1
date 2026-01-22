import OpenAI from "openai";

export async function callOpenAI(
  apiKey: string,
  model: string,
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
  const openai = new OpenAI({ apiKey });

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
  ];

  const response = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.8,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "No response generated.";
}
