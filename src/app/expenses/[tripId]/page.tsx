"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getTripExpenses, calculateTripSettlement } from "@/services/expense.service";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/contexts/AuthContext";
import { useRealtimeTrip } from "@/hooks/useRealtimeTrip";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import EditExpenseModal from "@/components/expenses/EditExpenseModal";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import ExpenseSearchFilter from "@/components/expenses/ExpenseSearchFilter";
import BalanceSummary from "@/components/expenses/BalanceSummary";
import InviteSection from "@/components/expenses/InviteSection";
import RealtimePresence from "@/components/trips/RealtimePresence";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Receipt,
  Users,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function ExpensesPage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const { toasts, showToast, removeToast } = useToast();
  const { user } = useAuth();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const { expenses: expenseData, error: expensesError } = await getTripExpenses(tripId);

      if (expensesError) {
        showToast(expensesError, "error");
        return;
      }

      setExpenses(expenseData || []);
      setFilteredExpenses(expenseData || []);

      const { data: settlementData, error: settlementError } = await calculateTripSettlement(tripId);
      if (!settlementError && settlementData) {
        setSettlement(settlementData);
      }
    } catch (error) {
      console.error("Error loading expenses:", error);
      showToast("Failed to load expenses", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseChange = useCallback(() => {
    loadExpenses();
  }, [tripId]);

  const { onlineMembers, isConnected } = useRealtimeTrip({
    tripId,
    userId: user?.id,
    userName: user?.name || user?.email,
    onExpenseChange: handleExpenseChange,
  });

  const handleExpenseAdded = () => {
    setShowAddExpense(false);
    loadExpenses();
    showToast("Expense added successfully", "success");
  };

  useEffect(() => {
    if (!tripId) return;
    loadExpenses();
  }, [tripId]);

  const totalSpent = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Top Breadcrumb & Presence */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/trips/${tripId}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Trip Overview</span>
        </Link>

        <RealtimePresence
          onlineMembers={onlineMembers}
          isConnected={isConnected}
          currentUserId={user?.id}
        />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200/80 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Financial Ledger & Split Center
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trip Expenses & Settlement
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Track who paid, split bills equally or customly, and settle group balances.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddExpense(true)}
          className="gap-2 text-xs font-bold py-2.5 px-5 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Expense</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Group Spend</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Logged Receipts</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{expenses.length} bills</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Settlement Route</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">
            {settlement?.settlements?.length || 0} transfers
          </span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Expense List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-slate-900">Recorded Expenses</h2>
            <span className="text-xs font-semibold text-slate-500">{expenses.length} total entries</span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-24 w-full rounded-2xl" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <EmptyState
              title="No expenses logged yet"
              description="Keep group finances clear and fair. Add your first restaurant bill, rental car, or hotel cost."
              actionLabel="+ Add First Expense"
              onAction={() => setShowAddExpense(true)}
            />
          ) : (
            <>
              <ExpenseSearchFilter expenses={expenses} onFilter={setFilteredExpenses} />
              {filteredExpenses.length > 0 ? (
                <div className="space-y-3">
                  {filteredExpenses.map((expense, index) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      index={index}
                      onUpdate={loadExpenses}
                      onEdit={(exp) => setEditingExpense(exp)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 bg-white/50 text-slate-500">
                  <p className="text-sm font-semibold">No expenses match your search query</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right 1 Col: Balance & Invite Sidebar */}
        <div className="space-y-6">
          {settlement && <BalanceSummary settlement={settlement} />}
          <InviteSection tripId={tripId} onInviteSent={() => {}} />
        </div>
      </div>

      {/* Debt Settlement Matrix */}
      {settlement?.settlements && settlement.settlements.length > 0 && (
        <div className="mt-12 rounded-3xl border border-slate-200/90 bg-white/95 p-6 sm:p-8 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Optimized Settlement Plan</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Minimal transfer route computed to settle all debts with zero circular payments.
              </p>
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              Algorithm: Greedy Flow
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settlement.settlements.map((s: any, index: number) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    💸
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                      <strong className="text-slate-800">{s.from_user?.name || s.from}</strong>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <strong className="text-slate-800">{s.to_user?.name || s.to}</strong>
                    </div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">
                      ${s.amount.toFixed(2)}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                  Pending Transfer
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
