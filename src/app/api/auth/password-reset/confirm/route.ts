// ============================================
// POST /api/auth/password-reset/confirm
// Consumes a reset token and stores a new password hash.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { badRequestResponse, serverErrorResponse } from '@/middleware/auth';
import { consumeAuthToken } from '@/lib/auth-tokens';

export async function POST(request: NextRequest) {
  try {
    const dbClient = supabaseAdmin ?? supabase;
    const body = await request.json().catch(() => null);
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!token) {
      return badRequestResponse('Missing reset token');
    }

    if (password.length < 8) {
      return badRequestResponse('Password must be at least 8 characters');
    }

    const consumed = await consumeAuthToken(token, 'password_reset');
    if (!consumed.ok) {
      return badRequestResponse('Invalid or expired reset link. Request a new one.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const { error: passwordError } = await dbClient.from('auth_passwords').upsert(
      {
        user_id: consumed.userId,
        password_hash: hashedPassword,
      },
      { onConflict: 'user_id' }
    );

    if (passwordError) {
      console.error('Password reset update error:', passwordError);
      if (passwordError.code === 'PGRST205') {
        return serverErrorResponse(
          "Database is missing 'auth_passwords' table. Run sql/supabase_complete_schema.sql and retry."
        );
      }
      return serverErrorResponse('Failed to reset password');
    }

    await dbClient
      .from('users')
      .update({ email_verified: true })
      .eq('id', consumed.userId);

    return NextResponse.json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    console.error('Password reset confirm error:', error);
    return serverErrorResponse('Failed to reset password');
  }
}
