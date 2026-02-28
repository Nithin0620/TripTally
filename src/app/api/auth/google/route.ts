// ============================================
// POST /api/auth/google
// OAuth with Google SDK
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { signToken, setAuthCookie } from '@/lib/jwt';
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const dbClient = supabaseAdmin ?? supabase;
    const body = await request.json();
    const { googleToken } = body;

    if (!googleToken) {
      return badRequestResponse('Missing googleToken');
    }

    // Verify token with Google
    let payload;
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=' + googleToken);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google tokeninfo error:', errorText);
        return unauthorizedResponse('Invalid Google token');
      }
      
      payload = await response.json();
    } catch (error) {
      console.error('Google token verification failed:', error);
      return unauthorizedResponse('Invalid Google token');
    }

    if (!payload || !payload.email) {
      return unauthorizedResponse('Invalid Google token payload');
    }

    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const picture = payload.picture;

    const isUpstreamSslFailure = (message?: string) => {
      if (!message) return false;
      const normalized = message.toLowerCase();
      return normalized.includes('ssl handshake failed') || normalized.includes('error code 525');
    };

    // Check if user exists
    let { data: user, error: userError } = await dbClient
      .from('users')
      .select('id, name, email, profile_image')
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

    // Update profile image if provided
    if (picture && (!user.profile_image || user.profile_image !== picture)) {
      await dbClient
        .from('users')
        .update({ profile_image: picture })
        .eq('id', user.id);
    }

    // Generate JWT

    const token = await signToken({
      userId: user.id,
      email: user.email,
    });

    // Create response
    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile_image: user.profile_image,
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
