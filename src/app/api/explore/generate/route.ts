import { NextRequest, NextResponse } from 'next/server';
import { Place } from '@/types';

interface GenerateRequestBody {
  category: string;
}

interface GeneratedPlace {
  name: string;
  state: string;
  description: string;
  best_time_to_visit: string;
  avg_budget: string;
  travel_duration: string;
}

/**
 * POST /api/explore/generate
 * 
 * Generate AI-powered travel destinations for a given category
 * 
 * Request body:
 * {
 *   category: "Beaches" | "Mountains" | "Cities" | "Spiritual" | "Luxury"
 * }
 * 
 * Response:
 * {
 *   places: Place[],
 *   success: boolean,
 *   error?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequestBody;
    const { category } = body;

    // Validate category
    const validCategories = ['Beaches', 'Mountains', 'Cities', 'Spiritual', 'Luxury'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        {
          places: [],
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Create prompt for Groq
    const prompt = `Generate 5 unique travel destinations in India under the "${category}" category. For each destination, provide the following information in valid JSON format:

{
  "places": [
    {
      "name": "destination name",
      "state": "Indian state name",
      "description": "200-250 word detailed description of the destination, highlighting its unique features, attractions, and what makes it special",
      "best_time_to_visit": "best months to visit, e.g., 'November to February'",
      "avg_budget": "estimated daily budget, e.g., '₹1,500 - ₹3,000 per day'",
      "travel_duration": "recommended trip duration, e.g., '3-4 days'"
    }
  ]
}

Requirements:
- Each description must be 200-250 words minimum
- Be specific and detailed
- Use realistic budget estimates
- Ensure variety in the destinations (different states, different attractions)
- Make descriptions engaging and inspiring
- Category: ${category}`;

    // Call Groq API
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are a travel expert generating destination recommendations for India. Always respond with valid JSON only, no additional text.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${errorText}`);
    }

    const data = await response.json();

    // Extract JSON from response
    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from Groq');
    }

    let parsedResponse: { places: GeneratedPlace[] };
    try {
      // Try to parse JSON directly
      parsedResponse = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1]);
      } else {
        // Try to find JSON object in the content
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          parsedResponse = JSON.parse(objectMatch[0]);
        } else {
          throw new Error('Could not extract JSON from Groq response');
        }
      }
    }

    // Transform to Place objects with default image URLs
    const places: Place[] = parsedResponse.places.map((place, idx) => ({
      id: `ai-${Date.now()}-${idx}`,
      name: place.name,
      category: category as 'Beaches' | 'Mountains' | 'Cities' | 'Spiritual' | 'Luxury',
      state: place.state,
      description: place.description,
      best_time_to_visit: place.best_time_to_visit,
      avg_budget: place.avg_budget,
      travel_duration: place.travel_duration,
      hero_image: `https://images.unsplash.com/photo-${1506905925346}-21bda4d32df4}?w=1200&q=80`, // Placeholder
      gallery_images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=600&q=80',
        'https://images.unsplash.com/photo-1502632928485-d3a5aefccf4f?w=600&q=80',
      ],
      hotels: [
        {
          name: `Luxury Resort in ${place.name}`,
          image: 'https://images.unsplash.com/photo-1571508601155-1e6dff1e5744?w=400&q=80',
          description: 'Premium 5-star hotel with world-class amenities and service',
          price_range: '₹10,000 - ₹25,000 per night',
        },
        {
          name: `Boutique Hotel in ${place.name}`,
          image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80',
          description: 'Contemporary boutique property with personalized service',
          price_range: '₹5,000 - ₹12,000 per night',
        },
        {
          name: `Heritage Guesthouse in ${place.name}`,
          image: 'https://images.unsplash.com/photo-1507238691854-56c1cbbb4b39?w=400&q=80',
          description: 'Charming property preserving local architecture and culture',
          price_range: '₹2,000 - ₹5,000 per night',
        },
      ],
      restaurants: [
        {
          name: `Traditional ${place.name} Cuisine`,
          image: 'https://images.unsplash.com/photo-1498855926480-d98e83099315?w=400&q=80',
          description: 'Authentic local restaurant serving traditional regional dishes',
          cuisine: 'Regional Indian',
        },
        {
          name: `Modern ${place.name} Bistro`,
          image: 'https://images.unsplash.com/photo-1504674900150-2b5e1c6b0c0e?w=400&q=80',
          description: 'Contemporary dining with fusion of traditional and international flavors',
          cuisine: 'Fusion & Modern',
        },
        {
          name: `Rooftop Dining Experience`,
          image: 'https://images.unsplash.com/photo-1550632066-e89685900b29?w=400&q=80',
          description: 'Premium restaurant with views and curated tasting menus',
          cuisine: 'Fine Dining',
        },
      ],
      created_at: new Date().toISOString(),
    }));

    return NextResponse.json({
      places,
      success: true,
    });
  } catch (error) {
    console.error('Error generating places:', error);

    return NextResponse.json(
      {
        places: [],
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate travel destinations. Please try again.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/explore/generate
 * 
 * Method not allowed - use POST instead
 */
export async function GET() {
  return NextResponse.json(
    {
      error: 'Method not allowed. Use POST request instead.',
      example: {
        method: 'POST',
        body: { category: 'Beaches' },
      },
    },
    { status: 405 }
  );
}
