import { createClient } from '@supabase/supabase-js';
import { Place, ExploreCategory } from '@/types';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const categories: ExploreCategory['category'][] = [
      'Beaches',
      'Mountains',
      'Cities',
      'Spiritual',
      'Luxury',
    ];

    const results: ExploreCategory[] = [];

    for (const category of categories) {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error(`Error fetching ${category}:`, error);
        results.push({
          category,
          places: [],
        });
      } else {
        results.push({
          category,
          places: (data as Place[]) || [],
        });
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error in /api/explore/categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
