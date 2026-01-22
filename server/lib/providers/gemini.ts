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

  const result = await chat.sendMessage("Continue the debate based on the conversation history.");
  const response = await result.response;
  return response.text();
}
