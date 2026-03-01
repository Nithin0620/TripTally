/**
 * GET /api/explore/search
 *
 * Search for places with database-first, AI-fallback strategy:
 *
 * Step 1: Search database for places matching query (name and description)
 * Step 2: If found → return results immediately
 * Step 3: If not found → call AI to generate a new place
 * Step 4: Save generated place to database
 * Step 5: Return the result
 *
 * Rate limited to prevent abuse
 *
 * Query Parameters:
 * - q: string (required) - Search query
 * - category: string (optional) - Hint for AI generation if needed
 *
 * Response:
 * {
 *   success: boolean,
 *   data: Place[],
 *   source: "database" | "ai",
 *   message?: string,
 *   error?: string
 * }
 */

import { NextResponse, NextRequest } from 'next/server';
import { searchPlacesByQuery, savePlaceToDB, getPlaceByName } from '@/lib/places-db';
import { generatePlaceWithAI, transformGeneratedPlaceToDBFormat } from '@/lib/explore-ai';
import { createRateLimiter } from '@/middleware/rate-limit';

// Rate limiting: 20 searches per minute per user/IP
const rateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20,
  message: 'Too many search requests. Please try again in a moment.',
});

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = rateLimiter(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const categoryHint = searchParams.get('category');

    // Validate query
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query is required',
          data: [],
        },
        { status: 400 }
      );
    }

    if (query.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query must be at least 2 characters',
          data: [],
        },
        { status: 400 }
      );
    }

    if (query.trim().length > 200) {
      return NextResponse.json(
        {
          success: false,
          error: 'Search query must be less than 200 characters',
          data: [],
        },
        { status: 400 }
      );
    }

    console.log(`[Search] User searching for: "${query}"`);

    // STEP 1 & 2: Search database first
    const dbResults = await searchPlacesByQuery(query);

    if (dbResults && dbResults.length > 0) {
      console.log(`[Search] Found ${dbResults.length} places in database for "${query}"`);
      return NextResponse.json({
        success: true,
        data: dbResults,
        source: 'database',
        message: `Found ${dbResults.length} place(s) matching your search.`,
      });
    }

    console.log(`[Search] No database results for "${query}", attempting AI generation...`);

    // STEP 3: Check if AI is configured before attempting generation
    if (!process.env.GROQ_API_KEY) {
      console.log('[Search] Groq API not configured, returning empty results');
      return NextResponse.json({
        success: true,
        data: [],
        source: 'database',
        message: 'No places found for your search.',
      });
    }

    // STEP 3: Generate with AI
    const generatedPlace = await generatePlaceWithAI(query, categoryHint || undefined);

    if (!generatedPlace) {
      console.log(`[Search] AI generation failed for "${query}"`);
      return NextResponse.json({
        success: true,
        data: [],
        source: 'database',
        message: 'No places found for your search.',
      });
    }

    console.log(`[Search] AI generated place: ${generatedPlace.name}`);

    // STEP 4: Check again that place doesn't exist (concurrent requests protection)
    const existingPlace = await getPlaceByName(generatedPlace.name);
    if (existingPlace) {
      console.log(`[Search] Place "${generatedPlace.name}" already exists, returning from DB`);
      return NextResponse.json({
        success: true,
        data: [existingPlace],
        source: 'database',
        message: `Found place matching your search.`,
      });
    }

    // STEP 4: Transform and save generated place to database
    const placeToSave = transformGeneratedPlaceToDBFormat(generatedPlace);
    const savedPlace = await savePlaceToDB(placeToSave);

    if (!savedPlace) {
      console.error('[Search] Failed to save generated place to database');
      return NextResponse.json({
        success: false,
        data: [],
        error: 'Failed to cache generated place. Please retry.',
      });
    }

    console.log(`[Search] Successfully saved new place: ${savedPlace.name}`);

    // STEP 5: Return saved place
    return NextResponse.json({
      success: true,
      data: [savedPlace],
      source: 'ai',
      message: `Generated new place: ${savedPlace.name}. Saved to database for future searches.`,
    });
  } catch (error) {
    console.error('[Search] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during search',
        data: [],
      },
      { status: 500 }
    );
  }
}
