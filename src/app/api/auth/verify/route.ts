// ============================================
// POST /api/auth/verify
// Confirms a one-time email verification token.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { signToken, setAuthCookie } from '@/lib/jwt';
import { badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import { consumeAuthToken } from '@/lib/auth-tokens';

export async function POST(request: NextRequest) {
  try {
    const dbClient = supabaseAdmin ?? supabase;
    const body = await request.json().catch(() => null);
    const token = typeof body?.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return badRequestResponse('Missing verification token');
    }

    const consumed = await consumeAuthToken(token, 'email_verification');
    if (!consumed.ok) {
      return badRequestResponse('Invalid or expired verification link. Request a new one.');
    }

    const { data: user, error } = await dbClient
      .from('users')
      .update({ email_verified: true })
      .eq('id', consumed.userId)
      .select('id, name, email, profile_image, email_verified')
      .single();

    if (error || !user) {
      console.error('Verify email update error:', error);
      return serverErrorResponse('Failed to verify email');
    }

    const authToken = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      profile_image: user.profile_image,
    });

    const response = NextResponse.json({ user, verified: true });
    response.headers.set('Set-Cookie', setAuthCookie(authToken));
    return response;
  } catch (error) {
    console.error('Email verification error:', error);
    return serverErrorResponse('Email verification failed');
  }
}
