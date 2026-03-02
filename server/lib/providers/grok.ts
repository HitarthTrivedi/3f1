import OpenAI from "openai";

export async function callGrok(
    apiKey: string,
    model: string,
    systemPrompt: string,
    conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
    const grok = new OpenAI({
        apiKey,
        baseURL: "https://api.x.ai/v1"
    });

    const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory.map(msg => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
        })),
    ];

    // Basic retry logic for 429 (similar to Gemini but simplified for now)
    let lastError: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const response = await grok.chat.completions.create({
                model,
                messages,
                temperature: 0.8,
                max_tokens: 1000,
            });

            return response.choices[0]?.message?.content || "No response generated.";
        } catch (error: any) {
            lastError = error;
            if (error?.status === 429) {
                const backoff = Math.pow(2, attempt) * 2000;
                console.warn(`Grok rate limit hit, retrying in ${backoff}ms...`);
                await new Promise(resolve => setTimeout(resolve, backoff));
                continue;
            }
            throw error;
        }
    }

    throw lastError || new Error("Failed to get response from Grok after 3 retries");
}
