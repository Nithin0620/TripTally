// ============================================
// POST /api/auth/verify/resend
// Resends a fresh email verification link.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import { issueAuthToken } from '@/lib/auth-tokens';
import { getAppOrigin, sendVerificationEmail } from '@/lib/auth-email';

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
      .select('id, name, email, email_verified')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Resend verification lookup error:', error);
      return serverErrorResponse('Failed to resend verification email');
    }

    if (user && user.email_verified === false) {
      try {
        const token = await issueAuthToken(user.id, 'email_verification');
        const emailSent = await sendVerificationEmail(
          user.email,
          user.name,
          token,
          getAppOrigin(request)
        );
        if (!emailSent) {
          console.warn('Verification email could not be delivered');
        }
      } catch (tokenError) {
        console.error('Resend verification token error:', tokenError);
        return serverErrorResponse(
          "Database is missing 'auth_tokens' table. Run sql/supabase_phase4_auth_migration.sql and retry."
        );
      }
    }

    return NextResponse.json({
      message: 'If this account needs verification, a new link has been sent.',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return serverErrorResponse('Failed to resend verification email');
  }
}
