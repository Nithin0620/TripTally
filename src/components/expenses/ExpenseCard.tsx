"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteExpense } from "@/services/expense.service";
import { useToast } from "@/hooks/useToast";
import NeuCard from "@/components/ui/NeuCard";

interface ExpenseCardProps {
  expense: any;
  index: number;
  onUpdate?: () => void;
  onEdit?: (expense: any) => void;
}

export default function ExpenseCard({ expense, index, onUpdate, onEdit }: ExpenseCardProps) {
  const { showToast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      setIsDeleting(true);
      const { error } = await deleteExpense(expense.id);
      if (error) {
        showToast(error, "error");
      } else {
        showToast("Expense deleted successfully", "success");
        onUpdate?.();
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <NeuCard className="!p-0 overflow-hidden">
        {/* Main Content */}
        <div
          className="p-6 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-[#0F172A] mb-1">
                {expense.title}
              </h3>
              <p className="text-[#64748B] text-sm flex items-center gap-2">
                <span>Paid by {expense.users?.name || "Unknown"}</span>
                <span className="text-[#CBD5E1]">•</span>
                <span>{formatDate(expense.created_at)}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-brand-blue">
                {formatCurrency(expense.amount)}
              </p>
              <p className="text-[#64748B] text-xs mt-1 capitalize">
                {expense.split_type} split
              </p>
            </div>
          </div>

          {/* Quick Summary */}
          <div className="mt-4 pt-4 border-t border-white/30 grid grid-cols-2 gap-4">
            <div>
              <p className="text-[#64748B] text-xs mb-1">Amount Paid</p>
              <p className="text-[#0F172A] font-semibold">
                {formatCurrency(expense.amount)}
              </p>
            </div>
            <div>
              <p className="text-[#64748B] text-xs mb-1">Split Among</p>
              <p className="text-[#0F172A] font-semibold">
                {expense.expense_shares?.length || 0} people
              </p>
            </div>
          </div>

          {/* Expand Indicator */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="mt-4"
          >
            <p className="text-brand-blue text-xs font-semibold cursor-pointer">
              {isExpanded ? "▼ Show Less" : "▶ View Details"}
            </p>
          </motion.div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/30 bg-white/20"
            >
              <div className="p-6 space-y-4">
                {/* Notes */}
                {expense.notes && (
                  <div>
                    <p className="text-[#64748B] text-sm mb-2">Notes</p>
                    <div className="neu-inset rounded-xl p-3">
                      <p className="text-[#0F172A]">{expense.notes}</p>
                    </div>
                  </div>
                )}

                {/* Share Breakdown */}
                <div>
                  <p className="text-[#64748B] text-sm mb-3 font-semibold">
                    Share Breakdown
                  </p>
                  <div className="space-y-2">
                    {expense.expense_shares?.map((share: any, idx: number) => (
                      <motion.div
                        key={share.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="rounded-xl bg-white/50 border border-white/40 p-3 flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="text-[#0F172A] font-medium">
                            {share.users?.name || "Unknown User"}
                          </p>
                          <p className="text-[#64748B] text-xs">
                            {share.users?.email || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-brand-blue font-bold">
                            {formatCurrency(share.share_amount)}
                          </p>
                          <p className="text-[#64748B] text-xs">
                            {((share.share_amount / expense.amount) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-white/30">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit?.(expense);
                    }}
                    className="flex-1 px-4 py-2 rounded-xl bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors font-semibold text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50 font-semibold text-sm"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="flex-1 px-4 py-2 rounded-xl bg-white/50 border border-white/40 text-[#0F172A] hover:bg-white/70 transition-colors font-semibold text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </NeuCard>
    </motion.div>
  );
}
