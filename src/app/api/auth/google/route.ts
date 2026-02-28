// ============================================
// POST /api/auth/google
// OAuth with Google SDK
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { signToken, setAuthCookie } from '@/lib/jwt';
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from '@/middleware/auth';

const google = require('google-auth-library');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { googleToken } = body;

    if (!googleToken) {
      return badRequestResponse('Missing googleToken');
    }

    // Verify Google token
    const client = new google.OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
    let ticket;

    try {
      ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      console.error('Google token verification failed:', error);
      return unauthorizedResponse('Invalid Google token');
    }

    const payload = ticket.getPayload();
    
    if (!payload || !payload.email) {
      return unauthorizedResponse('Invalid Google token payload');
    }

    const { email, name, picture } = payload;

    // Check if user exists
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, profile_image')
      .eq('email', email)
      .single();

    // If user doesn't exist, create them
    if (userError && userError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email,
          name: name || email.split('@')[0],
          profile_image: picture,
        })
        .select()
        .single();

      if (createError || !newUser) {
        return serverErrorResponse('Failed to create user');
      }

      user = newUser;
    } else if (userError) {
      return serverErrorResponse('Failed to fetch user');
    }

    // Ensure user exists
    if (!user) {
      return serverErrorResponse('User not found');
    }

    // Update profile image if provided
    if (picture && (!user.profile_image || user.profile_image !== picture)) {
      await supabase
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
