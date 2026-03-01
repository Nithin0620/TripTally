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

    // Fetch all distinct categories from database
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('places')
      .select('category')
      .neq('category', null)
      .order('category', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      );
    }

    // Get unique categories
    const uniqueCategories = Array.from(
      new Set((categoriesData as { category: string }[])?.map((item) => item.category) || [])
    ).filter((cat) => cat && cat.trim() !== '');

    const results: ExploreCategory[] = [];

    for (const category of uniqueCategories) {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })
        .limit(2);

      // Get total count for this category
      const { count, error: countError } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('category', category);

      if (error) {
        console.error(`Error fetching ${category}:`, error);
        results.push({
          category: category as any,
          places: [],
          hasMore: false,
        });
      } else {
        const totalCount = count || 0;
        const fetchedCount = (data as Place[])?.length || 0;
        results.push({
          category: category as any,
          places: (data as Place[]) || [],
          hasMore: totalCount > 2, // Show "See More" if there are more than 2 places
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
