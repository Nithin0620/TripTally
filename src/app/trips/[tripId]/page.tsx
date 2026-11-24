"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import EditTripModal from "@/components/trips/EditTripModal";
import AddExpenseModal from "@/components/expenses/AddExpenseModal";
import ExpenseSearchFilter from "@/components/expenses/ExpenseSearchFilter";
import ExpenseCard from "@/components/expenses/ExpenseCard";
import ExpenseAnalytics from "@/components/expenses/ExpenseAnalytics";
import RecordPaymentModal from "@/components/expenses/RecordPaymentModal";
import DayByDayItinerary from "@/components/trips/DayByDayItinerary";
import TripActivityMap from "@/components/trips/TripActivityMap";
import EditActivityModal from "@/components/trips/EditActivityModal";
import AddActivityModal from "@/components/trips/AddActivityModal";
import TripChatDrawer from "@/components/trips/TripChatDrawer";
import InviteLinkModal from "@/components/trips/InviteLinkModal";
import ActivityReorderList from "@/components/trips/ActivityReorderList";
import RealtimePresence from "@/components/trips/RealtimePresence";
import { useRealtimeTrip } from "@/hooks/useRealtimeTrip";
import { tripsApi, activitiesApi, expensesApi, settlementApi } from "@/lib/api";
import { Trip, Activity, Expense, Settlement } from "@/types";
import { formatAmount } from "@/utils/currency";
import {
  exportExpensesCSV,
  exportItineraryCSV,
  exportItineraryICS,
  exportTripSummaryHTML,
  exportTripSummaryPDF,
} from "@/utils/export";
import { buildActivityNotes, parseActivityNotes } from "@/utils/activity";
import Link from "next/link";
import {
  Calendar,
  Compass,
  CreditCard,
  MapPin,
  Clock,
  Plus,
  ArrowLeft,
  Share2,
  FileDown,
  Edit3,
  Trash2,
  CheckCircle2,
  Layers,
  Map,
  Users,
  DollarSign,
  BarChart3,
  ListFilter,
  ChevronDown,
  FileText,
  MessageCircle,
  UserPlus
} from "lucide-react";

type ActivityView = "timeline" | "list" | "reorder";

export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [settlementPayments, setSettlementPayments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [selectedSettlementForPayment, setSelectedSettlementForPayment] = useState<Settlement | null>(null);
  const [expenseSubTab, setExpenseSubTab] = useState<"list" | "analytics">("list");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activities" | "expenses" | "settlement" | "map">("activities");
  const [activityView, setActivityView] = useState<ActivityView>("timeline");
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [defaultActivityDate, setDefaultActivityDate] = useState<string | undefined>(undefined);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showInviteLink, setShowInviteLink] = useState(false);
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
      setMembers(response.data.members || []);
      setActivities(response.data.activities || []);
      setExpenses(response.data.expenses || []);
      setFilteredExpenses(response.data.expenses || []);
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
    if (response.data) {
      setSettlements(response.data.settlements || []);
      setSettlementPayments(response.data.payments || []);
    }
  };

  const handleOpenPaymentModal = (settlement?: Settlement) => {
    setSelectedSettlementForPayment(settlement || null);
    setShowRecordPayment(true);
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm("Remove this payment record? Outstanding balances will update.")) return;
    const res = await settlementApi.deletePayment(tripId, paymentId);
    if (res.error) {
      showToast(res.error, "error");
    } else {
      showToast("Payment record removed", "success");
      loadSettlement();
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (!confirm("Delete this activity?")) return;
    const response = await activitiesApi.deleteActivity(activityId, tripId);
    if (response.error) {
      showToast(response.error, "error");
    } else {
      setActivities(activities.filter((a) => a.id !== activityId));
      showToast("Activity deleted", "success");
    }
  };

  const handleToggleActivityComplete = async (activity: Activity) => {
    const parsed = parseActivityNotes(activity.notes);
    const isCompleted = parsed.completed;
    const newNotes = buildActivityNotes({
      timeSlot: parsed.timeSlot,
      category: parsed.category,
      notes: parsed.description,
      completed: !isCompleted,
    }) || "";

    // Optimistic update
    setActivities((prev) =>
      prev.map((a) => (a.id === activity.id ? { ...a, notes: newNotes } : a))
    );

    const res = await activitiesApi.updateActivity({
      id: activity.id,
      trip_id: tripId,
      notes: newNotes,
    });

    if (res.error) {
      showToast("Failed to update activity status", "error");
      loadTripData();
    } else {
      showToast(isCompleted ? "Marked activity as pending" : "Activity completed! 🎉", "success");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Delete this expense?")) return;
    const response = await expensesApi.deleteExpense(expenseId, tripId);
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

  const currency = trip?.currency || "USD";
  const exportMenuItemClass =
    "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-700";

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!trip) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetUsed = trip.budget_limit
    ? ((totalExpenses / trip.budget_limit) * 100).toFixed(0)
    : null;

  const tabs = [
    { key: "activities" as const, label: "Itinerary Timeline", icon: Calendar },
    { key: "expenses" as const, label: "Expenses & Splits", icon: CreditCard },
    { key: "settlement" as const, label: "Debt Settlement", icon: DollarSign },
    { key: "map" as const, label: "Interactive Map", icon: Map },
  ];

  return (
    <>
      <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Expeditions</span>
          </Link>

          <div className="flex items-center gap-2">
            <RealtimePresence
              onlineMembers={onlineMembers}
              isConnected={isConnected}
              currentUserId={user?.id}
            />
            <Button
              variant="secondary"
              onClick={() => setShowChat(true)}
              className="text-xs py-2 px-3 gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Chat</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowInviteLink(true)}
              className="text-xs py-2 px-3 gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Invite</span>
            </Button>
          </div>
        </div>

        {/* Hero Banner Card */}
        <div className="relative h-64 sm:h-72 w-full rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg mb-8 bg-slate-900">
          <img
            src={
              trip.cover_image ||
              "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600&q=80"
            }
            alt={trip.title}
            className="h-full w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

          {/* Banner Details */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {new Date(trip.start_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })} →{" "}
                  {new Date(trip.end_date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-sm">
                {trip.title}
              </h1>
              {trip.description && (
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 max-w-xl mt-1">
                  {trip.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <Button
                  variant="secondary"
                  onClick={() => setShowExportMenu((open) => !open)}
                  className="text-xs py-2 px-3 bg-white/90 backdrop-blur-md gap-1.5"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>Export</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${showExportMenu ? "rotate-180" : ""}`} />
                </Button>

                {showExportMenu && (
                  <>
                    <button
                      type="button"
                      aria-label="Close export menu"
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setShowExportMenu(false)}
                    />
                    <div className="absolute right-0 top-full z-20 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
                      <button
                        type="button"
                        className={exportMenuItemClass}
                        onClick={() => {
                          setShowExportMenu(false);
                          if (!exportTripSummaryPDF(trip, activities, expenses, settlements)) {
                            showToast("Popup blocked — downloaded a printable HTML report instead", "info");
                          }
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 text-blue-600" />
                        <span>Print / Save as PDF</span>
                      </button>
                      <button
                        type="button"
                        className={exportMenuItemClass}
                        onClick={() => {
                          setShowExportMenu(false);
                          exportItineraryICS(trip, activities);
                          showToast("Calendar file downloaded", "success");
                        }}
                      >
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                        <span>Calendar (.ics)</span>
                      </button>
                      <button
                        type="button"
                        className={exportMenuItemClass}
                        onClick={() => {
                          setShowExportMenu(false);
                          exportItineraryCSV(trip, activities);
                          showToast("Itinerary CSV downloaded", "success");
                        }}
                      >
                        <FileDown className="h-3.5 w-3.5 text-blue-600" />
                        <span>Itinerary CSV</span>
                      </button>
                      <button
                        type="button"
                        className={exportMenuItemClass}
                        onClick={() => {
                          setShowExportMenu(false);
                          exportTripSummaryHTML(trip, activities, expenses, settlements);
                          showToast("HTML report downloaded", "success");
                        }}
                      >
                        <FileText className="h-3.5 w-3.5 text-slate-500" />
                        <span>Full HTML report</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowEditTrip(true)}
                className="text-xs py-2 px-3 bg-white/90 backdrop-blur-md gap-1.5"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Settings</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Scheduled Stops</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{activities.length}</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Spent</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {formatAmount(totalExpenses, currency)}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Pending Debts</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{settlements.length}</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Budget Usage</span>
            <div className="mt-1">
              <span className="text-sm font-black text-slate-900">
                {trip.budget_limit ? `${budgetUsed}%` : "No limit set"}
              </span>
              {trip.budget_limit && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      parseInt(budgetUsed || "0") > 100
                        ? "bg-rose-500"
                        : parseInt(budgetUsed || "0") > 80
                        ? "bg-amber-500"
                        : "bg-blue-600"
                    }`}
                    style={{ width: `${Math.min(parseInt(budgetUsed || "0"), 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 mb-8 overflow-x-auto w-full sm:w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === "settlement") loadSettlement();
                }}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <AnimatePresence mode="wait">
          {/* TAB 1: ACTIVITIES */}
          {activeTab === "activities" && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Timeline & Daily Schedule</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Organize stops, activities, and timings.</p>
                </div>

                <div className="flex items-center gap-2">
                  {activities.length > 0 && (
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                      {(["timeline", "list", "reorder"] as ActivityView[]).map((v) => (
                        <button
                          key={v}
                          onClick={() => setActivityView(v)}
                          className={`px-3 py-1 rounded-lg capitalize transition ${
                            activityView === v
                              ? "bg-white text-slate-900 shadow-sm"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}

                  <Button
                    variant="primary"
                    onClick={() => {
                      setDefaultActivityDate(undefined);
                      setShowAddActivity(true);
                    }}
                    className="text-xs py-2 px-4 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Activity</span>
                  </Button>
                </div>
              </div>

              {activities.length === 0 ? (
                <EmptyState
                  title="No activities planned yet"
                  description="Add your first sightseeing spot, flight, hotel check-in, or meal to begin building your itinerary."
                  actionLabel="+ Add First Activity"
                  onAction={() => {
                    setDefaultActivityDate(undefined);
                    setShowAddActivity(true);
                  }}
                />
              ) : activityView === "reorder" ? (
                <ActivityReorderList
                  tripId={tripId}
                  activities={activities}
                  onReorder={handleReorderActivities}
                  onEdit={(act) => setEditingActivity(act)}
                  onDelete={handleDeleteActivity}
                  showToast={showToast}
                />
              ) : (
                <DayByDayItinerary
                  activities={activities}
                  onEdit={(act) => setEditingActivity(act)}
                  onDelete={handleDeleteActivity}
                  startDate={trip.start_date}
                  endDate={trip.end_date}
                  onAddActivity={(date) => {
                    setDefaultActivityDate(date);
                    setShowAddActivity(true);
                  }}
                  onToggleComplete={handleToggleActivityComplete}
                />
              )}
            </motion.div>
          )}

          {/* TAB 2: EXPENSES */}
          {activeTab === "expenses" && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Group Expenses & Bills</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Track who paid what and split amounts seamlessly.</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => exportExpensesCSV(expenses, trip.title, currency)}
                    className="text-xs py-2 px-3 gap-1.5"
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    <span>CSV</span>
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddExpense(true)}
                    className="text-xs py-2 px-4 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Expense</span>
                  </Button>
                </div>
              </div>

              {/* Sub-tab view toggle: List vs Visual Analytics */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-fit mb-5">
                <button
                  type="button"
                  onClick={() => setExpenseSubTab("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    expenseSubTab === "list"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span>Expense List ({expenses.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseSubTab("analytics")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    expenseSubTab === "analytics"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span>Visual Analytics & Charts</span>
                </button>
              </div>

              {expenseSubTab === "analytics" ? (
                <ExpenseAnalytics
                  expenses={expenses}
                  budgetLimit={trip.budget_limit}
                  currency={currency}
                />
              ) : expenses.length === 0 ? (
                <EmptyState
                  title="No expenses logged yet"
                  description="Keep group finances clear and fair. Add your first restaurant bill, rental car, or hotel cost."
                  actionLabel="+ Add First Expense"
                  onAction={() => setShowAddExpense(true)}
                />
              ) : (
                <div className="space-y-4">
                  <ExpenseSearchFilter expenses={expenses} onFilter={setFilteredExpenses} />
                  {filteredExpenses.length > 0 ? (
                    <div className="space-y-3">
                      {filteredExpenses.map((expense, index) => (
                        <ExpenseCard
                          key={expense.id}
                          expense={expense}
                          index={index}
                          onUpdate={loadTripData}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 bg-white/50 text-slate-500">
                      <p className="text-sm font-semibold">No expenses match your search query</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: SETTLEMENT */}
          {activeTab === "settlement" && (
            <motion.div
              key="settlement"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Debt Simplification Matrix</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Minimal transaction route computed to settle all shared expenses.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    onClick={() => handleOpenPaymentModal()}
                    className="text-xs py-2 px-3 gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Record Payment</span>
                  </Button>
                  <Button variant="secondary" onClick={loadSettlement} className="text-xs py-2 px-3">
                    Recompute
                  </Button>
                </div>
              </div>

              {settlements.length === 0 ? (
                <EmptyState
                  title="All Settled Up!"
                  description="There are no outstanding debts or split balances for this trip."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settlements.map((s, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                          💸
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-500">
                            {s.from_user?.name || "Member"} owes {s.to_user?.name || "Member"}
                          </div>
                          <div className="text-lg font-black text-slate-900 mt-0.5">
                            {formatAmount(s.amount, currency)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                          Pending
                        </span>
                        <Button
                          variant="primary"
                          onClick={() => handleOpenPaymentModal(s)}
                          className="text-xs py-1.5 px-3"
                        >
                          Settle Up
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Settled Payment History */}
              {settlementPayments.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Payment History</h3>
                      <p className="text-xs text-slate-500">
                        Record of settled debts between group members
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {settlementPayments.length} Settled {settlementPayments.length === 1 ? "Payment" : "Payments"}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {settlementPayments.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">
                              {p.from_user?.name || "Member"} paid {p.to_user?.name || "Member"}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span>{new Date(p.created_at).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="uppercase font-semibold text-blue-600">
                                {p.payment_method?.replace("_", " ")}
                              </span>
                              {p.notes && (
                                <>
                                  <span>•</span>
                                  <span className="italic">"{p.notes}"</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-base font-extrabold text-emerald-700">
                            {formatAmount(p.amount, currency)}
                          </span>
                          <button
                            onClick={() => handleDeletePayment(p.id)}
                            title="Remove payment record"
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: INTERACTIVE MAP */}
          {activeTab === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900">Interactive Route Map</h2>
                <p className="text-xs text-slate-500 mt-0.5">Visualized coordinates and waypoints for all scheduled activities.</p>
              </div>

              <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-lg h-[550px] bg-slate-100">
                <TripActivityMap activities={activities} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEditTrip && (
          <EditTripModal
            trip={trip}
            onClose={() => setShowEditTrip(false)}
            onSuccess={(updated) => {
              setTrip(updated);
              setShowEditTrip(false);
              showToast("Trip updated successfully", "success");
            }}
            showToast={showToast}
          />
        )}

        {showAddExpense && (
          <AddExpenseModal
            tripId={tripId}
            onClose={() => setShowAddExpense(false)}
            onExpenseAdded={() => {
              loadTripData();
              setShowAddExpense(false);
              showToast("Expense recorded", "success");
            }}
          />
        )}

        {editingActivity && (
          <EditActivityModal
            activity={editingActivity}
            onClose={() => setEditingActivity(null)}
            onSuccess={(updated) => {
              setActivities(activities.map((a) => (a.id === updated.id ? updated : a)));
              setEditingActivity(null);
              showToast("Activity updated", "success");
            }}
            showToast={showToast}
          />
        )}

        {showAddActivity && (
          <AddActivityModal
            tripId={tripId}
            defaultDate={defaultActivityDate}
            startDate={trip.start_date}
            endDate={trip.end_date}
            onClose={() => {
              setShowAddActivity(false);
              setDefaultActivityDate(undefined);
            }}
            onSuccess={(newActivity) => {
              setActivities((prev) => [...prev, newActivity]);
              setShowAddActivity(false);
              setDefaultActivityDate(undefined);
            }}
            showToast={showToast}
          />
        )}

        {showChat && (
          <TripChatDrawer
            tripId={tripId}
            tripTitle={trip.title}
            currentUserId={user?.id}
            currentUserName={user?.name || user?.email}
            onClose={() => setShowChat(false)}
            showToast={showToast}
          />
        )}

        {showInviteLink && (
          <InviteLinkModal
            tripId={tripId}
            tripTitle={trip.title}
            onClose={() => setShowInviteLink(false)}
            showToast={showToast}
          />
        )}

        {showRecordPayment && (
          <RecordPaymentModal
            isOpen={showRecordPayment}
            onClose={() => {
              setShowRecordPayment(false);
              setSelectedSettlementForPayment(null);
            }}
            tripId={tripId}
            currency={currency}
            defaultFromUserId={selectedSettlementForPayment?.from_user_id}
            defaultToUserId={selectedSettlementForPayment?.to_user_id}
            defaultAmount={selectedSettlementForPayment?.amount}
            members={members}
            onPaymentRecorded={() => {
              loadSettlement();
              loadTripData();
            }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
