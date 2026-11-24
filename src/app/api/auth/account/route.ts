// ============================================
// DELETE /api/auth/account
// Deletes the authenticated user and their personal data.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { clearAuthCookie } from '@/lib/jwt';
import {
  authenticateUser,
  badRequestResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from '@/middleware/auth';

export async function DELETE(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) return unauthorizedResponse();

  try {
    const dbClient = supabaseAdmin ?? supabase;
    const body = await request.json().catch(() => null);
    const password = typeof body?.password === 'string' ? body.password : '';

    const { data: authRow, error: lookupError } = await dbClient
      .from('auth_passwords')
      .select('password_hash')
      .eq('user_id', auth.user.userId)
      .single();

    if (lookupError && lookupError.code !== 'PGRST116' && lookupError.code !== 'PGRST205') {
      console.error('Account deletion password lookup error:', lookupError);
      return serverErrorResponse('Failed to verify account');
    }

    if (authRow) {
      const isValid = await bcrypt.compare(password, authRow.password_hash);
      if (!isValid) {
        return badRequestResponse('Enter your current password to confirm deletion');
      }
    }

    const { error } = await dbClient.rpc('delete_user_account', {
      target_user_id: auth.user.userId,
    });

    if (error) {
      console.error('Account deletion error:', error);
      if (error.code === '42883') {
        return serverErrorResponse(
          "Database is missing 'delete_user_account'. Run sql/supabase_phase4_auth_migration.sql and retry."
        );
      }
      return serverErrorResponse('Failed to delete account');
    }

    const response = NextResponse.json({
      message: 'Your account and personal data have been deleted.',
    });
    response.headers.set('Set-Cookie', clearAuthCookie());
    return response;
  } catch (error) {
    console.error('Account deletion route error:', error);
    return serverErrorResponse('Failed to delete account');
  }
}
