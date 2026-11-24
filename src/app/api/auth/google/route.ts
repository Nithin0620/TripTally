// ============================================
// POST /api/auth/google
// OAuth with Google SDK
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { signToken, setAuthCookie } from '@/lib/jwt';
import {
  badRequestResponse,
  errorResponse,
  serverErrorResponse,
  unauthorizedResponse,
} from '@/middleware/auth';

const googleClient = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const dbClient = supabaseAdmin ?? supabase;
    const body = await request.json().catch(() => null);
    const { googleToken } = body || {};

    if (!googleToken) {
      return badRequestResponse('Missing googleToken');
    }

    // Verify token with Google Identity Services and ensure the audience matches this app.
    let ticketPayload;
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        return serverErrorResponse('Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID');
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: clientId,
      });

      ticketPayload = ticket.getPayload();
    } catch (error) {
      console.error('Google token verification failed:', error);
      return unauthorizedResponse('Invalid Google token');
    }

    if (!ticketPayload || !ticketPayload.email) {
      return unauthorizedResponse('Invalid Google token payload');
    }

    if (ticketPayload.email_verified === false) {
      return errorResponse(
        403,
        'Your Google account email is not verified. Verify it with Google and try again.',
        'EMAIL_NOT_VERIFIED'
      );
    }

    const email = ticketPayload.email.toLowerCase();
    const name = ticketPayload.name || email.split('@')[0];
    const picture = ticketPayload.picture;
    if (!ticketPayload.sub) {
      return unauthorizedResponse('Missing Google subject');
    }

    const isUpstreamSslFailure = (message?: string) => {
      if (!message) return false;
      const normalized = message.toLowerCase();
      return normalized.includes('ssl handshake failed') || normalized.includes('error code 525');
    };

    // Check if user exists
    let { data: user, error: userError } = await dbClient
      .from('users')
      .select('id, name, email, profile_image, email_verified')
      .eq('email', email)
      .single();

    // If user doesn't exist, create them
    if (userError && userError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await dbClient
        .from('users')
        .insert({
          email,
          name: name || email.split('@')[0],
          profile_image: picture,
          email_verified: true,
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('Google user create error:', createError);
        if (isUpstreamSslFailure(createError?.message)) {
          return NextResponse.json(
            {
              error: 'Auth service is temporarily unavailable (upstream SSL issue). Please retry in a few minutes.',
            },
            { status: 503 }
          );
        }
        return serverErrorResponse(createError?.message || 'Failed to create user');
      }

      user = newUser;
    } else if (userError) {
      console.error('Google user fetch error:', userError);
      if (isUpstreamSslFailure(userError.message)) {
        return NextResponse.json(
          {
            error: 'Auth service is temporarily unavailable (upstream SSL issue). Please retry in a few minutes.',
          },
          { status: 503 }
        );
      }
      return serverErrorResponse(userError.message || 'Failed to fetch user');
    }

    // Ensure user exists
    if (!user) {
      return serverErrorResponse('User not found');
    }

    // Google only returns verified emails for accepted accounts; reconcile legacy
    // rows created before the verification column existed.
    if (user.email_verified === false) {
      const { error: verifyError } = await dbClient
        .from('users')
        .update({ email_verified: true })
        .eq('id', user.id);
      if (verifyError) {
        console.error('Google email verification update error:', verifyError);
      } else {
        user.email_verified = true;
      }
    }

    // Update profile image if provided
    if (picture && (!user.profile_image || user.profile_image !== picture)) {
      await dbClient
        .from('users')
        .update({ profile_image: picture })
        .eq('id', user.id);
      user.profile_image = picture;
    }

    // Generate JWT

    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      profile_image: user.profile_image,
    });

    // Create response
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile_image: user.profile_image,
          email_verified: true,
        },
        token,
      },
      { status: 200 }
    );

    // Set auth cookie
    response.headers.set('Set-Cookie', setAuthCookie(token));

    return response;
  } catch (error) {
    console.error('Google OAuth error:', error);
    return serverErrorResponse('Google OAuth failed');
  }
}
