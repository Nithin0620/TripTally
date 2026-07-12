"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { getTripExpenses, calculateTripSettlement } from "@/services/expense.service";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import NeuCard from "@/components/ui/NeuCard";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import EditExpenseModal from "@/components/expenses/EditExpenseModal";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import BalanceSummary from "@/components/expenses/BalanceSummary";
import InviteSection from "@/components/expenses/InviteSection";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

export default function ExpensesPage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const { toasts, showToast, removeToast } = useToast();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  useEffect(() => {
    if (!tripId) return;
    loadExpenses();
  }, [tripId]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const { expenses: expenseData, error: expensesError } =
        await getTripExpenses(tripId);

      if (expensesError) {
        showToast(expensesError, "error");
        return;
      }

      setExpenses(expenseData);

      const { data: settlementData, error: settlementError } =
        await calculateTripSettlement(tripId);

      if (settlementError) {
        console.error("Settlement calculation error:", settlementError);
      } else {
        setSettlement(settlementData);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
      showToast("Failed to load expenses", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    setShowAddExpense(false);
    loadExpenses();
    showToast("Expense added successfully", "success");
  };

  if (loading) {
    return <LoadingSpinner text="Loading expenses..." />;
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 py-24">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mb-8"
        >
          <h1 className="text-4xl font-black text-[#0F172A] mb-2">
            Trip Expenses
          </h1>
          <p className="text-[#64748B]">
            Manage costs and calculate settlements
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          <Button variant="primary" onClick={() => setShowAddExpense(true)}>
            + Add Expense
          </Button>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expenses List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              {expenses.length === 0 ? (
                <EmptyState
                  icon="💰"
                  title="No expenses yet"
                  description="Add one to get started!"
                  actionLabel="Add Expense"
                  onAction={() => setShowAddExpense(true)}
                />
              ) : (
                expenses.map((expense, index) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    index={index}
                    onUpdate={loadExpenses}
                    onEdit={(exp) => setEditingExpense(exp)}
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {settlement && <BalanceSummary settlement={settlement} />}
            <InviteSection tripId={tripId} onInviteSent={() => {}} />
          </motion.div>
        </div>

        {/* Settlement Plan */}
        {settlement?.settlements && settlement.settlements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8"
          >
            <NeuCard>
              <h2 className="text-2xl font-bold text-[#0F172A] mb-6">
                Settlement Plan
              </h2>
              <p className="text-[#64748B] mb-6">
                Optimized payment plan to settle all debts with minimum
                transactions:
              </p>
              <div className="space-y-3">
                {settlement.settlements.map(
                  (s: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="rounded-xl bg-white/50 border border-white/40 p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="text-[#0F172A] font-semibold">
                          {s.from_user?.name || s.from}
                        </p>
                        <p className="text-[#64748B] text-sm">pays</p>
                      </div>
                      <div className="text-center">
                        <p className="text-brand-blue font-bold text-lg">
                          ${s.amount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#0F172A] font-semibold">
                          {s.to_user?.name || s.to}
                        </p>
                      </div>
                    </motion.div>
                  )
                )}
              </div>
            </NeuCard>
          </motion.div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          tripId={tripId}
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={handleExpenseAdded}
        />
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          tripId={tripId}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => {
            setEditingExpense(null);
            loadExpenses();
          }}
          showToast={showToast}
        />
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
