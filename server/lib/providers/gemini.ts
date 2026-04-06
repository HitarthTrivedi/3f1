import { GoogleGenerativeAI } from "@google/generative-ai";

export interface GeminiResult {
  content: string;
  thinking?: string;
}

export async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<GeminiResult> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const chat = geminiModel.startChat({
    history: conversationHistory.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
  });

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const result = await chat.sendMessage(userPrompt);
      const response = await result.response;

      // Extract thinking vs content parts separately
      // Gemini thinking models return parts with { thought: true } for reasoning
      let thinkingText = "";
      let contentText = "";

      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts as any[]) {
          if (part.thought === true && part.text) {
            thinkingText += part.text;
          } else if (part.text) {
            contentText += part.text;
          }
        }
      }

      // Fallback: if no parts breakdown, use response.text()
      if (!contentText) {
        contentText = response.text();
      }

      return {
        content: contentText,
        thinking: thinkingText || undefined,
      };
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || "";
      const isRateLimit = errorMessage.includes("429") ||
        errorMessage.includes("Too Many Requests") ||
        errorMessage.includes("Resource exhausted") ||
        error?.status === 429;

      if (isRateLimit) {
        const backoff = Math.pow(2, attempt) * 3000;
        console.warn(`Gemini rate limit hit, retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error("Failed to get response from Gemini after 5 retries");
}
