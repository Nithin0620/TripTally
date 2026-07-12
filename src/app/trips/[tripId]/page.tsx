"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import NeuCard from "@/components/ui/NeuCard";
import NeuInput from "@/components/ui/NeuInput";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import EditTripModal from "@/components/trips/EditTripModal";
import { tripsApi, activitiesApi, expensesApi, settlementApi } from "@/lib/api";
import { Trip, Activity, Expense, Settlement } from "@/types";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import Link from "next/link";

export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "activities" | "expenses" | "settlement"
  >("activities");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const loadTripData = async () => {
      setLoading(true);
      const response = await tripsApi.getTripById(tripId);

      if (response.error) {
        showToast(response.error, "error");
        router.push("/dashboard");
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
    if (!confirm("Delete this activity?")) return;

    const response = await activitiesApi.deleteActivity(activityId);
    if (response.error) {
      showToast(response.error, "error");
    } else {
      setActivities(activities.filter((a) => a.id !== activityId));
      showToast("Activity deleted", "success");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Delete this expense?")) return;

    const response = await expensesApi.deleteExpense(expenseId);
    if (response.error) {
      showToast(response.error, "error");
    } else {
      setExpenses(expenses.filter((e) => e.id !== expenseId));
      showToast("Expense deleted", "success");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading trip..." />;
  }

  if (!trip) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const tabs = [
    { key: "activities" as const, label: "Activities", icon: "🎯" },
    { key: "expenses" as const, label: "Expenses", icon: "💰" },
    { key: "settlement" as const, label: "Settlement", icon: "🤝" },
  ];

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
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center text-sm text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              ← Back to Dashboard
            </Link>

            <div className="glass-card relative h-64 overflow-hidden rounded-3xl">
              <img
                src={
                  trip.cover_image ||
                  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80"
                }
                alt={trip.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-[#0F172A]/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <div>
                  <h1 className="text-5xl font-black text-white drop-shadow-lg">
                    {trip.title}
                  </h1>
                  <p className="mt-2 text-lg text-white/90">
                    📅{" "}
                    {new Date(trip.start_date).toLocaleDateString()} →{" "}
                    {new Date(trip.end_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setShowEditTrip(true)}
                  className="!bg-white/20 !text-white backdrop-blur-md border border-white/30 hover:!bg-white/30"
                >
                  ✏️ Edit
                </Button>
              </div>
            </div>

            <p className="mt-6 text-lg text-[#64748B]">
              {trip.description || "No description"}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mb-8 grid gap-6 md:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem}>
              <NeuCard className="!p-6">
                <p className="mb-2 text-sm text-[#64748B]">Activities</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {activities.length}
                </p>
              </NeuCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <NeuCard className="!p-6">
                <p className="mb-2 text-sm text-[#64748B]">Total Expenses</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  ${totalExpenses.toFixed(2)}
                </p>
              </NeuCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <NeuCard className="!p-6">
                <p className="mb-2 text-sm text-[#64748B]">Settlements</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {settlements.length}
                </p>
              </NeuCard>
            </motion.div>
          </motion.div>

          {/* Tabs - Neumorphic pill bar */}
          <div className="mb-6 flex gap-1 rounded-2xl bg-white/50 p-1.5 backdrop-blur-md border border-white/40 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === "settlement") loadSettlement();
                }}
                className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.key
                    ? "neu-inset text-[#0F172A]"
                    : "text-[#64748B] hover:text-[#0F172A] hover:bg-white/60"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "activities" && (
              <motion.div
                key="activities"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    Activities
                  </h2>
                  <Button onClick={() => setShowAddActivity(true)}>
                    + Add Activity
                  </Button>
                </div>

                {activities.length === 0 ? (
                  <EmptyState
                    icon="🎯"
                    title="No activities yet"
                    description="Add your first activity to get started"
                    actionLabel="Add Activity"
                    onAction={() => setShowAddActivity(true)}
                  />
                ) : (
                  <motion.div
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {activities.map((activity) => (
                      <motion.div key={activity.id} variants={staggerItem}>
                        <NeuCard className="!p-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-[#0F172A]">
                                {activity.title}
                              </h3>
                              <p className="mt-1 text-sm text-[#64748B]">
                                📅{" "}
                                {new Date(
                                  activity.activity_date
                                ).toLocaleDateString()}
                              </p>
                              {activity.location && (
                                <p className="mt-1 text-sm text-[#64748B]">
                                  📍 {activity.location}
                                </p>
                              )}
                              {activity.notes && (
                                <p className="mt-2 text-[#475569]">
                                  {activity.notes}
                                </p>
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
                        </NeuCard>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "expenses" && (
              <motion.div
                key="expenses"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    Expenses
                  </h2>
                  <Button onClick={() => setShowAddExpense(true)}>
                    + Add Expense
                  </Button>
                </div>

                {expenses.length === 0 ? (
                  <EmptyState
                    icon="💰"
                    title="No expenses yet"
                    description="Add your first expense to start tracking"
                    actionLabel="Add Expense"
                    onAction={() => setShowAddExpense(true)}
                  />
                ) : (
                  <motion.div
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {expenses.map((expense) => (
                      <motion.div key={expense.id} variants={staggerItem}>
                        <NeuCard className="!p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-[#0F172A]">
                                {expense.title}
                              </h3>
                              <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#64748B]">
                                <span className="font-semibold text-brand-blue">
                                  💵 ${expense.amount.toFixed(2)}
                                </span>
                                <span>
                                  👤 Paid by{" "}
                                  {expense.paidByUser?.name || "Unknown"}
                                </span>
                                <span>📊 {expense.split_type}</span>
                                {expense.category && (
                                  <span>🏷️ {expense.category}</span>
                                )}
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
                        </NeuCard>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "settlement" && (
              <motion.div
                key="settlement"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">
                  Settlement
                </h2>

                {settlements.length === 0 ? (
                  <EmptyState
                    icon="🎉"
                    title="All settled up!"
                    description="No pending settlements for this trip"
                  />
                ) : (
                  <motion.div
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {settlements.map((settlement, idx) => (
                      <motion.div key={idx} variants={staggerItem}>
                        <NeuCard className="!p-6">
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <p className="text-lg text-[#0F172A]">
                                <span className="font-bold">
                                  {settlement.from_user?.name || "User"}
                                </span>
                                {" owes "}
                                <span className="font-bold">
                                  {settlement.to_user?.name || "User"}
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-brand-blue">
                                ${settlement.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </NeuCard>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Activity Modal */}
      <AnimatePresence>
        {showAddActivity && (
          <AddActivityModal
            tripId={tripId}
            onClose={() => setShowAddActivity(false)}
            onSuccess={(newActivity) => {
              setActivities([...activities, newActivity]);
              setShowAddActivity(false);
              showToast("Activity added!", "success");
            }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddExpense && (
          <AddExpenseModal
            tripId={tripId}
            userId={user?.id || ""}
            onClose={() => setShowAddExpense(false)}
            onSuccess={(newExpense) => {
              setExpenses([...expenses, newExpense]);
              setShowAddExpense(false);
              showToast("Expense added!", "success");
            }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      {/* Edit Trip Modal */}
      <AnimatePresence>
        {showEditTrip && trip && (
          <EditTripModal
            trip={trip}
            onClose={() => setShowEditTrip(false)}
            onSuccess={(updatedTrip) => {
              setTrip(updatedTrip);
              setShowEditTrip(false);
            }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}

// Add Activity Modal
function AddActivityModal({
  tripId,
  onClose,
  onSuccess,
  showToast,
}: {
  tripId: string;
  onClose: () => void;
  onSuccess: (activity: Activity) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
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
      showToast(response.error, "error");
    } else if (response.data?.activity) {
      onSuccess(response.data.activity);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8">
          <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">
            Add Activity
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <NeuInput
              label="Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., Visit Eiffel Tower"
            />
            <NeuInput
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={loading}
            />
            <NeuInput
              label="Location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              placeholder="Optional"
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-[#475569]">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                rows={3}
                className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] transition-all duration-300 disabled:opacity-50"
                placeholder="Optional notes"
              />
            </div>
            <div className="flex gap-3 pt-4">
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
                {loading ? "Adding..." : "Add Activity"}
              </Button>
            </div>
          </form>
        </div>
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
  showToast,
}: {
  tripId: string;
  userId: string;
  onClose: () => void;
  onSuccess: (expense: Expense) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
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
      split_type: "equal",
      involved_members: [userId],
      category,
    });

    setLoading(false);

    if (response.error) {
      showToast(response.error, "error");
    } else if (response.data?.expense) {
      onSuccess(response.data.expense);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8">
          <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">
            Add Expense
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <NeuInput
              label="Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., Hotel Booking"
            />
            <NeuInput
              label="Amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={loading}
              placeholder="0.00"
            />
            <NeuInput
              label="Category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              placeholder="e.g., Accommodation, Food, Transport"
            />
            <div className="flex gap-3 pt-4">
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
                {loading ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
