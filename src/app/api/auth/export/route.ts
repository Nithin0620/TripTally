// ============================================
// GET /api/auth/export
// GDPR data export for the authenticated user (JSON download).
// Password hashes and auth tokens are intentionally excluded.
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { authenticateUser, serverErrorResponse, unauthorizedResponse } from '@/middleware/auth';

function isMissingTableOrColumn(code?: string): boolean {
  return code === 'PGRST205' || code === '42P01' || code === 'PGRST204';
}

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if (!auth.authenticated || !auth.user) return unauthorizedResponse();

  const dbClient = supabaseAdmin ?? supabase;
  const userId = auth.user.userId;

  const selectBy = async (
    table: string,
    column: string,
    value: string | string[]
  ): Promise<any[]> => {
    const query = dbClient.from(table).select('*') as any;
    const { data, error } = Array.isArray(value)
      ? await query.in(column, value)
      : await query.eq(column, value);

    if (error) {
      if (!isMissingTableOrColumn(error.code)) {
        console.error(`Data export error for ${table}:`, error);
      }
      return [];
    }

    return data || [];
  };

  try {
    const [profile, memberships, ownedTrips, templates, notifications, invitesSent, invitesToEmail] =
      await Promise.all([
        selectBy('users', 'id', userId),
        selectBy('trip_members', 'user_id', userId),
        selectBy('trips', 'created_by', userId),
        selectBy('templates', 'created_by', userId),
        selectBy('notifications', 'user_id', userId),
        selectBy('trip_invites', 'created_by', userId),
        dbClient
          .from('users')
          .select('email')
          .eq('id', userId)
          .single()
          .then(async ({ data }) =>
            data?.email ? selectBy('trip_invites', 'email', data.email) : []
          ),
      ]);

    const tripIds = Array.from(
      new Set([
        ...ownedTrips.map((trip: any) => trip.id),
        ...memberships.map((membership: any) => membership.trip_id),
      ])
    ).filter(Boolean) as string[];

    const tripScoped = async (table: string): Promise<any[]> =>
      tripIds.length ? selectBy(table, 'trip_id', tripIds) : [];

    const [tripRows, tripMembers, activities, expenses, shares, settlementsFrom, settlementsTo, messages] =
      await Promise.all([
        tripIds.length ? selectBy('trips', 'id', tripIds) : Promise.resolve([]),
        tripScoped('trip_members'),
        tripScoped('activities'),
        tripScoped('expenses'),
        selectBy('expense_shares', 'user_id', userId),
        selectBy('settlement_payments', 'from_user_id', userId),
        selectBy('settlement_payments', 'to_user_id', userId),
        tripScoped('trip_messages'),
      ]);

    const expenseIds = Array.from(
      new Set([
        ...expenses.map((expense: any) => expense.id),
        ...shares.map((share: any) => share.expense_id),
      ])
    ).filter(Boolean) as string[];

    const receipts = expenseIds.length
      ? await selectBy('receipts', 'expense_id', expenseIds)
      : [];

    const uniqueById = (rows: any[]) =>
      Array.from(new Map(rows.map((row) => [row.id, row])).values());

    const exportData = {
      exported_at: new Date().toISOString(),
      user: profile[0] || null,
      trips: tripRows,
      trip_members: tripMembers,
      activities,
      expenses,
      expense_shares: shares,
      receipts,
      settlement_payments: uniqueById([...settlementsFrom, ...settlementsTo]),
      trip_messages: messages,
      trip_invites: uniqueById([...invitesSent, ...invitesToEmail]),
      notifications,
      templates,
    };

    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="triptally-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Data export error:', error);
    return serverErrorResponse('Failed to export account data');
  }
}
