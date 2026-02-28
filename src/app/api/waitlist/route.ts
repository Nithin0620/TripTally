import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * POST /api/waitlist
 * Adds email to waitlist
 * Returns 201 if created, 409 if duplicate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingEmail, error: selectError } = await supabaseAdmin
      .from('waitlist')
      .select('id')
      .eq('email', normalizedEmail)
      .single()
      .maybeSingle();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('Supabase select error:', selectError);
      return NextResponse.json(
        { error: 'Failed to check email' },
        { status: 500 }
      );
    }

    // If email already exists, return 409 Conflict
    if (existingEmail) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      );
    }

    // Insert new email
    const { data: newEntry, error: insertError } = await supabaseAdmin
      .from('waitlist')
      .insert([{ email: normalizedEmail }])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);

      // Handle unique constraint violation
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already on the waitlist' },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to add email to waitlist' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully joined the waitlist!',
        email: newEntry.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('API error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
