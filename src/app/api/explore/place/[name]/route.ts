import { createClient } from '@supabase/supabase-js';
import { Place } from '@/types';
import { NextResponse, NextRequest } from 'next/server';
import { safeSupabaseQuery, isHTMLError, parseHTMLError } from '@/lib/supabase-health';

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const placename = params.name;

    if (!placename) {
      return NextResponse.json(
        { error: 'Place name parameter is required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          error: 'Missing Supabase configuration',
          hint: 'Check your .env.local file for NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Convert slug to place name (e.g., "goa" -> "Goa")
    const formattedName = placename
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Use safe query wrapper with better error handling
    const { data, error, errorType } = await safeSupabaseQuery<Place[]>(
      () => supabase
        .from('places')
        .select('*')
        .ilike('name', formattedName)
        .limit(1),
      `GET /api/explore/place/${placename}`
    );

    if (error) {
      console.error(`Error fetching place ${placename}:`, error);
      
      // Return more helpful error message for SSL/connection issues
      if (errorType === 'SSL_ERROR') {
        return NextResponse.json(
          { 
            error: error,
            hint: 'Please verify your Supabase project is active at https://supabase.com/dashboard',
            errorType: 'CONNECTION_ERROR'
          },
          { status: 503 } // Service Unavailable
        );
      }
      
      return NextResponse.json(
        { error: error, errorType },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Place not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data[0] as Place);
  } catch (error: any) {
    console.error('Error in /api/explore/place/[name]:', error);
    
    // Check for HTML errors in catch block too
    if (isHTMLError(error)) {
      const htmlError = parseHTMLError(error.message || String(error));
      
      return NextResponse.json(
        { 
          error: `Database connection failed (${htmlError.code}): ${htmlError.message}`,
          hint: 'Your Supabase project may be paused. Visit https://supabase.com/dashboard to check.',
          errorType: 'SSL_ERROR'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch place', details: error.message },
      { status: 500 }
    );
  }
}
