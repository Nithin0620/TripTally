import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inviteId = searchParams.get('inviteId');

    if (!inviteId) {
      return NextResponse.json({ error: 'Invite ID is required' }, { status: 400 });
    }

    const { data: invite, error: inviteError } = await supabase
      .from('trip_invites')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    const isExpired = invite.expires_at && new Date(invite.expires_at).getTime() < Date.now();
    const isAlreadyUsed = invite.status !== 'pending';

    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('id, title, description, start_date, end_date, cover_image')
      .eq('id', invite.trip_id)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const { count: memberCount } = await supabase
      .from('trip_members')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', invite.trip_id);

    return NextResponse.json({
      invite: {
        id: invite.id,
        email: invite.email,
        status: invite.status,
        expires_at: invite.expires_at,
        created_at: invite.created_at,
      },
      trip,
      memberCount: memberCount || 0,
      isExpired,
      isAlreadyUsed,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
