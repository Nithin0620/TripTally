// ============================================
// GET/PUT /api/auth/profile
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { signToken, setAuthCookie } from '@/lib/jwt';
import {
  authenticateUser,
  badRequestResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from '@/middleware/auth';
import { issueAuthToken, revokeAuthTokens } from '@/lib/auth-tokens';
import { getAppOrigin, sendVerificationEmail } from '@/lib/auth-email';

const PROFILE_FIELDS = 'id, name, email, profile_image, email_verified, created_at';

async function getAuthUser(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) return null;

  const dbClient = supabaseAdmin ?? supabase;
  const { data: user, error } = await dbClient
    .from('users')
    .select(PROFILE_FIELDS)
    .eq('id', auth.user.userId)
    .single();

  if (error || !user) {
    console.error('Profile lookup error:', error);
    return null;
  }

  return user;
}

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return unauthorizedResponse();
  return NextResponse.json({ user });
}

export async function PUT(request: NextRequest) {
  const currentUser = await getAuthUser(request);
  if (!currentUser) return unauthorizedResponse();

  try {
    const dbClient = supabaseAdmin ?? supabase;
    const body = await request.json().catch(() => null);
    const rawName = body?.name;
    const rawEmail = body?.email;

    const updates: { name?: string; email?: string; email_verified?: boolean } = {};

    if (rawName !== undefined) {
      if (typeof rawName !== 'string' || !rawName.trim()) {
        return badRequestResponse('Name cannot be empty');
      }
      updates.name = rawName.trim();
    }

    let newEmail: string | null = null;
    if (rawEmail !== undefined) {
      if (typeof rawEmail !== 'string' || !/^\S+@\S+\.\S+$/.test(rawEmail.trim())) {
        return badRequestResponse('Enter a valid email address');
      }
      newEmail = rawEmail.trim().toLowerCase();
      if (newEmail !== currentUser.email) {
        const { data: existing } = await dbClient
          .from('users')
          .select('id')
          .eq('email', newEmail)
          .single();
        if (existing) {
          return badRequestResponse('Email already registered');
        }
        updates.email = newEmail;
        updates.email_verified = false;
      }
    }

    if (Object.keys(updates).length === 0) {
      return badRequestResponse('No profile changes provided');
    }

    const { data: user, error } = await dbClient
      .from('users')
      .update(updates)
      .eq('id', currentUser.id)
      .select(PROFILE_FIELDS)
      .single();

    if (error || !user) {
      console.error('Profile update error:', error);
      return serverErrorResponse('Failed to update profile');
    }

    let verificationEmailSent = false;
    if (newEmail) {
      try {
        await revokeAuthTokens(user.id);
        const token = await issueAuthToken(user.id, 'email_verification');
        verificationEmailSent = await sendVerificationEmail(
          user.email,
          user.name,
          token,
          getAppOrigin(request)
        );
      } catch (tokenError) {
        console.error('Profile verification email error:', tokenError);
      }
    }

    const authToken = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      profile_image: user.profile_image,
    });

    const response = NextResponse.json({ user: { ...user, verificationEmailSent } });
    response.headers.set('Set-Cookie', setAuthCookie(authToken));
    return response;
  } catch (error) {
    console.error('Profile route error:', error);
    return serverErrorResponse('Failed to update profile');
  }
}
