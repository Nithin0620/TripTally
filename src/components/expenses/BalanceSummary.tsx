/**
 * BalanceSummary Component
 * Displays current balance for each trip member (who owes/is owed money)
 */

'use client';

import { motion } from 'framer-motion';

interface BalanceSummaryProps {
  settlement: any;
}

export default function BalanceSummary({ settlement }: BalanceSummaryProps) {
  if (!settlement || !settlement.balances) {
    return null;
  }

  const balances = settlement.balances as Record<string, number>;
  const entries = Object.entries(balances)
    .map(([userId, balance]) => ({
      userId,
      balance,
      isDebtor: balance < 0, // negative = owed money (creditor)
      isCreditor: balance > 0, // positive = owes money (debtor)
    }))
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

  const totalExpensed = settlement.totalExpensed || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/85 backdrop-blur-md border border-[#cfe0d7] rounded-3xl p-6"
    >
      <h3 className="text-xl font-bold text-[#163427] mb-6">Balance Summary</h3>

      {/* Summary Stats */}
      <div className="mb-6 p-4 bg-white rounded-xl border border-[#d8e7df]">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[#5f7a6c] text-sm">Total Expenses</p>
            <p className="text-2xl font-bold text-[#EFEC07]">₹{totalExpensed.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[#5f7a6c] text-sm">Settlements Needed</p>
            <p className="text-2xl font-bold text-[#163427]">{settlement.settlements?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Balance List */}
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.userId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-3 rounded-xl border ${
              entry.isCreditor
                ? 'bg-red-500/10 border-red-500/20'
                : 'bg-green-500/10 border-green-500/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[#163427] font-medium text-sm">You {entry.isCreditor ? 'owe' : 'get'}</p>
              </div>
              <div className={`font-bold ${entry.isCreditor ? 'text-red-400' : 'text-green-400'}`}>
                ₹{Math.abs(entry.balance).toFixed(2)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Message */}
      <p className="text-xs text-[#7a9186] mt-6 text-center">
        Balances are calculated from all expenses in this trip
      </p>
    </motion.div>
  );
}
