"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { expensesApi } from "@/lib/api/expenses";
import { tripsApi } from "@/lib/api/trips";
import { modalBackdrop, modalContent } from "@/lib/animations";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";

interface EditExpenseModalProps {
  expense: any;
  tripId: string;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

type SplitType = "equal" | "percentage" | "custom";

export default function EditExpenseModal({
  expense,
  tripId,
  onClose,
  onSuccess,
  showToast,
}: EditExpenseModalProps) {
  const [title, setTitle] = useState(expense.title);
  const [amount, setAmount] = useState(String(expense.amount));
  const [category, setCategory] = useState(expense.category || "general");
  const [notes, setNotes] = useState(expense.notes || "");
  const [paidById, setPaidById] = useState(expense.paid_by || "");
  const [splitType, setSplitType] = useState<SplitType>(expense.split_type || "equal");
  const [tripMembers, setTripMembers] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [customShares, setCustomShares] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTripMembers();
  }, [tripId]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const loadTripMembers = async () => {
    try {
      const response = await tripsApi.getTrip(tripId);

      if (response.error || !response.data) return;

      const members = response.data.members || [];
      const users = members
        .map((m: any) => (Array.isArray(m.user) ? m.user[0] : m.user))
        .filter(Boolean)
        .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));

      setTripMembers(users);

      // Pre-select members from existing expense shares
      const existingShares = expense.expense_shares || [];
      const memberIds = existingShares.length > 0
        ? existingShares.map((s: any) => s.user_id)
        : users.map((u: any) => u.id);

      setSelectedMembers(memberIds);

      const pctMap: Record<string, string> = {};
      const customMap: Record<string, string> = {};
      users.forEach((u: any) => {
        const share = existingShares.find((s: any) => s.user_id === u.id);
        pctMap[u.id] = share ? String(((share.share_amount / expense.amount) * 100).toFixed(1)) : "";
        customMap[u.id] = share ? String(share.share_amount) : "";
      });
      setPercentages(pctMap);
      setCustomShares(customMap);
    } catch (err) {
      console.error("Error loading members:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const percentagesObj =
      splitType === "percentage"
        ? Object.fromEntries(
            selectedMembers.map((id) => [id, parseFloat(percentages[id] || "0")])
          )
        : undefined;

    const customSharesObj =
      splitType === "custom"
        ? Object.fromEntries(
            selectedMembers.map((id) => [id, parseFloat(customShares[id] || "0")])
          )
        : undefined;

    const { error } = await expensesApi.updateExpense({
      id: expense.id,
      trip_id: tripId,
      title,
      amount: parseFloat(amount),
      paid_by: paidById,
      split_type: splitType,
      category,
      notes: notes || undefined,
      involved_members: selectedMembers,
      percentages: percentagesObj,
      custom_shares: customSharesObj,
    });

    setSubmitting(false);

    if (error) {
      showToast(error, "error");
    } else {
      showToast("Expense updated!", "success");
      onSuccess();
    }
  };

  if (loading) {
    return (
      <motion.div
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      >
        <div className="text-[#64748B]">Loading...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={modalBackdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="glass-card rounded-3xl p-8">
          <div className="sticky top-0 flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#0F172A]">Edit Expense</h2>
            <button
              onClick={onClose}
              className="text-[#64748B] hover:text-[#0F172A] transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#0F172A]">
                Expense Details
              </h3>
              <NeuInput
                label="Title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Dinner, Hotel, Transport"
              />
              <div className="grid grid-cols-2 gap-4">
                <NeuInput
                  label="Amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  placeholder="0.00"
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#475569]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] transition-all duration-300"
                  >
                    <option value="general">General</option>
                    <option value="food">Food</option>
                    <option value="accommodation">Accommodation</option>
                    <option value="transport">Transport</option>
                    <option value="activities">Activities</option>
                    <option value="shopping">Shopping</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#475569]">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] transition-all duration-300 resize-none"
                  placeholder="Optional notes"
                />
              </div>
            </div>

            {/* Who Paid */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#475569]">
                Who Paid?
              </label>
              <select
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] transition-all duration-300"
              >
                {tripMembers.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Split Type */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#475569]">
                Split Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(["equal", "percentage", "custom"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSplitType(type)}
                    className={`rounded-xl px-4 py-3 font-semibold transition-all duration-300 ${
                      splitType === type
                        ? "neu-inset text-[#0F172A]"
                        : "text-[#64748B] hover:text-[#0F172A] bg-white/50 border border-white/40"
                    }`}
                  >
                    {type === "equal" && "= Equal"}
                    {type === "percentage" && "% Percentage"}
                    {type === "custom" && "$ Custom"}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Selection */}
            <div>
              <label className="mb-3 block text-sm font-semibold text-[#475569]">
                Split Among
              </label>
              <div className="space-y-2">
                {tripMembers.map((member: any) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl bg-white/50 border border-white/40 p-3 cursor-pointer hover:bg-white/70 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(member.id)}
                      onChange={() =>
                        setSelectedMembers((prev) =>
                          prev.includes(member.id)
                            ? prev.filter((id) => id !== member.id)
                            : [...prev, member.id]
                        )
                      }
                      className="h-5 w-5 rounded accent-brand-blue cursor-pointer"
                    />
                    <span className="text-[#0F172A]">{member.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Split Details */}
            <AnimatePresence>
              {splitType === "percentage" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-[#475569] font-semibold">
                    Enter percentage for each member:
                  </p>
                  {selectedMembers.map((memberId) => {
                    const member = tripMembers.find((m: any) => m.id === memberId);
                    return (
                      <div key={memberId} className="flex items-center gap-3">
                        <span className="text-[#0F172A] flex-1">
                          {member?.name || "Unknown"}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={percentages[memberId] || ""}
                            onChange={(e) =>
                              setPercentages({ ...percentages, [memberId]: e.target.value })
                            }
                            className="neu-input w-20 rounded-lg px-2 py-2 text-[#0F172A] text-right"
                          />
                          <span className="text-[#64748B]">%</span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}

              {splitType === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <p className="text-sm text-[#475569] font-semibold">
                    Enter amount for each member:
                  </p>
                  {selectedMembers.map((memberId) => {
                    const member = tripMembers.find((m: any) => m.id === memberId);
                    return (
                      <div key={memberId} className="flex items-center gap-3">
                        <span className="text-[#0F172A] flex-1">
                          {member?.name || "Unknown"}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={customShares[memberId] || ""}
                            onChange={(e) =>
                              setCustomShares({ ...customShares, [memberId]: e.target.value })
                            }
                            className="neu-input w-24 rounded-lg px-2 py-2 text-[#0F172A] text-right"
                          />
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/30">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                onClick={undefined}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
