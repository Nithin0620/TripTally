import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

/**
 * GET /api/visitors
 * Returns the total count of unique visitors
 */
export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('visitors')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch visitor count' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { count: count || 0 },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/visitors
 * Registers a new visitor with their UUID
 * Returns 201 if created, 200 if already exists
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { visitor_uuid } = body;

    if (!visitor_uuid || typeof visitor_uuid !== 'string') {
      return NextResponse.json(
        { error: 'Invalid visitor_uuid' },
        { status: 400 }
      );
    }

    // Check if visitor already exists
    const { data: existingVisitor, error: selectError } = await supabaseAdmin
      .from('visitors')
      .select('id')
      .eq('visitor_uuid', visitor_uuid)
      .single()
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Supabase select error:', selectError);
      return NextResponse.json(
        { error: 'Failed to check visitor' },
        { status: 500 }
      );
    }

    // If visitor already exists, return 200
    if (existingVisitor) {
      return NextResponse.json(
        { message: 'Visitor already registered', visitor_uuid },
        { status: 200 }
      );
    }

    // Insert new visitor
    const { data: newVisitor, error: insertError } = await supabaseAdmin
      .from('visitors')
      .insert([{ visitor_uuid }])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);

      // Handle unique constraint violation
      if (insertError.code === '23505') {
        return NextResponse.json(
          { message: 'Visitor already registered', visitor_uuid },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to register visitor' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Visitor registered successfully',
        visitor: newVisitor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
