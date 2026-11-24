import { supabaseAdmin } from '@/lib/supabase';
import { Settlement, SettlementPayment, User } from '@/types';
import { calculateUserBalances } from '@/utils/splitCalculator';
import { optimizeSettlements, validateSettlement } from '@/utils/settlementOptimizer';
import { convertAmount, DEFAULT_CURRENCY, formatAmount } from '@/utils/currency';
import { createNotification } from './notification.service';

async function getTripFinanceMeta(tripId: string): Promise<{ title: string; currency: string }> {
  const { data } = await supabaseAdmin
    .from('trips')
    .select('title, currency')
    .eq('id', tripId)
    .single();

  return {
    title: data?.title || 'Trip',
    currency: data?.currency || DEFAULT_CURRENCY,
  };
}

export async function calculateTripSettlements(tripId: string) {
  try {
    const { data: members, error: membersError } = await supabaseAdmin
      .from('trip_members')
      .select('user_id, users(id, name, email, profile_image)')
      .eq('trip_id', tripId);

    if (membersError || !members) {
      return emptySettlementResult('Failed to fetch trip members');
    }

    const memberIds = members.map(m => m.user_id);
    const userMap: Record<string, User> = {};

    for (const member of members) {
      const userData = member.users;
      if (userData && !Array.isArray(userData)) {
        userMap[(userData as any).id] = userData as User;
      }
    }

    const { data: expenses, error: expensesError } = await supabaseAdmin
      .from('expenses')
      .select(
        `
        id,
        paid_by,
        amount,
        currency,
        exchange_rate,
        expense_shares(user_id, share_amount)
      `
      )
      .eq('trip_id', tripId);

    if (expensesError || !expenses) {
      return emptySettlementResult('Failed to fetch expenses');
    }

    const { title, currency } = await getTripFinanceMeta(tripId);
    let totalExpensed = 0;

    const expenseData = expenses.map(exp => {
      const convertedAmount = convertAmount(
        Number(exp.amount),
        exp.currency,
        exp.exchange_rate,
        currency
      );
      totalExpensed += convertedAmount;

      return {
        id: exp.id,
        paid_by: exp.paid_by,
        amount: convertedAmount,
        shares: exp.expense_shares.reduce(
          (acc: Record<string, number>, share: any) => {
            acc[share.user_id] = share.share_amount;
            return acc;
          },
          {}
        ),
      };
    });

    const balances = calculateUserBalances(expenseData, memberIds);

    let payments: SettlementPayment[] = [];
    try {
      const { data: paymentsData, error: paymentsError } = await supabaseAdmin
        .from('settlement_payments')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });

      if (!paymentsError && paymentsData) {
        payments = paymentsData.map((p: any) => ({
          ...p,
          status: p.status || 'completed',
          from_user: userMap[p.from_user_id],
          to_user: userMap[p.to_user_id],
        })) as SettlementPayment[];

        for (const payment of payments) {
          if (payment.status !== 'completed') continue;
          const paidAmount = convertAmount(
            Number(payment.amount),
            payment.currency,
            null,
            currency
          );
          if (balances[payment.from_user_id] !== undefined) {
            balances[payment.from_user_id] += paidAmount;
          }
          if (balances[payment.to_user_id] !== undefined) {
            balances[payment.to_user_id] -= paidAmount;
          }
        }
      }
    } catch (err) {
      console.warn('Could not query settlement_payments table:', err);
    }

    if (!validateSettlement(balances)) {
      console.warn('Settlement validation failed - balances do not sum to zero');
    }

    const settlements: Settlement[] = optimizeSettlements(balances).map(settlement => ({
      ...settlement,
      status: 'pending' as const,
      from_user: userMap[settlement.from_user_id],
      to_user: userMap[settlement.to_user_id],
    }));

    for (const key of Object.keys(balances)) {
      balances[key] = Math.round(balances[key] * 100) / 100;
    }

    return {
      settlements,
      error: null,
      balances,
      payments,
      totalExpensed: Math.round(totalExpensed * 100) / 100,
      currency,
      title,
      users: Object.values(userMap),
    };
  } catch (error) {
    console.error('Error calculating settlements:', error);
    return emptySettlementResult('Failed to calculate settlements');
  }
}

function emptySettlementResult(error: string) {
  return {
    settlements: [] as Settlement[],
    error,
    balances: {} as Record<string, number>,
    payments: [] as SettlementPayment[],
    totalExpensed: 0,
    currency: DEFAULT_CURRENCY,
    title: 'Trip',
    users: [] as User[],
  };
}

export async function recordSettlementPayment(data: {
  trip_id: string;
  from_user_id: string;
  to_user_id: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  notes?: string;
  status?: SettlementPayment['status'];
  created_by: string;
}) {
  try {
    const { data: payment, error } = await supabaseAdmin
      .from('settlement_payments')
      .insert({
        trip_id: data.trip_id,
        from_user_id: data.from_user_id,
        to_user_id: data.to_user_id,
        amount: data.amount,
        currency: data.currency || DEFAULT_CURRENCY,
        payment_method: data.payment_method || 'other',
        notes: data.notes || null,
        status: data.status || 'completed',
        created_by: data.created_by,
      })
      .select()
      .single();

    if (error) {
      return { payment: null, error: error.message };
    }
    return { payment: payment as SettlementPayment, error: null };
  } catch (error) {
    console.error('Error recording settlement payment:', error);
    return { payment: null, error: 'Failed to record settlement payment' };
  }
}

export async function deleteSettlementPayment(tripId: string, paymentId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('settlement_payments')
      .delete()
      .eq('id', paymentId)
      .eq('trip_id', tripId);

    if (error) {
      return { error: error.message };
    }
    return { error: null };
  } catch (error) {
    console.error('Error deleting settlement payment:', error);
    return { error: 'Failed to delete payment' };
  }
}

export async function notifySettlementPayment(tripId: string, payment: SettlementPayment) {
  try {
    const { title, currency } = await getTripFinanceMeta(tripId);
    const amount = formatAmount(Number(payment.amount), payment.currency || currency);

    const { error } = await createNotification(payment.to_user_id, {
      type: 'settlement_updated',
      title: 'Settlement payment recorded',
      message: `${amount} was recorded toward your balance in ${title}.`,
      trip_id: tripId,
      data: {
        paymentId: payment.id,
        amount: Number(payment.amount),
        currency: payment.currency || currency,
      },
    });

    return { error };
  } catch (error) {
    console.error('Error notifying settlement payment:', error);
    return { error: 'Failed to notify settlement payment' };
  }
}

export async function sendPaymentReminders(
  tripId: string,
  options?: { excludeUserIds?: string[] }
) {
  const { balances, error, currency, title } = await calculateTripSettlements(tripId);
  if (error) {
    return { count: 0, error };
  }

  const excluded = new Set(options?.excludeUserIds || []);
  const debtors = Object.entries(balances).filter(
    ([userId, balance]) => !excluded.has(userId) && balance < -0.01
  );

  let count = 0;
  let firstError: string | null = null;

  for (const [userId, balance] of debtors) {
    const amount = Math.abs(balance);
    const { error: notificationError } = await createNotification(userId, {
      type: 'payment_reminder',
      title: 'Payment reminder',
      message: `You still owe ${formatAmount(amount, currency)} in ${title}. Settle up when you are ready.`,
      trip_id: tripId,
      data: { amount, currency },
    });

    if (notificationError) {
      firstError = firstError || notificationError;
    } else {
      count += 1;
    }
  }

  return { count, error: firstError };
}

export async function getUserTripBalance(tripId: string, userId: string) {
  const { balances, error } = await calculateTripSettlements(tripId);
  return { balance: balances[userId] || 0, error };
}

export async function getTripBalances(tripId: string) {
  const { balances, error } = await calculateTripSettlements(tripId);
  return { balances, error };
}
