"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { settlementApi } from "@/lib/api/misc";
import { modalBackdrop, modalContent } from "@/lib/animations";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import { CheckCircle2, DollarSign, X, ArrowRight, CreditCard, Banknote, Smartphone } from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  currency: string;
  defaultFromUserId?: string;
  defaultToUserId?: string;
  defaultAmount?: number;
  members: any[];
  onPaymentRecorded: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function RecordPaymentModal({
  isOpen,
  onClose,
  tripId,
  currency,
  defaultFromUserId,
  defaultToUserId,
  defaultAmount,
  members,
  onPaymentRecorded,
  showToast,
}: RecordPaymentModalProps) {
  const [fromUserId, setFromUserId] = useState(defaultFromUserId || (members[0]?.user?.id || ""));
  const [toUserId, setToUserId] = useState(defaultToUserId || (members[1]?.user?.id || ""));
  const [amount, setAmount] = useState(defaultAmount ? String(defaultAmount) : "");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast("Please enter a valid payment amount", "error");
      return;
    }

    if (fromUserId === toUserId) {
      showToast("Payer and receiver cannot be the same person", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await settlementApi.recordPayment(tripId, {
        from_user_id: fromUserId,
        to_user_id: toUserId,
        amount: parsedAmount,
        currency,
        payment_method: paymentMethod,
        notes: notes.trim(),
      });

      if (res.error) {
        showToast(res.error, "error");
        return;
      }

      showToast("Payment recorded successfully! Balances updated.", "success");
      onPaymentRecorded();
      onClose();
    } catch {
      showToast("Failed to record payment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    { id: "upi", label: "UPI / GPay", icon: Smartphone },
    { id: "cash", label: "Cash", icon: Banknote },
    { id: "bank_transfer", label: "Bank Transfer", icon: CreditCard },
    { id: "other", label: "Other", icon: DollarSign },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/95 p-6 shadow-2xl backdrop-blur-xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Settle Up Payment</h3>
                <p className="text-xs text-slate-500">Record debt payment between members</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payer and Receiver Row */}
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Who Paid?</label>
                <select
                  value={fromUserId}
                  onChange={(e) => setFromUserId(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {members.map((m) => {
                    const u = m.user || m;
                    return (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Paid To?</label>
                <select
                  value={toUserId}
                  onChange={(e) => setToUserId(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {members.map((m) => {
                    const u = m.user || m;
                    return (
                      <option key={u.id} value={u.id}>
                        {u.name || u.email}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Amount ({currency})
              </label>
              <NeuInput
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50/80 text-blue-700 shadow-sm"
                          : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span>{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Note / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. UPI Ref #893247"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
