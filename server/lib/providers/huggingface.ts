
export async function callHuggingFace(
    apiKey: string,
    model: string,
    systemPrompt: string,
    conversationHistory: Array<{ role: string; content: string }>
): Promise<string> {
    const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map((msg) => ({
            role: msg.role,
            content: msg.content,
        })),
    ];

    try {
        // User requested format:
        // URL: https://router.huggingface.co/v1/chat/completions
        // Body: { model: "...", messages: [...] }

        const response = await fetch(
            "https://router.huggingface.co/v1/chat/completions",
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    model: model,
                    messages: messages,
                    max_tokens: 1000,
                    temperature: 0.8,
                    stream: false
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Hugging Face API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        return result.choices[0]?.message?.content || "No response generated.";

    } catch (error) {
        console.error("Error calling Hugging Face:", error);
        throw error;
    }
}
