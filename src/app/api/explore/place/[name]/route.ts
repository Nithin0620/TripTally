import { createClient } from '@supabase/supabase-js';
import { Place } from '@/types';
import { NextResponse, NextRequest } from 'next/server';

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
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Convert slug to place name (e.g., "goa" -> "Goa")
    const formattedName = placename
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const { data, error } = await supabase
      .from('places')
      .select('*')
      .ilike('name', formattedName)
      .limit(1);

    if (error) {
      console.error(`Error fetching place ${placename}:`, error);
      return NextResponse.json(
        { error: `Failed to fetch place ${placename}` },
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
  } catch (error) {
    console.error('Error in /api/explore/place/[name]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch place' },
      { status: 500 }
    );
  }
}
