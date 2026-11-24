// ============================================
// One-time auth tokens (email verification / password reset)
// Only SHA-256 hashes are persisted; raw tokens only exist in emails.
// ============================================

import { createHash, randomBytes } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export type AuthTokenType = 'email_verification' | 'password_reset';

const TOKEN_LIFETIME_MS: Record<AuthTokenType, number> = {
  email_verification: 24 * 60 * 60 * 1000,
  password_reset: 60 * 60 * 1000,
};

export function hashAuthToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function issueAuthToken(
  userId: string,
  type: AuthTokenType
): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS[type]).toISOString();

  await supabaseAdmin
    .from('auth_tokens')
    .update({ used_at: now })
    .eq('user_id', userId)
    .eq('type', type)
    .is('used_at', null);

  const { error } = await supabaseAdmin.from('auth_tokens').insert({
    user_id: userId,
    token_hash: hashAuthToken(token),
    type,
    expires_at: expiresAt,
  });

  if (error) {
    console.error('Issue auth token error:', error);
    throw new Error('Failed to issue auth token');
  }

  return token;
}

export async function consumeAuthToken(
  token: string,
  type: AuthTokenType
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const { data, error } = await supabaseAdmin
    .from('auth_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('token_hash', hashAuthToken(token))
    .eq('type', type)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .select('user_id')
    .single();

  if (error || !data?.user_id) {
    return { ok: false, error: 'Invalid or expired token' };
  }

  return { ok: true, userId: data.user_id };
}

export async function revokeAuthTokens(
  userId: string,
  type?: AuthTokenType
): Promise<void> {
  let query = supabaseAdmin
    .from('auth_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('used_at', null);

  if (type) {
    query = query.eq('type', type);
  }

  const { error } = await query;
  if (error) {
    console.error('Revoke auth tokens error:', error);
  }
}
