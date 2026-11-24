/**
 * Trip Invite API - Send email invitations to join a trip
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import { verifyJWT } from '@/lib/jwt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Setup email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { tripId, email } = await request.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    // Validate inputs
    if (!tripId || !normalizedEmail) {
      return NextResponse.json(
        { error: 'Trip ID and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Verify trip ownership
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('*')
      .eq('id', tripId)
      .eq('created_by', payload.userId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: 'Trip not found or you do not have permission' },
        { status: 403 }
      );
    }

    // Check if user already invited
    const nowIso = new Date().toISOString();
    const { data: existingInvite } = await supabase
      .from('trip_invites')
      .select('*')
      .eq('trip_id', tripId)
      .eq('email', normalizedEmail)
      .eq('status', 'pending')
      .gte('expires_at', nowIso)
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: 'This user has already been invited' },
        { status: 409 }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingMember) {
      const { data: tripMember } = await supabase
        .from('trip_members')
        .select('*')
        .eq('trip_id', tripId)
        .eq('user_id', existingMember.id)
        .single();

      if (tripMember) {
        return NextResponse.json(
          { error: 'User is already a member of this trip' },
          { status: 409 }
        );
      }
    }

    // Create invite record
    const { data: invite, error: inviteError } = await supabase
      .from('trip_invites')
      .insert({
        trip_id: tripId,
        email: normalizedEmail,
        status: 'pending',
        created_by: payload.userId,
        created_at: nowIso,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      return NextResponse.json(
        { error: 'Failed to create invite' },
        { status: 500 }
      );
    }

    // Send email
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${tripId}?invite=${invite.id}`;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: email,
      subject: `You've been invited to join "${trip.title}" on TripTally`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You're invited!</h2>
          <p>${payload.name || 'Someone'} has invited you to join a trip on <strong>TripTally</strong>.</p>
          
          <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>${trip.title}</h3>
            <p><strong>Start Date:</strong> ${new Date(trip.start_date).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${new Date(trip.end_date).toLocaleDateString()}</p>
            ${trip.description ? `<p>${trip.description}</p>` : ''}
          </div>
          
          <p>
            <a href="${inviteLink}" style="background: #EFEC07; color: #0F172A; padding: 12px 24px; border-radius: 24px; text-decoration: none; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you don't have a TripTally account, you'll be able to create one when you accept this invitation.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch {
      // Delete invite if email fails
      await supabase.from('trip_invites').delete().eq('id', invite.id);
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${normalizedEmail}`,
      invite,
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
