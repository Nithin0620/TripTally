interface ReceiptOcrResponse {
  merchant?: string;
  amount?: number | string | null;
  date?: string | null;
  raw_text?: string;
  text?: string;
}

export interface ReceiptOcrResult {
  text: string;
  merchant?: string;
  amount?: number;
  date?: string;
}

function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
}

export async function extractReceiptData(
  fileBuffer: Buffer,
  mimeType: string
): Promise<ReceiptOcrResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !mimeType.startsWith("image/")) {
    return { text: "" };
  }

  const model = process.env.GROQ_OCR_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
  const dataUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 600,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract receipt details. Respond with JSON only: {\"merchant\": string, \"amount\": number, \"date\": string, \"raw_text\": string}.",
              },
              { type: "image_url", image_url: { url: dataUrl } },
            ],
          },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`[Receipt OCR] API returned ${response.status}`);
      return { text: "" };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return { text: "" };
    }

    const parsed = JSON.parse(extractJsonObject(content)) as ReceiptOcrResponse;
    const parsedAmount = Number(parsed.amount);
    const amount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : undefined;
    const rawText = typeof parsed.raw_text === "string" ? parsed.raw_text : parsed.text || "";
    const lines = [
      parsed.merchant ? `Merchant: ${parsed.merchant}` : "",
      parsed.date ? `Date: ${parsed.date}` : "",
      amount ? `Amount: ${amount.toFixed(2)}` : "",
      rawText,
    ]
      .map(line => line.trim())
      .filter(Boolean);

    return {
      text: lines.join("\n"),
      merchant: parsed.merchant,
      amount,
      date: parsed.date ?? undefined,
    };
  } catch (error) {
    console.warn("[Receipt OCR] Extraction failed:", error);
    return { text: "" };
  }
}
