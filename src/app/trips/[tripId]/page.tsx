"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { tripsApi, activitiesApi, expensesApi, settlementApi } from "@/lib/api";
import { Trip, Activity, Expense, Settlement } from "@/types";
import { fadeInUp } from "@/lib/animations";
import Link from "next/link";

export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'activities' | 'expenses' | 'settlement'>('activities');
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

   const loadTripData = async () => {
      setLoading(true);
      const response = await tripsApi.getTripById(tripId);
      
      if (response.error) {
        showToast(response.error, 'error');
        router.push('/dashboard');
      } else if (response.data) {
        setTrip(response.data.trip);
        setActivities(response.data.activities || []);
        setExpenses(response.data.expenses || []);
      }
      
      setLoading(false);
    };

    if (tripId) {
      loadTripData();
    }
  }, [tripId, user]);

  const loadSettlement = async () => {
    const response = await settlementApi.getSettlement(tripId);
    if (response.data?.settlements) {
      setSettlements(response.data.settlements);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm('Delete this activity?')) return;
    
    const response = await activitiesApi.deleteActivity(activityId);
    if (response.error) {
      showToast(response.error, 'error');
    } else {
      setActivities(activities.filter(a => a.id !== activityId));
      showToast('Activity deleted', 'success');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Delete this expense?')) return;
    
    const response = await expensesApi.deleteExpense(expenseId);
    if (response.error) {
      showToast(response.error, 'error');
    } else {
      setExpenses(expenses.filter(e => e.id !== expenseId));
      showToast('Expense deleted', 'success');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl font-bold text-[#163427]">Loading trip...</div>
      </div>
    );
  }

  if (!trip) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <div className="min-h-screen bg-brand-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/dashboard" className="mb-4 inline-flex items-center text-sm text-[#5f7a6c] hover:text-[#163427]">
              ← Back to Dashboard
            </Link>
            
            <div className="relative h-64 overflow-hidden rounded-3xl">
              <img
                src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80'}
                alt={trip.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-brand-bg/50 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h1 className="text-5xl font-black text-white">{trip.title}</h1>
                <p className="mt-2 text-lg text-white/90">
                  {new Date(trip.start_date).toLocaleDateString()} → {new Date(trip.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="mt-6 text-lg text-[#4f6f5e]">{trip.description || 'No description'}</p>
          </motion.div>

          {/* Stats */}
          <div className="mb-8 grid gap-6 md:grid-cols-3">
            <GlassCard className="p-6">
              <p className="mb-2 text-sm text-[#5f7a6c]">Activities</p>
              <p className="text-3xl font-bold text-[#163427]">{activities.length}</p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="mb-2 text-sm text-[#5f7a6c]">Total Expenses</p>
              <p className="text-3xl font-bold text-[#163427]">${totalExpenses.toFixed(2)}</p>
            </GlassCard>
            <GlassCard className="p-6">
              <p className="mb-2 text-sm text-[#5f7a6c]">Settlements</p>
              <p className="text-3xl font-bold text-[#163427]">{settlements.length}</p>
            </GlassCard>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setActiveTab('activities')}
              className={`rounded-xl px-6 py-3 font-semibold transition ${
                activeTab === 'activities'
                    ? 'bg-brand-accent text-brand-text'
                    : 'bg-brand-surface text-brand-text hover:bg-brand-surface/80'
              }`}
            >
              Activities
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`rounded-xl px-6 py-3 font-semibold transition ${
                activeTab === 'expenses'
                    ? 'bg-brand-accent text-brand-text'
                    : 'bg-brand-surface text-brand-text hover:bg-brand-surface/80'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => {
                setActiveTab('settlement');
                loadSettlement();
              }}
              className={`rounded-xl px-6 py-3 font-semibold transition ${
                activeTab === 'settlement'
                    ? 'bg-brand-accent text-brand-text'
                    : 'bg-brand-surface text-brand-text hover:bg-brand-surface/80'
              }`}
            >
              Settlement
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'activities' && (
              <motion.div
                key="activities"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#163427]">Activities</h2>
                  <Button onClick={() => setShowAddActivity(true)}>+ Add Activity</Button>
                </div>

                {activities.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <p className="text-[#5f7a6c]">No activities yet. Add your first activity!</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <GlassCard key={activity.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-[#163427]">{activity.title}</h3>
                            <p className="mt-1 text-sm text-[#5f7a6c]">
                              📅 {new Date(activity.activity_date).toLocaleDateString()}
                            </p>
                            {activity.location && (
                              <p className="mt-1 text-sm text-[#5f7a6c]">📍 {activity.location}</p>
                            )}
                            {activity.notes && (
                              <p className="mt-2 text-[#345847]">{activity.notes}</p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleDeleteActivity(activity.id)}
                            variant="secondary"
                            className="text-xs"
                          >
                            Delete
                          </Button>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'expenses' && (
              <motion.div
                key="expenses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#163427]">Expenses</h2>
                  <Button onClick={() => setShowAddExpense(true)}>+ Add Expense</Button>
                </div>

                {expenses.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <p className="text-[#5f7a6c]">No expenses yet. Add your first expense!</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {expenses.map((expense) => (
                      <GlassCard key={expense.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-[#163427]">{expense.title}</h3>
                            <div className="mt-2 flex gap-4 text-sm text-[#5f7a6c]">
                              <span>💵 ${expense.amount.toFixed(2)}</span>
                              <span>👤 Paid by {expense.paidByUser?.name || 'Unknown'}</span>
                              <span>📊 {expense.split_type}</span>
                              {expense.category && <span>🏷️ {expense.category}</span>}
                            </div>
                          </div>
                          <Button
                            onClick={() => handleDeleteExpense(expense.id)}
                            variant="secondary"
                            className="text-xs"
                          >
                            Delete
                          </Button>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'settlement' && (
              <motion.div
                key="settlement"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="mb-6 text-2xl font-bold text-[#163427]">Settlement</h2>
                
                {settlements.length === 0 ? (
                  <GlassCard className="p-12 text-center">
                    <p className="text-[#5f7a6c]">All settled up! 🎉</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-4">
                    {settlements.map((settlement, idx) => (
                      <GlassCard key={idx} className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <p className="text-lg text-[#163427]">
                              <span className="font-bold">{settlement.from_user?.name || 'User'}</span>
                              {' owes '}
                              <span className="font-bold">{settlement.to_user?.name || 'User'}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-brand-accent">
                              ${settlement.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showAddActivity && (
        <AddActivityModal
          tripId={tripId}
          onClose={() => setShowAddActivity(false)}
          onSuccess={(newActivity) => {
            setActivities([...activities, newActivity]);
            setShowAddActivity(false);
            showToast('Activity added!', 'success');
          }}
          showToast={showToast}
        />
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          tripId={tripId}
          userId={user?.id || ''}
          onClose={() => setShowAddExpense(false)}
          onSuccess={(newExpense) => {
            setExpenses([...expenses, newExpense]);
            setShowAddExpense(false);
            showToast('Expense added!', 'success');
          }}
          showToast={showToast}
        />
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}

// Add Activity Modal
function AddActivityModal({ 
  tripId,
  onClose, 
  onSuccess,
  showToast 
}: { 
  tripId: string;
  onClose: () => void; 
  onSuccess: (activity: Activity) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await activitiesApi.createActivity({
      trip_id: tripId,
      title,
      activity_date: date,
      location,
      notes,
    });

    setLoading(false);

    if (response.error) {
      showToast(response.error, 'error');
    } else if (response.data?.activity) {
      onSuccess(response.data.activity);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-[#163427]">Add Activity</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] placeholder-[#7a9186] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                placeholder="e.g., Visit Eiffel Tower"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] placeholder-[#7a9186] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={3}
                className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] placeholder-[#7a9186] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                placeholder="Optional notes"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" onClick={undefined}>
                {loading ? 'Adding...' : 'Add Activity'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

// Add Expense Modal
function AddExpenseModal({ 
  tripId,
  userId,
  onClose, 
  onSuccess,
  showToast 
}: { 
  tripId: string;
  userId: string;
  onClose: () => void; 
  onSuccess: (expense: Expense) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await expensesApi.createExpense({
      trip_id: tripId,
      title,
      amount: parseFloat(amount),
      paid_by: userId,
      split_type: 'equal',
      category,
      shares: [{ user_id: userId, share_amount: parseFloat(amount) }],
    });

    setLoading(false);

    if (response.error) {
      showToast(response.error, 'error');
    } else if (response.data?.expense) {
      onSuccess(response.data.expense);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-[#163427]">Add Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] placeholder-[#7a9186] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                placeholder="e.g., Hotel Booking"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">Amount</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] placeholder-[#7a9186] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] placeholder-[#7a9186] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                placeholder="e.g., Accommodation, Food, Transport"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="primary" className="flex-1" onClick={undefined}>
                {loading ? 'Adding...' : 'Add Expense'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
