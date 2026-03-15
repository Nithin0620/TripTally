import { NextRequest, NextResponse } from "next/server";
import { generatePlaceContent, determineCategory } from "@/lib/groq";
import { getUnsplashImagesForPlace } from "@/lib/unsplash";
import { createClient } from "@supabase/supabase-js";
import { Place } from "@/types";

interface GeneratePlaceRequest {
  placeName: string;
}

/**
 * POST /api/explore/generate-place
 *
 * Generate AI-powered travel guide for a specific place
 * Fetches from Groq API and caches result in Supabase
 *
 * Request body:
 * {
 *   placeName: string
 * }
 *
 * Response:
 * {
 *   place: Place,
 *   cached: boolean,
 *   success: boolean,
 *   error?: string
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GeneratePlaceRequest;
    const { placeName } = body;

    if (!placeName || typeof placeName !== "string" || placeName.trim().length === 0) {
      return NextResponse.json(
        {
          place: null,
          cached: false,
          success: false,
          error: "placeName is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const cleanPlaceName = placeName.trim();

    // Initialize Supabase client (server-side)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if place already exists in database
    const { data: existingPlace } = await supabase
      .from("places")
      .select("*")
      .eq("name", cleanPlaceName)
      .single();

    if (existingPlace) {
      return NextResponse.json(
        {
          place: existingPlace as Place,
          cached: true,
          success: true,
        },
        { status: 200 }
      );
    }

    // Generate place content from Groq
    const generatedContent = await generatePlaceContent(cleanPlaceName);

    if (!generatedContent) {
      return NextResponse.json(
        {
          place: null,
          cached: false,
          success: false,
          error: "Failed to generate place content from AI service",
        },
        { status: 500 }
      );
    }

    // Fetch images from Unsplash
    const images = await getUnsplashImagesForPlace(cleanPlaceName, 8);

    if (images.length === 0) {
      return NextResponse.json(
        {
          place: null,
          cached: false,
          success: false,
          error: "Failed to fetch images for the place",
        },
        { status: 500 }
      );
    }

    // Determine category
    const category = determineCategory(cleanPlaceName, generatedContent.introduction);

    // Format hotels with images from Unsplash
    const hotels: Place["hotels"] = generatedContent.hotels.map((hotel, idx) => ({
      name: hotel.name || "Hotel",
      image: images[idx % images.length]?.imageUrl || "",
      description: hotel.description || "",
      price_range: hotel.price_range || "Not specified",
    }));

    // Format restaurants
    const restaurants: Place["restaurants"] = generatedContent.restaurants.map(
      (restaurant, idx) => ({
        name: restaurant.name || "Restaurant",
        image: images[(idx + 3) % images.length]?.imageUrl || "",
        description: restaurant.description || "",
        cuisine: restaurant.cuisine || "Indian",
      })
    );

    // Extract state from place name or use placeholder
    const stateMatch = generatedContent.introduction.match(/in (\w+)/i);
    const state = stateMatch ? stateMatch[1] : cleanPlaceName;

    // Create place object
    const newPlace: Place = {
      id: crypto.randomUUID(),
      name: cleanPlaceName,
      category,
      state,
      description: generatedContent.introduction,
      best_time_to_visit: generatedContent.best_time_to_visit,
      avg_budget: generatedContent.estimated_budget,
      travel_duration: generatedContent.ideal_trip_duration,
      hero_image: images[0]?.imageUrl || "",
      gallery_images: images.slice(1, 6).map((img) => img.imageUrl),
      hotels,
      restaurants,
      created_at: new Date().toISOString(),
    };

    // Save to Supabase
    const { error: insertError } = await supabase
      .from("places")
      .insert([newPlace]);

    if (insertError) {
      console.error("Error saving place to database:", insertError);
      // Don't fail the request - return the generated data anyway
      // The place might already exist due to race condition
    }

    return NextResponse.json(
      {
        place: newPlace,
        cached: false,
        success: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[generate-place] Error:", error);
    return NextResponse.json(
      {
        place: null,
        cached: false,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
