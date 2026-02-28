// ============================================
// POST /api/templates - Create template
// GET /api/templates - List templates
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/templates - Create template
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateUser(request);

    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const body = await request.json();
    const { title, location, days, budget_range, is_public } = body;

    // Validation
    if (!title) {
      return badRequestResponse('Missing required field: title');
    }

    const { data: template, error } = await supabase
      .from('templates')
      .insert({
        title,
        location,
        days,
        budget_range,
        is_public: is_public ?? true,
        created_by: auth.user!.userId,
      })
      .select()
      .single();

    if (error) {
      return serverErrorResponse(error.message);
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    return serverErrorResponse('Failed to create template');
  }
}

/**
 * GET /api/templates - List templates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includePrivate = searchParams.get('includePrivate') === 'true';

    let query = supabase
      .from('templates')
      .select(
        `
        *,
        users!created_by(id, name, email, profile_image)
      `
      );

    // Filter by public/private
    if (!includePrivate) {
      query = query.eq('is_public', true);
    }

    const { data: templates, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      return serverErrorResponse(error.message);
    }

    return NextResponse.json({ templates: templates || [] }, { status: 200 });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return serverErrorResponse('Failed to fetch templates');
  }
}
