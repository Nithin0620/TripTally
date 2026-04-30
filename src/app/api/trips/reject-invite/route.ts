import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyJWT } from '@/lib/jwt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { inviteId } = await request.json();
    if (!inviteId) {
      return NextResponse.json({ error: 'inviteId is required' }, { status: 400 });
    }

    const { data: invite, error: inviteError } = await supabase
      .from('trip_invites')
      .select('*')
      .eq('id', inviteId)
      .single();

    if (inviteError || !invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (invite.status !== 'pending') {
      return NextResponse.json({ error: `Invite already ${invite.status}` }, { status: 400 });
    }

    if (payload.email.toLowerCase() !== String(invite.email || '').toLowerCase()) {
      return NextResponse.json({ error: 'Invite email does not match authenticated user' }, { status: 403 });
    }

    const { error: updateInviteError } = await supabase
      .from('trip_invites')
      .update({ status: 'rejected' })
      .eq('id', invite.id)
      .eq('status', 'pending');

    if (updateInviteError) {
      return NextResponse.json({ error: updateInviteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invite rejected',
      trip_id: invite.trip_id,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
