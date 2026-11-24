"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { expensesApi } from "@/lib/api/expenses";
import { tripsApi } from "@/lib/api/trips";
import { useToast } from "@/hooks/useToast";
import { modalBackdrop, modalContent } from "@/lib/animations";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";

interface AddExpenseModalProps {
  tripId: string;
  onClose: () => void;
  onExpenseAdded: () => void;
}

type SplitType = "equal" | "percentage" | "custom";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
}

export default function AddExpenseModal({
  tripId,
  onClose,
  onExpenseAdded,
}: AddExpenseModalProps) {
  const { showToast } = useToast();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState("");
  const [splitType, setSplitType] = useState<SplitType>("equal");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState("general");

  const [tripMembers, setTripMembers] = useState<CurrentUser[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [percentages, setPercentages] = useState<Record<string, string>>({});
  const [customShares, setCustomShares] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTripMembers();
  }, [tripId]);

  const loadTripMembers = async () => {
    try {
      const response = await tripsApi.getTrip(tripId);

      if (response.error || !response.data) {
        showToast("Failed to load trip members", "error");
        return;
      }

      const members = response.data.members || [];
      const users: CurrentUser[] = members
        .map((m: any) => (Array.isArray(m.user) ? m.user[0] : m.user))
        .filter(Boolean)
        .sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));

      setTripMembers(users);

      if (users.length > 0) {
        setPaidById(users[0].id);
        setSelectedMembers(users.map((u: CurrentUser) => u.id));

        const emptyPercentages: Record<string, string> = {};
        const emptyCustom: Record<string, string> = {};
        users.forEach((u: CurrentUser) => {
          emptyPercentages[u.id] = "";
          emptyCustom[u.id] = "";
        });
        setPercentages(emptyPercentages);
        setCustomShares(emptyCustom);
      }
    } catch (error) {
      console.error("Error loading trip members:", error);
      showToast("Failed to load trip members", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!amount || parseFloat(amount) <= 0)
      newErrors.amount = "Amount must be greater than 0";
    if (!paidById) newErrors.paidById = "Payer must be selected";
    if (selectedMembers.length === 0)
      newErrors.selectedMembers = "Select at least one member";

    if (splitType === "percentage") {
      const total = selectedMembers.reduce((sum, id) => {
        return sum + (parseFloat(percentages[id] || "0") || 0);
      }, 0);
      if (Math.abs(total - 100) > 0.01) {
        newErrors.percentages = `Percentages must sum to 100% (current: ${total.toFixed(1)}%)`;
      }
    }

    if (splitType === "custom") {
      const total = selectedMembers.reduce((sum, id) => {
        return sum + (parseFloat(customShares[id] || "0") || 0);
      }, 0);
      if (Math.abs(total - parseFloat(amount)) > 0.01) {
        newErrors.customShares = `Amounts must sum to $${parseFloat(amount).toFixed(
          2
        )} (current: $${total.toFixed(2)})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix the errors below", "error");
      return;
    }

    try {
      setSubmitting(true);

      const percentagesObj =
        splitType === "percentage"
          ? Object.fromEntries(
              selectedMembers.map((id) => [
                id,
                parseFloat(percentages[id] || "0"),
              ])
            )
          : undefined;

      const customSharesObj =
        splitType === "custom"
          ? Object.fromEntries(
              selectedMembers.map((id) => [
                id,
                parseFloat(customShares[id] || "0"),
              ])
            )
          : undefined;

      const response = await expensesApi.createExpense({
        trip_id: tripId,
        title,
        amount: parseFloat(amount),
        paid_by: paidById,
        split_type: splitType,
        involved_members: selectedMembers,
        percentages: percentagesObj,
        custom_shares: customSharesObj,
        notes: notes || undefined,
        category,
      });

      if (response.error) {
        showToast(response.error, "error");
        return;
      }

      showToast("Expense created successfully", "success");
      onExpenseAdded();
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const getMemberName = (id: string) => {
    return tripMembers.find((m) => m.id === id)?.name || "Unknown";
  };

  if (loading) {
    return (
      <motion.div
        variants={modalBackdrop}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
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
        className="glass-card rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 glass-card rounded-t-3xl z-10 p-6 border-b border-white/30">
          <h2 className="text-2xl font-bold text-[#0F172A]">
            Add New Expense
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#0F172A]">
              Expense Details
            </h3>

            <div>
              <NeuInput
                label="Title *"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Dinner, Hotel, Transport"
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <NeuInput
                  label="Amount *"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-red-400 text-xs mt-1">{errors.amount}</p>
                )}
              </div>

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
                placeholder="Add any notes about this expense..."
                rows={2}
                className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] transition-all duration-300 resize-none"
              />
            </div>
          </div>

          {/* Who Paid */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#475569]">
              Who Paid? *
            </label>
            <select
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] transition-all duration-300"
            >
              <option value="">Select person</option>
              {tripMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
            {errors.paidById && (
              <p className="text-red-400 text-xs mt-1">{errors.paidById}</p>
            )}
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
              Split Among *
            </label>
            <div className="space-y-2">
              {tripMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 rounded-xl bg-white/50 border border-white/40 p-3 cursor-pointer hover:bg-white/70 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                    className="h-5 w-5 rounded accent-brand-blue cursor-pointer"
                  />
                  <span className="text-[#0F172A]">{member.name}</span>
                </label>
              ))}
            </div>
            {errors.selectedMembers && (
              <p className="text-red-400 text-xs mt-2">
                {errors.selectedMembers}
              </p>
            )}
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
                {selectedMembers.map((memberId) => (
                  <div key={memberId} className="flex items-center gap-3">
                    <span className="text-[#0F172A] flex-1">
                      {getMemberName(memberId)}
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={percentages[memberId]}
                        onChange={(e) =>
                          setPercentages({
                            ...percentages,
                            [memberId]: e.target.value,
                          })
                        }
                        placeholder="0"
                        className="neu-input w-20 rounded-lg px-2 py-2 text-[#0F172A] text-right"
                      />
                      <span className="text-[#64748B]">%</span>
                    </div>
                  </div>
                ))}
                {errors.percentages && (
                  <p className="text-red-400 text-xs">{errors.percentages}</p>
                )}
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
                {selectedMembers.map((memberId) => (
                  <div key={memberId} className="flex items-center gap-3">
                    <span className="text-[#0F172A] flex-1">
                      {getMemberName(memberId)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#64748B]">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={customShares[memberId]}
                        onChange={(e) =>
                          setCustomShares({
                            ...customShares,
                            [memberId]: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        className="neu-input w-24 rounded-lg px-2 py-2 text-[#0F172A] text-right"
                      />
                    </div>
                  </div>
                ))}
                {errors.customShares && (
                  <p className="text-red-400 text-xs">{errors.customShares}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-white/30">
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
              {submitting ? "Creating..." : "Create Expense"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
