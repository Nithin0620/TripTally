/**
 * Groq API Integration for Place Data Generation
 * Generates structured travel guide content with attractions, hotels, and restaurants
 */

import { Place, Hotel, Restaurant } from "@/types";

interface PlaceGenerationResult {
  introduction: string;
  history: string;
  culture: string;
  top_attractions: Array<{
    name: string;
    description: string;
    image_placeholder: string;
  }>;
  best_time_to_visit: string;
  estimated_budget: string;
  ideal_trip_duration: string;
  hotels: Array<{
    name: string;
    description: string;
    price_range: string;
  }>;
  restaurants: Array<{
    name: string;
    description: string;
    cuisine: string;
  }>;
}

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

  const fencedMatch =
    trimmed.match(/```json\s*([\s\S]*?)```/i) ||
    trimmed.match(/```\s*([\s\S]*?)```/i);
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

/**
 * Generate structured place data using Groq API
 * Returns travel guide information with attractions, hotels, and restaurants
 */
export async function generatePlaceContent(
  placeName: string
): Promise<PlaceGenerationResult | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[Groq] API key not configured");
    return null;
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const systemPrompt = `You are a premium travel guide expert specializing in Indian destinations. 
Generate detailed, accurate, and inspiring travel guide content for Indian places.
Always return valid JSON with the specified structure.
Be specific, informative, and write in an engaging travel magazine style.
Focus on accurate information that travelers would find useful for planning their trips.`;

  const userPrompt = `Generate a comprehensive travel guide for ${placeName} in India.

Return a JSON object with this exact structure:
{
  "introduction": "A compelling 200-300 word introduction about ${placeName} that captures its essence and appeal",
  "history": "Historical background and significance (100-150 words)",
  "culture": "Local culture, traditions, and customs (100-150 words)",
  "top_attractions": [
    {
      "name": "Attraction name",
      "description": "50-75 word description of what makes this place special",
      "image_placeholder": "Search query for images (e.g., 'Gateway of India monument')"
    }
  ] (Provide exactly 5 attractions),
  "best_time_to_visit": "Specific months and why (include weather and crowds)",
  "estimated_budget": "Daily budget range per person (e.g., ₹2,000 - ₹5,000)",
  "ideal_trip_duration": "Recommended number of days (e.g., 3-5 days)",
  "hotels": [
    {
      "name": "Hotel name",
      "description": "Brief description of amenities and style",
      "price_range": "Price range (e.g., ₹5,000 - ₹10,000 per night)"
    }
  ] (Provide exactly 3 hotels across different price ranges),
  "restaurants": [
    {
      "name": "Restaurant name",
      "description": "What they offer and specialty",
      "cuisine": "Cuisine type"
    }
  ] (Provide exactly 3 restaurants)
}

Ensure all information is accurate and helpful for travel planning.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 2000,
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
      console.error("[Groq] No content in response:", data);
      return null;
    }

    try {
      const jsonText = extractJsonObject(content);
      const parsed = JSON.parse(jsonText) as PlaceGenerationResult;
      return parsed;
    } catch (parseError) {
      console.error("[Groq] Failed to parse JSON:", parseError);
      console.error("[Groq] Raw content:", content);
      return null;
    }
  } catch (error) {
    console.error("[Groq] Fetch error:", error);
    return null;
  }
}

/**
 * Determine category based on place characteristics
 */
export function determineCategory(
  placeName: string,
  introduction: string
): Place["category"] {
  const text = `${placeName} ${introduction}`.toLowerCase();

  if (
    text.includes("beach") ||
    text.includes("coastal") ||
    text.includes("sea")
  ) {
    return "Beaches";
  } else if (
    text.includes("mountain") ||
    text.includes("hill") ||
    text.includes("trek")
  ) {
    return "Mountains";
  } else if (
    text.includes("temple") ||
    text.includes("spiritual") ||
    text.includes("sacred")
  ) {
    return "Spiritual";
  } else if (text.includes("luxury") || text.includes("heritage")) {
    return "Luxury";
  } else {
    return "Cities";
  }
}
