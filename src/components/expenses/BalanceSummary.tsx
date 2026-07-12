"use client";

import { motion } from "framer-motion";
import NeuCard from "@/components/ui/NeuCard";

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
      isCreditor: balance < 0,
      isDebtor: balance > 0,
    }))
    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance));

  const totalExpensed = settlement.totalExpensed || 0;

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

        {/* Summary Stats */}
        <div className="mb-6 neu-inset rounded-2xl p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[#64748B] text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-brand-blue">
                ${totalExpensed.toFixed(2)}
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

        {/* Balance List */}
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.userId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`rounded-xl p-3 border ${
                entry.isCreditor
                  ? "bg-red-500/10 border-red-500/20"
                  : "bg-green-500/10 border-green-500/20"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[#0F172A] font-medium text-sm">
                    You {entry.isCreditor ? "owe" : "get"}
                  </p>
                </div>
                <div
                  className={`font-bold ${
                    entry.isCreditor ? "text-red-500" : "text-green-500"
                  }`}
                >
                  ${Math.abs(entry.balance).toFixed(2)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-[#94A3B8] mt-6 text-center">
          Balances are calculated from all expenses in this trip
        </p>
      </NeuCard>
    </motion.div>
  );
}
