"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import { tripsApi } from "@/lib/api";
import { Trip } from "@/types";
import { CURRENCIES } from "@/utils/currency";
import {
  Plus,
  Compass,
  Calendar,
  DollarSign,
  Trash2,
  ExternalLink,
  Users,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  X,
  Plane,
  FolderOpen
} from "lucide-react";

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "upcoming" | "past">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadTrips = async () => {
      setLoading(true);
      const response = await tripsApi.getTrips();

      if (response.error) {
        showToast(response.error, "error");
      } else if (response.data?.trips) {
        setTrips(response.data.trips);
      }

      setLoading(false);
    };

    if (user) {
      loadTrips();
    }
  }, [user]);

  const handleDeleteTrip = async (e: React.MouseEvent, tripId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this trip?")) return;

    const response = await tripsApi.deleteTrip(tripId);

    if (response.error) {
      showToast(response.error, "error");
    } else {
      showToast("Trip deleted successfully", "success");
      setTrips(trips.filter((t) => t.id !== tripId));
    }
  };

  const now = new Date();
  const upcomingTrips = trips.filter((t) => new Date(t.end_date || t.start_date) >= now);
  const pastTrips = trips.filter((t) => new Date(t.end_date || t.start_date) < now);

  const filteredTrips = trips.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === "upcoming") return new Date(t.end_date || t.start_date) >= now;
    if (filterTab === "past") return new Date(t.end_date || t.start_date) < now;
    return true;
  });

  return (
    <>
      <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200/80 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Workspace
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {user ? `Welcome, ${user.name || user.email.split("@")[0]}` : "Your Dashboard"}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 mt-1">
              Manage your upcoming adventures, group itineraries, and travel expenses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              href="/ai-planner"
              className="gap-2 text-xs font-bold py-2.5 px-4 border-slate-200"
            >
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>AI Trip Wizard</span>
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="gap-2 text-xs font-bold py-2.5 px-4"
            >
              <Plus className="h-4 w-4" />
              <span>Create Trip</span>
            </Button>
          </div>
        </div>

        {/* Workspace Quick Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Expeditions</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{trips.length}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Compass className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Upcoming Departures</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{upcomingTrips.length}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Plane className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 backdrop-blur-sm shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Journeys</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{pastTrips.length}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <FolderOpen className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200 w-full sm:w-auto">
            {(["all", "upcoming", "past"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  filterTab === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab === "all" ? `All Trips (${trips.length})` : tab === "upcoming" ? `Upcoming (${upcomingTrips.length})` : `Past (${pastTrips.length})`}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search trips by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/90 pl-10 pr-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
                <Skeleton className="h-44 w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <EmptyState
            title={searchQuery ? "No matching trips found" : "No trips created yet"}
            description={
              searchQuery
                ? `No trips match "${searchQuery}". Try a different search term or clear the filter.`
                : "Start by creating your first trip manually or generate a complete personalized itinerary using AI."
            }
            actionLabel="+ Create New Trip"
            onAction={() => setShowCreateModal(true)}
            secondaryActionLabel="Generate with AI"
            secondaryActionHref="/ai-planner"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTrips.map((trip) => {
                const startDate = new Date(trip.start_date);
                const endDate = new Date(trip.end_date);
                const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

                return (
                  <motion.div
                    key={trip.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/90 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all overflow-hidden"
                  >
                    <div>
                      {/* Image Header */}
                      <Link href={`/trips/${trip.id}`} className="block relative h-44 overflow-hidden bg-slate-100">
                        <img
                          src={
                            trip.cover_image ||
                            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                          }
                          alt={trip.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                        
                        {/* Duration Pill */}
                        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1.5 shadow-sm">
                          <Clock className="h-3 w-3 text-amber-400" />
                          <span>{diffDays > 0 ? `${diffDays} Days` : "1 Day"}</span>
                        </div>

                        {/* Currency / Budget Chip */}
                        {trip.budget_limit && (
                          <div className="absolute top-3 right-3 bg-emerald-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-300 flex items-center gap-1 shadow-sm border border-emerald-500/30">
                            <span>{trip.currency || "$"} {trip.budget_limit.toLocaleString()}</span>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="font-bold text-lg leading-snug line-clamp-1 drop-shadow-sm group-hover:text-blue-200 transition-colors">
                            {trip.title}
                          </h3>
                        </div>
                      </Link>

                      {/* Content Details */}
                      <div className="p-5">
                        <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] mb-4">
                          {trip.description || "No specific itinerary notes provided yet."}
                        </p>

                        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-400">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Timeline</span>
                            </span>
                            <span className="font-semibold text-slate-800">
                              {startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })} → {endDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-5 pt-0 flex items-center gap-2">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 text-white px-4 py-2 text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
                      >
                        <span>Open Trip</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={(e) => handleDeleteTrip(e, trip.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100 transition-colors"
                        title="Delete Trip"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Modern Create Trip Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTripModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={(newTrip) => {
              setTrips([newTrip, ...trips]);
              setShowCreateModal(false);
              showToast("Trip created successfully!", "success");
            }}
            showToast={showToast}
          />
        )}
      </AnimatePresence>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}

function CreateTripModal({
  onClose,
  onSuccess,
  showToast,
}: {
  onClose: () => void;
  onSuccess: (trip: Trip) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetLimit, setBudgetLimit] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      showToast("Please choose start and end dates", "error");
      return;
    }

    setLoading(true);

    const response = await tripsApi.createTrip({
      title: title.trim(),
      description: description.trim(),
      start_date: startDate,
      end_date: endDate,
      currency,
      budget_limit: budgetLimit ? parseFloat(budgetLimit) : undefined,
    });

    setLoading(false);

    if (response.error) {
      showToast(response.error, "error");
    } else if (response.data?.trip) {
      onSuccess(response.data.trip);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Create New Expedition</h2>
            <p className="text-xs text-slate-500 mt-0.5">Define your destination, dates, and budget.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <NeuInput
            label="Trip Title / Destination"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            placeholder="e.g., Swiss Alps Adventure 2026"
          />

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Trip Description & Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
              placeholder="e.g., Hiking Matterhorn, visiting Zermatt, and group dinners."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NeuInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={loading}
            />
            <NeuInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Base Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <NeuInput
              label="Budget Limit (Optional)"
              type="number"
              step="any"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(e.target.value)}
              disabled={loading}
              placeholder="e.g. 2500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
            >
              Cancel
            </button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !title.trim()}
              className="px-6 text-xs font-bold"
            >
              {loading ? "Creating..." : "Create Trip"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
