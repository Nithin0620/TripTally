type GroqChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function extractJsonObject(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export async function getOpenAIJson<T>(
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 1200
): Promise<T | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('[Groq] API key not configured');
    return null;
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Groq] API error (${response.status}):`, errorText);
      return null;
    }

    const data = (await response.json()) as GroqChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error('[Groq] No content in response:', data);
      return null;
    }

    try {
      const jsonText = extractJsonObject(content);
      return JSON.parse(jsonText) as T;
    } catch (parseError) {
      console.error('[Groq] Failed to parse JSON:', parseError, 'Content:', content);
      return null;
    }
  } catch (error) {
    console.error('[Groq] Fetch error:', error);
    return null;
  }
}
