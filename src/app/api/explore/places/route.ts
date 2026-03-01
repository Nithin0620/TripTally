/**
 * GET /api/explore/places
 *
 * Fetch places by category with pagination
 * Database-only - NO AI CALLS
 *
 * Query Parameters:
 * - category: string (required) - Any category that exists in the database
 * - offset: number (optional, default: 0) - Number of places to skip
 * - limit: number (optional, default: 4) - Number of places per page
 *
 * Response:
 * {
 *   success: boolean,
 *   data: Place[],
 *   pagination: {
 *     limit: number,
 *     offset: number,
 *     total: number,
 *     hasMore: boolean
 *   }
 * }
 */

import { NextResponse, NextRequest } from 'next/server';
import { Place } from '@/types';
import { getPlacesByCategory, getPlacesCategoryCount } from '@/lib/places-db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limitParam = searchParams.get('limit');

    // Validate category
    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'Category parameter is required',
          data: [],
        },
        { status: 400 }
      );
    }

    // Validate offset and limit
    if (offset < 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Offset must be non-negative',
          data: [],
        },
        { status: 400 }
      );
    }

    if (limitParam && (Number.isNaN(parseInt(limitParam, 10)) || parseInt(limitParam, 10) < 1)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Limit must be a positive number',
          data: [],
        },
        { status: 400 }
      );
    }

    const totalCount = await getPlacesCategoryCount(category);
    const computedLimit = limitParam
      ? Math.min(parseInt(limitParam, 10), 100)
      : offset > 0
        ? Math.max(0, totalCount - offset)
        : 4;

    // Fetch places from database only
    const places = await getPlacesByCategory(category, computedLimit, offset);

    console.log(
      `[API] Fetched ${places.length} places for ${category} at offset ${offset} (total: ${totalCount})`
    );

    return NextResponse.json({
      success: true,
      data: places || [],
      pagination: {
        limit: computedLimit,
        offset,
        total: totalCount,
        hasMore: offset + computedLimit < totalCount,
      },
    });
  } catch (error) {
    console.error('[API] Error in /api/explore/places:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        data: [],
      },
      { status: 500 }
    );
  }
}
