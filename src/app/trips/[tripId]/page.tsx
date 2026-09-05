"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import ExpenseSearchFilter from "@/components/expenses/ExpenseSearchFilter";
import DayByDayItinerary from "@/components/trips/DayByDayItinerary";
import TripActivityMap from "@/components/trips/TripActivityMap";
import EditActivityModal from "@/components/trips/EditActivityModal";
import ActivityReorderList from "@/components/trips/ActivityReorderList";
import RealtimePresence from "@/components/trips/RealtimePresence";
import { useRealtimeTrip } from "@/hooks/useRealtimeTrip";
import { tripsApi, activitiesApi, expensesApi, settlementApi } from "@/lib/api";
import { Trip, Activity, Expense, Settlement } from "@/types";
import { formatAmount } from "@/utils/currency";
import { exportExpensesCSV, exportTripSummaryHTML } from "@/utils/export";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import Link from "next/link";

type ActivityView = "list" | "timeline" | "reorder";

export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "activities" | "expenses" | "settlement" | "map"
  >("activities");
  const [activityView, setActivityView] = useState<ActivityView>("timeline");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditTrip, setShowEditTrip] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);

  const { user } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const loadTripData = async () => {
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

  const handleActivityChange = useCallback(() => {
    loadTripData();
  }, [tripId]);

  const handleExpenseChange = useCallback(() => {
    loadTripData();
  }, [tripId]);

  const { onlineMembers, isConnected } = useRealtimeTrip({
    tripId,
    userId: user?.id,
    userName: user?.name || user?.email,
    onActivityChange: handleActivityChange,
    onExpenseChange: handleExpenseChange,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (tripId) {
      setLoading(true);
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

  const handleReorderActivities = (reordered: Activity[]) => {
    setActivities(reordered);
  };

  const currency = trip?.currency || "INR";

  if (loading) {
    return <LoadingSpinner text="Loading trip..." />;
  }

  if (!trip) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetUsed = trip.budget_limit
    ? ((totalExpenses / trip.budget_limit) * 100).toFixed(0)
    : null;

  const tabs = [
    { key: "activities" as const, label: "Activities", icon: "🎯" },
    { key: "expenses" as const, label: "Expenses", icon: "💰" },
    { key: "settlement" as const, label: "Settlement", icon: "🤝" },
    { key: "map" as const, label: "Map", icon: "🗺️" },
  ];

  const activityViews: { key: ActivityView; label: string; icon: string }[] = [
    { key: "timeline", label: "Timeline", icon: "📅" },
    { key: "list", label: "List", icon: "📋" },
    { key: "reorder", label: "Reorder", icon: "🔢" },
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
              <div className="absolute top-4 right-4">
                <RealtimePresence
                  onlineMembers={onlineMembers}
                  isConnected={isConnected}
                  currentUserId={user?.id}
                />
              </div>
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
                <Button
                  variant="secondary"
                  onClick={() =>
                    exportTripSummaryHTML(trip, activities, expenses, settlements)
                  }
                  className="!bg-white/20 !text-white backdrop-blur-md border border-white/30 hover:!bg-white/30"
                >
                  📄 Export
                </Button>
              </div>
            </div>

            <p className="mt-6 text-lg text-[#64748B]">
              {trip.description || "No description"}
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mb-8 grid gap-4 md:grid-cols-4"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={staggerItem}>
              <NeuCard className="!p-5">
                <p className="mb-1 text-xs text-[#64748B]">Activities</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {activities.length}
                </p>
              </NeuCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <NeuCard className="!p-5">
                <p className="mb-1 text-xs text-[#64748B]">Total Expenses</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {formatAmount(totalExpenses, currency)}
                </p>
              </NeuCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <NeuCard className="!p-5">
                <p className="mb-1 text-xs text-[#64748B]">Settlements</p>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {settlements.length}
                </p>
              </NeuCard>
            </motion.div>
            {trip.budget_limit && (
              <motion.div variants={staggerItem}>
                <NeuCard className="!p-5">
                  <p className="mb-1 text-xs text-[#64748B]">Budget</p>
                  <p className="text-2xl font-bold text-[#0F172A]">
                    {formatAmount(totalExpenses, currency)} /{" "}
                    {formatAmount(trip.budget_limit, currency)}
                  </p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        budgetUsed && parseInt(budgetUsed) > 100
                          ? "bg-red-500"
                          : budgetUsed && parseInt(budgetUsed) > 80
                          ? "bg-amber-500"
                          : "bg-[#3B82F6]"
                      }`}
                      style={{
                        width: `${Math.min(parseInt(budgetUsed || "0"), 100)}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {budgetUsed}% used
                  </p>
                </NeuCard>
              </motion.div>
            )}
          </motion.div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-2xl bg-white/50 p-1.5 backdrop-blur-md border border-white/40 w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === "settlement") loadSettlement();
                }}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
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
                <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                  <h2 className="text-2xl font-bold text-[#0F172A]">
                    Activities
                  </h2>
                  <div className="flex items-center gap-3">
                    {/* View switcher */}
                    {activities.length > 0 && (
                      <div className="flex gap-1 rounded-xl bg-white/50 p-1 border border-white/40">
                        {activityViews.map((v) => (
                          <button
                            key={v.key}
                            onClick={() => setActivityView(v.key)}
                            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                              activityView === v.key
                                ? "neu-inset text-[#0F172A]"
                                : "text-[#64748B] hover:text-[#0F172A]"
                            }`}
                          >
                            <span>{v.icon}</span>
                            {v.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <Button onClick={() => setShowAddActivity(true)}>
                      + Add Activity
                    </Button>
                  </div>
                </div>

                {activities.length === 0 ? (
                  <EmptyState
                    icon="🎯"
                    title="No activities yet"
                    description="Add your first activity to get started"
                    actionLabel="Add Activity"
                    onAction={() => setShowAddActivity(true)}
                  />
                ) : activityView === "timeline" ? (
                  <DayByDayItinerary
                    activities={activities}
                    startDate={trip.start_date}
                    onEdit={(a) => setEditingActivity(a)}
                    onDelete={handleDeleteActivity}
                  />
                ) : activityView === "reorder" ? (
                  <ActivityReorderList
                    activities={activities}
                    onReorder={handleReorderActivities}
                    onEdit={(a) => setEditingActivity(a)}
                    onDelete={handleDeleteActivity}
                    showToast={showToast}
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
                        <NeuCard className="!p-6 group">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {activity.order_index != null && (
                                  <span className="text-xs font-medium text-[#3B82F6] bg-blue-50 rounded-full px-2 py-0.5">
                                    #{activity.order_index + 1}
                                  </span>
                                )}
                                <h3 className="text-xl font-bold text-[#0F172A]">
                                  {activity.title}
                                </h3>
                              </div>
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
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                onClick={() => setEditingActivity(activity)}
                                variant="secondary"
                                className="text-xs"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() =>
                                  handleDeleteActivity(activity.id)
                                }
                                variant="secondary"
                                className="text-xs"
                              >
                                Delete
                              </Button>
                            </div>
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
                  <div className="flex gap-2">
                    {expenses.length > 0 && (
                      <Button
                        variant="secondary"
                        onClick={() => exportExpensesCSV(expenses, trip.title, currency)}
                      >
                        📊 Export CSV
                      </Button>
                    )}
                    <Button onClick={() => setShowAddExpense(true)}>
                      + Add Expense
                    </Button>
                  </div>
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
                  <>
                    <ExpenseSearchFilter
                      expenses={expenses}
                      onFilter={setFilteredExpenses}
                    />
                    <motion.div
                      className="space-y-4"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {filteredExpenses.map((expense) => (
                        <motion.div key={expense.id} variants={staggerItem}>
                          <NeuCard className="!p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-[#0F172A]">
                                  {expense.title}
                                </h3>
                                <div className="mt-2 flex flex-wrap gap-4 text-sm text-[#64748B]">
                                  <span className="font-semibold text-brand-blue">
                                    💵 {formatAmount(expense.amount, currency)}
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
                                onClick={() =>
                                  handleDeleteExpense(expense.id)
                                }
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
                    {filteredExpenses.length === 0 && expenses.length > 0 && (
                      <div className="text-center py-8 text-[#64748B]">
                        <p className="text-3xl mb-2">🔍</p>
                        <p className="text-sm">No expenses match your filters</p>
                      </div>
                    )}
                  </>
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

                {/* Balance Summary */}
                {settlements.length > 0 && (
                  <NeuCard className="!p-6 mb-6">
                    <h3 className="mb-4 text-sm font-semibold text-[#64748B] uppercase tracking-wide">
                      Balance Summary
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#0F172A]">
                          {formatAmount(
                            settlements.reduce((sum, s) => sum + s.amount, 0),
                            currency
                          )}
                        </p>
                        <p className="text-xs text-[#64748B]">Total to settle</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#0F172A]">
                          {settlements.length}
                        </p>
                        <p className="text-xs text-[#64748B]">Transactions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-500">
                          {new Set(settlements.map((s) => s.to_user_id)).size}
                        </p>
                        <p className="text-xs text-[#64748B]">Get paid</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-amber-500">
                          {new Set(settlements.map((s) => s.from_user_id)).size}
                        </p>
                        <p className="text-xs text-[#64748B]">Need to pay</p>
                      </div>
                    </div>
                  </NeuCard>
                )}

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
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-sm font-bold text-amber-700">
                              {(settlement.from_user?.name || "?").charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="text-lg text-[#0F172A]">
                                <span className="font-bold">
                                  {settlement.from_user?.name || "User"}
                                </span>
                                {" pays "}
                                <span className="font-bold">
                                  {settlement.to_user?.name || "User"}
                                </span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#3B82F6]">
                                {formatAmount(settlement.amount, currency)}
                              </p>
                            </div>
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
                              {(settlement.to_user?.name || "?").charAt(0)}
                            </div>
                          </div>
                        </NeuCard>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {activeTab === "map" && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">
                  Activity Map
                </h2>
                <TripActivityMap
                  activities={activities}
                  className="h-[500px] w-full"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
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

      <AnimatePresence>
        {showAddExpense && (
          <AddExpenseModal
            tripId={tripId}
            onClose={() => setShowAddExpense(false)}
            onExpenseAdded={() => {
              loadTripData();
              setShowAddExpense(false);
              showToast("Expense added!", "success");
            }}
          />
        )}
      </AnimatePresence>

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

      <AnimatePresence>
        {editingActivity && (
          <EditActivityModal
            activity={editingActivity}
            onClose={() => setEditingActivity(null)}
            onSuccess={(updated) => {
              setActivities(
                activities.map((a) => (a.id === updated.id ? updated : a))
              );
              setEditingActivity(null);
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
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await activitiesApi.createActivity({
      trip_id: tripId,
      title,
      activity_date: date,
      location: location || undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      notes: notes || undefined,
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
              placeholder="Optional location name"
            />
            <div className="grid grid-cols-2 gap-3">
              <NeuInput
                label="Latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                disabled={loading}
                placeholder="28.6139"
              />
              <NeuInput
                label="Longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                disabled={loading}
                placeholder="77.2090"
              />
            </div>
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
                disabled={loading}
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
