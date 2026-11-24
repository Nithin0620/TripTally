// ============================================
// POST /api/auth/password
// Changes the password for email/password accounts.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { authenticateUser, badRequestResponse, serverErrorResponse, unauthorizedResponse } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) return unauthorizedResponse();

  try {
    const dbClient = supabaseAdmin ?? supabase;
    const body = await request.json().catch(() => null);
    const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return badRequestResponse('Current password and new password are required');
    }

    if (newPassword.length < 8) {
      return badRequestResponse('New password must be at least 8 characters');
    }

    const { data: authRow, error: lookupError } = await dbClient
      .from('auth_passwords')
      .select('password_hash')
      .eq('user_id', auth.user.userId)
      .single();

    if (lookupError?.code === 'PGRST205') {
      return serverErrorResponse(
        "Database is missing 'auth_passwords' table. Run sql/supabase_complete_schema.sql and retry."
      );
    }

    if (lookupError || !authRow) {
      return badRequestResponse(
        'This account has no password yet. Use “Forgot password?” to set one.'
      );
    }

    const isValid = await bcrypt.compare(currentPassword, authRow.password_hash);
    if (!isValid) {
      return badRequestResponse('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const { error } = await dbClient
      .from('auth_passwords')
      .update({ password_hash: passwordHash })
      .eq('user_id', auth.user.userId);

    if (error) {
      console.error('Password change error:', error);
      return serverErrorResponse('Failed to change password');
    }

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change route error:', error);
    return serverErrorResponse('Failed to change password');
  }
}
