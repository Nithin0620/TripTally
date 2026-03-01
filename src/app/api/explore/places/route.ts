import { createClient } from '@supabase/supabase-js';
import { Place } from '@/types';
import { NextResponse, NextRequest } from 'next/server';
import { getOpenAIJson } from '@/lib/openai';

interface AIGeneratedPlace {
  name: string;
  category: string;
  state: string;
  description: string;
  best_time_to_visit: string;
  avg_budget: string;
  travel_duration: string;
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const offset = parseInt(searchParams.get('offset') || '4', 10);

    if (!category) {
      return NextResponse.json(
        { error: 'Category parameter is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try fetching from database first
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .range(offset, offset + 4);

    if (error) {
      console.error(`Error fetching places for ${category}:`, error);
      return NextResponse.json(
        { error: `Failed to fetch places for ${category}` },
        { status: 500 }
      );
    }

    console.log(`[API] Fetched ${data?.length || 0} places from DB for ${category} at offset ${offset}`);

    // If we have data, return it
    if (data && data.length > 0) {
      return NextResponse.json((data as Place[]) || []);
    }

    // If no data from database, generate using OpenAI
    console.log(`[API] No more places in database for ${category}, generating with OpenAI...`);
    
    // Check if OpenAI is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('[API] OPENAI_API_KEY is not configured. Returning empty array.');
      return NextResponse.json([]);
    }
    
    console.log(`[API] Using OpenAI model: ${process.env.OPENAI_MODEL || 'gpt-4o-mini'}`);
    
    const systemPrompt = `You are a travel expert. Generate realistic and detailed information about travel destinations in India. 
    Return ONLY valid JSON with no additional text or markdown formatting.`;
    
    const userPrompt = `Generate 5 unique and diverse travel destinations in India for the "${category}" category.
    
    For each place, provide:
    - name: The actual name of the destination
    - category: Must be exactly "${category}"
    - state: The Indian state where it's located
    - description: A compelling 2-3 sentence description highlighting what makes it special
    - best_time_to_visit: The ideal months or season to visit
    - avg_budget: Realistic budget range per person for 3-4 days (e.g., "₹15,000 - ₹25,000")
    - travel_duration: Recommended duration to explore (e.g., "3-4 days")
    - hotels: Array of 3 real or realistic hotels with name, description (1 sentence), and price_range (e.g., "₹3,000 - ₹5,000/night")
    - restaurants: Array of 3 restaurants with name, description (1 sentence), and cuisine type
    
    Return as JSON array: { "places": [...] }`;

    try {
      console.log(`[API] Calling OpenAI to generate ${category} places...`);
      const aiResponse = await getOpenAIJson<{ places: AIGeneratedPlace[] }>(
        systemPrompt,
        userPrompt,
        2500
      );

      if (!aiResponse || !aiResponse.places) {
        console.error('[API] Failed to generate places with OpenAI - Invalid response:', aiResponse);
        return NextResponse.json([]);
      }

      console.log(`[API] OpenAI generated ${aiResponse.places.length} places for ${category}`);

      // Transform AI response to Place format with placeholder images
      const generatedPlaces: Place[] = aiResponse.places.map((place, index) => ({
        id: `ai-${category}-${Date.now()}-${index}`,
        name: place.name,
        category: category as any,
        state: place.state,
        description: place.description,
        best_time_to_visit: place.best_time_to_visit,
        avg_budget: place.avg_budget,
        travel_duration: place.travel_duration,
        hero_image: '',  // Will be fetched from Unsplash on frontend
        gallery_images: [],
        hotels: place.hotels.map(h => ({
          ...h,
          image: ''  // Will be fetched from Unsplash on frontend
        })),
        restaurants: place.restaurants.map(r => ({
          ...r,
          image: ''  // Will be fetched from Unsplash on frontend
        })),
        created_at: new Date().toISOString(),
      }));

      console.log(`Generated ${generatedPlaces.length} places with OpenAI for ${category}`);
      return NextResponse.json(generatedPlaces);
    } catch (aiError) {
      console.error('Error generating places with OpenAI:', aiError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error in /api/explore/places:', error);
    // Return empty array instead of error to prevent breaking the UI
    return NextResponse.json([]);
  }
}
