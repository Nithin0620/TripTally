// ============================================
// POST /api/auth/register
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { signToken, setAuthCookie } from '@/lib/jwt';
import { badRequestResponse, serverErrorResponse } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    const dbClient = supabaseAdmin ?? supabase;
    const isUpstreamSslFailure = (message?: string) => {
      if (!message) return false;
      const normalized = message.toLowerCase();
      return normalized.includes('ssl handshake failed') || normalized.includes('error code 525');
    };

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
    const { data: existingUser, error: existingUserError } = await dbClient
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      console.error('Register existing user lookup error:', existingUserError);
      if (isUpstreamSslFailure(existingUserError.message)) {
        return NextResponse.json(
          { error: 'Auth service is temporarily unavailable (upstream SSL issue). Please retry in a few minutes.' },
          { status: 503 }
        );
      }
      return serverErrorResponse(existingUserError.message || 'Failed to check existing user');
    }

    if (existingUser) {
      return badRequestResponse('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error: createError } = await dbClient
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
      console.error('Register create user error:', createError);
      if (isUpstreamSslFailure(createError?.message)) {
        return NextResponse.json(
          { error: 'Auth service is temporarily unavailable (upstream SSL issue). Please retry in a few minutes.' },
          { status: 503 }
        );
      }
      return serverErrorResponse(createError?.message || 'Failed to create user');
    }

    // Store password hash (in production, use Supabase Auth)
    // For this demo, we'd need an auth_passwords table
    const { error: authError } = await dbClient
      .from('auth_passwords')
      .insert({
        user_id: user.id,
        password_hash: hashedPassword,
      });

    if (authError) {
      console.error('Register set password error:', authError);
      if (authError.code === 'PGRST205') {
        await dbClient.from('users').delete().eq('id', user.id);
        return serverErrorResponse(
          "Database is missing 'auth_passwords' table. Run sql/supabase_complete_schema.sql in Supabase SQL editor and retry."
        );
      }
      if (isUpstreamSslFailure(authError.message)) {
        return NextResponse.json(
          { error: 'Auth service is temporarily unavailable (upstream SSL issue). Please retry in a few minutes.' },
          { status: 503 }
        );
      }
      // Clean up user
      await dbClient.from('users').delete().eq('id', user.id);
      return serverErrorResponse(authError.message || 'Failed to set password');
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
