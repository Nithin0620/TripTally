// ============================================
// POST /api/auth/login
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken, setAuthCookie } from '@/lib/jwt';
import { badRequestResponse, serverErrorResponse, unauthorizedResponse } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return badRequestResponse('Missing required fields: email, password');
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, profile_image')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return unauthorizedResponse('Invalid email or password');
    }

    // Get password hash
    const { data: authData, error: authError } = await supabase
      .from('auth_passwords')
      .select('password_hash')
      .eq('user_id', user.id)
      .single();

    if (authError || !authData) {
      return unauthorizedResponse('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, authData.password_hash);

    if (!isValidPassword) {
      return unauthorizedResponse('Invalid email or password');
    }

    // Generate JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
    });

    // Create response
    const response = NextResponse.json(
      {
        user,
        token,
      },
      { status: 200 }
    );

    // Set auth cookie
    response.headers.set('Set-Cookie', setAuthCookie(token));

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return serverErrorResponse('Login failed');
  }
}
