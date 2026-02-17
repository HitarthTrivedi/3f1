import { GoogleGenerativeAI } from "@google/generative-ai";

export async function callGemini(
  apiKey: string,
  model: string,
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
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

  // Basic retry logic for 429
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const result = await chat.sendMessage("Continue the debate based on the conversation history.");
      const response = await result.response;
      return response.text();
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
