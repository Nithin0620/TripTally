import { NextRequest, NextResponse } from 'next/server';

interface PlanRequest {
  destination: string;
  duration?: string;
  budget?: string;
  vibe?: string;
}

interface DayPlan {
  day: number;
  title: string;
  activities: {
    time: string;
    title: string;
    description: string;
    location?: string;
    estimated_cost?: string;
  }[];
}

interface PlanResponse {
  destination: string;
  duration: string;
  budget: string;
  overview: string;
  days: DayPlan[];
  tips: string[];
  estimated_total_budget: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PlanRequest;
    const { destination, duration, budget, vibe } = body;

    if (!destination || destination.trim().length < 2) {
      return NextResponse.json(
        { error: 'Please provide a valid destination', success: false },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const prompt = `Create a detailed day-by-day trip plan for a trip to ${destination}, India.
${duration ? `Duration: ${duration}` : 'Duration: Suggest an appropriate duration (3-7 days).'}
${budget ? `Budget: ${budget}` : 'Budget: Suggest a moderate budget range in INR.'}
${vibe ? `Travel Style: ${vibe}` : 'Travel Style: Well-rounded exploration.'}

Respond with ONLY valid JSON (no markdown, no extra text) in this exact format:
{
  "destination": "${destination}",
  "duration": "X days",
  "budget": "₹X - ₹Y total",
  "overview": "2-3 sentence overview of the trip",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity name",
          "description": "Brief description",
          "location": "Specific location name",
          "estimated_cost": "₹X"
        }
      ]
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"],
  "estimated_total_budget": "₹X per person"
}

Requirements:
- Each day should have 3-5 activities
- Include realistic timings
- Include a mix of sightseeing, food, and experiences
- Provide realistic cost estimates in INR
- Tips should be practical and specific to ${destination}
- Make descriptions concise but helpful
- Include popular landmarks and hidden gems`;

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
              'You are an expert travel planner specializing in India. Always respond with valid JSON only, no additional text or markdown.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    let plan: PlanResponse;
    try {
      plan = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[1]);
      } else {
        const objectMatch = content.match(/\{[\s\S]*\}/);
        if (objectMatch) {
          plan = JSON.parse(objectMatch[0]);
        } else {
          throw new Error('Could not parse AI response');
        }
      }
    }

    return NextResponse.json({ plan, success: true });
  } catch (error) {
    console.error('AI plan generation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to generate trip plan',
        success: false,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST instead.', success: false },
    { status: 405 }
  );
}
