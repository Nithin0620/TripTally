/**
 * Trip Expenses Page
 * Main page for managing expenses, viewing settlement plan, and inviting trip members
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getTripExpenses, calculateTripSettlement } from '@/services/expense.service';
import { useToast } from '@/hooks/useToast';
import AddExpenseModal from '@/components/expenses/AddExpenseModal';
import ExpenseCard from '@/components/expenses/ExpenseCard';
import BalanceSummary from '@/components/expenses/BalanceSummary';
import InviteSection from '@/components/expenses/InviteSection';

interface Params {
  tripId: string;
}

export default function ExpensesPage() {
  const params = useParams() as unknown as Params;
  const tripId = params?.tripId;
  const { showToast } = useToast();

  const [expenses, setExpenses] = useState<any[]>([]);
  const [settlement, setSettlement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);

  useEffect(() => {
    if (!tripId) return;
    loadExpenses();
  }, [tripId]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const { expenses: expenseData, error: expensesError } = await getTripExpenses(tripId);

      if (expensesError) {
        showToast(expensesError, 'error');
        return;
      }

      setExpenses(expenseData);

      // Calculate settlement
      const { data: settlementData, error: settlementError } = await calculateTripSettlement(tripId);

      if (settlementError) {
        console.error('Settlement calculation error:', settlementError);
      } else {
        setSettlement(settlementData);
      }
    } catch (error) {
      console.error('Error loading expenses:', error);
      showToast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    setShowAddExpense(false);
    loadExpenses();
    showToast('Expense added successfully', 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F6FBF8] to-[#E7F3EC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="h-12 w-12 border-4 border-[#EFEC07] border-t-transparent rounded-full" />
          </div>
          <p className="text-[#163427] mt-4">Loading expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F6FBF8] to-[#E7F3EC]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-[#163427] mb-2">Trip Expenses</h1>
          <p className="text-[#5f7a6c]">Manage costs and calculate settlements</p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          <button
            onClick={() => setShowAddExpense(true)}
            className="px-6 py-3 bg-[#EFEC07] text-[#163427] font-semibold rounded-3xl hover:shadow-lg hover:shadow-[#EFEC07]/50 transition-all duration-300"
          >
            + Add Expense
          </button>
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
                <div className="bg-white/80 backdrop-blur-md border border-[#cfe0d7] rounded-3xl p-8 text-center">
                  <p className="text-[#5f7a6c]">No expenses yet. Add one to get started!</p>
                </div>
              ) : (
                expenses.map((expense, index) => (
                  <ExpenseCard
                    key={expense.id}
                    expense={expense}
                    index={index}
                    onUpdate={loadExpenses}
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
            {/* Balance Summary */}
            {settlement && (
              <BalanceSummary settlement={settlement} />
            )}

            {/* Invite Section */}
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
            <div className="bg-white/80 backdrop-blur-md border border-[#cfe0d7] rounded-3xl p-6">
              <h2 className="text-2xl font-bold text-[#163427] mb-6">Settlement Plan</h2>
              <p className="text-[#5f7a6c] mb-6">
                Optimized payment plan to settle all debts with minimum transactions:
              </p>
              <div className="space-y-3">
                {settlement.settlements.map((settlement: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white border border-[#d8e7df] rounded-xl p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-[#163427] font-semibold">
                        {settlement.from_user?.name || settlement.from}
                      </p>
                      <p className="text-[#5f7a6c] text-sm">pays</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[#EFEC07] font-bold text-lg">
                        ₹{settlement.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#163427] font-semibold">
                        {settlement.to_user?.name || settlement.to}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
    </div>
  );
}
