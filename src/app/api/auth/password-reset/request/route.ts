// ============================================
// POST /api/auth/password-reset/request
// Issues a one-time password reset token for an existing email.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import { issueAuthToken } from '@/lib/auth-tokens';
import { getAppOrigin, sendPasswordResetEmail } from '@/lib/auth-email';

export async function POST(request: NextRequest) {
  try {
    const dbClient = supabaseAdmin ?? supabase;
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';

    if (!email) {
      return badRequestResponse('Missing email');
    }

    const { data: user, error } = await dbClient
      .from('users')
      .select('id, name, email')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Password reset lookup error:', error);
      return serverErrorResponse('Failed to request password reset');
    }

    if (user) {
      try {
        const token = await issueAuthToken(user.id, 'password_reset');
        const emailSent = await sendPasswordResetEmail(
          user.email,
          user.name,
          token,
          getAppOrigin(request)
        );
        if (!emailSent) {
          console.warn('Password reset email could not be delivered');
        }
      } catch (tokenError) {
        console.error('Password reset token error:', tokenError);
        return serverErrorResponse(
          "Database is missing 'auth_tokens' table. Run sql/supabase_phase4_auth_migration.sql and retry."
        );
      }
    }

    return NextResponse.json({
      message: 'If an account exists for that email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return serverErrorResponse('Failed to request password reset');
  }
}
