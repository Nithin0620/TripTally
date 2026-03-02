// ============================================
// GET /api/auth/session
// Retrieves current user session from HTTP-only cookie
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromCookie, verifyToken } from '@/lib/jwt';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Extract token from cookie
    const cookieHeader = request.headers.get('cookie');
    const token = extractTokenFromCookie(cookieHeader || '');

    if (!token) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    // Verify token
    const payload = await verifyToken(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    // Fetch fresh user data from database
    const dbClient = supabaseAdmin ?? supabase;
    const { data: user, error } = await dbClient
      .from('users')
      .select('id, name, email, profile_image, created_at')
      .eq('id', payload.userId)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({ user, authenticated: true });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }
}
