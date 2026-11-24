"use client";

import { motion } from "framer-motion";
import NeuCard from "@/components/ui/NeuCard";
import { User } from "@/types";
import { DEFAULT_CURRENCY, formatAmount } from "@/utils/currency";

interface BalanceSummaryProps {
  settlement: any;
  currency?: string;
  currentUserId?: string;
}

export default function BalanceSummary({
  settlement,
  currency,
  currentUserId,
}: BalanceSummaryProps) {
  if (!settlement || !settlement.balances) {
    return null;
  }

  const balances = settlement.balances as Record<string, number>;
  const users = (settlement.users || []) as User[];
  const currencyCode = currency || settlement.currency || DEFAULT_CURRENCY;
  const totalExpensed =
    settlement.summary?.totalExpensed ?? settlement.totalExpensed ?? 0;

  const entries = Object.entries(balances)
    .map(([userId, balance]) => ({
      userId,
      balance,
      isCreditor: balance > 0,
      isDebtor: balance < 0,
      name: users.find(user => user.id === userId)?.name || "Member",
    }))
    .filter(entry => Math.abs(entry.balance) >= 0.01)
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <NeuCard>
        <h3 className="text-xl font-bold text-[#0F172A] mb-6">
          Balance Summary
        </h3>

        <div className="mb-6 neu-inset rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#64748B] text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-brand-blue">
                {formatAmount(totalExpensed, currencyCode)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[#64748B] text-sm">Settlements Needed</p>
              <p className="text-2xl font-bold text-[#0F172A]">
                {settlement.settlements?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {entries.length === 0 ? (
            <p className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm font-semibold text-emerald-700">
              All balances are settled
            </p>
          ) : (
            entries.map((entry, index) => {
              const isCurrent = entry.userId === currentUserId;
              const label = isCurrent
                ? entry.isCreditor
                  ? "You get back"
                  : "You owe"
                : entry.isCreditor
                ? `${entry.name} is owed`
                : `${entry.name} owes`;

              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`rounded-xl p-3 border ${
                    entry.isCreditor
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-red-500/10 border-red-500/20"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-sm text-[#0F172A]">{label}</p>
                    <p
                      className={`font-bold ${
                        entry.isCreditor ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {formatAmount(Math.abs(entry.balance), currencyCode)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        <p className="text-xs text-[#94A3B8] mt-6 text-center">
          Balances include all expenses and recorded settlement payments
        </p>
      </NeuCard>
    </motion.div>
  );
}
