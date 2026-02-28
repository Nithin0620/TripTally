// ============================================
// POST /api/auth/register
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';
import { signToken, setAuthCookie } from '@/lib/jwt';
import { badRequestResponse, serverErrorResponse } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return badRequestResponse('Missing required fields: email, password, name');
    }

    if (password.length < 6) {
      return badRequestResponse('Password must be at least 6 characters');
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return badRequestResponse('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        name,
        // Store hashed password in a separate auth-specific table in production
        // For now, this is stored as part of the user record via a trigger
      })
      .select()
      .single();

    if (createError || !user) {
      return serverErrorResponse('Failed to create user');
    }

    // Store password hash (in production, use Supabase Auth)
    // For this demo, we'd need an auth_passwords table
    const { error: authError } = await supabase
      .from('auth_passwords')
      .insert({
        user_id: user.id,
        password_hash: hashedPassword,
      });

    if (authError) {
      // Clean up user
      await supabase.from('users').delete().eq('id', user.id);
      return serverErrorResponse('Failed to set password');
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
      { status: 201 }
    );

    // Set auth cookie
    response.headers.set('Set-Cookie', setAuthCookie(token));

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return serverErrorResponse('Registration failed');
  }
}
