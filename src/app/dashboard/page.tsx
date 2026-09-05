"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import NeuCard from "@/components/ui/NeuCard";
import NeuInput from "@/components/ui/NeuInput";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { tripsApi } from "@/lib/api";
import { Trip } from "@/types";
import { CURRENCIES } from "@/utils/currency";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  modalBackdrop,
  modalContent,
} from "@/lib/animations";

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
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

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    const response = await tripsApi.deleteTrip(tripId);

    if (response.error) {
      showToast(response.error, "error");
    } else {
      showToast("Trip deleted successfully", "success");
      setTrips(trips.filter((t) => t.id !== tripId));
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your trips..." />;
  }

  if (!user) {
    return null;
  }

  const upcomingCount = trips.filter(
    (t) => new Date(t.start_date) > new Date()
  ).length;
  const completedCount = trips.filter(
    (t) => new Date(t.end_date) < new Date()
  ).length;

  return (
    <>
      <div className="flex min-h-screen py-20 bg-brand-bg">
        {/* Sidebar */}
        <aside className="w-64 glass-card border-r border-white/30 p-6 backdrop-blur-lg rounded-none">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#0F172A]">
              <span className="text-brand-accent">Trip</span>Tally
            </h2>
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="neu-inset flex items-center gap-3 rounded-2xl px-4 py-3 font-medium text-[#0F172A] transition-all duration-300"
            >
              <span className="text-lg">📊</span> Dashboard
            </Link>
            <Link
              href="/dashboard/trips"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium text-[#64748B] transition-all duration-300 hover:bg-white/50 hover:text-[#0F172A]"
            >
              <span className="text-lg">✈️</span> My Trips
            </Link>
            <Link
              href="/dashboard/expenses"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium text-[#64748B] transition-all duration-300 hover:bg-white/50 hover:text-[#0F172A]"
            >
              <span className="text-lg">💰</span> Expenses
            </Link>
            <Link
              href="/dashboard/templates"
              className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium text-[#64748B] transition-all duration-300 hover:bg-white/50 hover:text-[#0F172A]"
            >
              <span className="text-lg">📋</span> Templates
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-black text-[#0F172A]">
                Welcome back, {user.name}!
              </h1>
              <p className="mt-2 text-[#64748B]">
                You have {trips.length} active{" "}
                {trips.length === 1 ? "trip" : "trips"}
              </p>
            </div>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              + Create Trip
            </Button>
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
                <p className="mb-2 text-sm text-[#64748B]">Total Trips</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {trips.length}
                </p>
              </NeuCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <NeuCard className="!p-6">
                <p className="mb-2 text-sm text-[#64748B]">Upcoming</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {upcomingCount}
                </p>
              </NeuCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <NeuCard className="!p-6">
                <p className="mb-2 text-sm text-[#64748B]">Completed</p>
                <p className="text-3xl font-bold text-[#0F172A]">
                  {completedCount}
                </p>
              </NeuCard>
            </motion.div>
          </motion.div>

          {/* Trips Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">
              Your Trips
            </h2>
            {trips.length === 0 ? (
              <EmptyState
                icon="✈️"
                title="No trips yet"
                description="Create your first trip to get started"
                actionLabel="Create Trip"
                onAction={() => setShowCreateModal(true)}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {trips.map((trip) => (
                    <motion.div key={trip.id} variants={staggerItem}>
                      <NeuCard className="group overflow-hidden !p-0">
                        <Link href={`/trips/${trip.id}`}>
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={
                                trip.cover_image ||
                                "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80"
                              }
                              alt={trip.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#F0F4F8] to-transparent" />
                          </div>
                        </Link>
                        <div className="p-6">
                          <Link href={`/trips/${trip.id}`}>
                            <h3 className="mb-2 text-xl font-bold text-[#0F172A] transition group-hover:text-brand-blue">
                              {trip.title}
                            </h3>
                          </Link>
                          <p className="mb-3 line-clamp-2 text-sm text-[#64748B]">
                            {trip.description || "No description"}
                          </p>
                          <p className="mb-1 text-sm text-[#64748B]">
                            📅{" "}
                            {new Date(trip.start_date).toLocaleDateString()} →{" "}
                            {new Date(trip.end_date).toLocaleDateString()}
                          </p>
                          <div className="mt-4 flex gap-2">
                            <Button
                              href={`/trips/${trip.id}`}
                              variant="outline"
                              className="flex-1 text-xs"
                            >
                              View Details
                            </Button>
                            <Button
                              onClick={() => handleDeleteTrip(trip.id)}
                              variant="secondary"
                              className="px-3 text-xs"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                      </NeuCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Create Trip Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTripModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={(newTrip) => {
              setTrips([...trips, newTrip]);
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
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await tripsApi.createTrip({
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      currency,
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
        className="w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-8">
          <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">
            Create New Trip
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <NeuInput
              label="Trip Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              placeholder="e.g., Summer Europe Trip"
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-[#475569]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
                className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] transition-all duration-300 disabled:opacity-50"
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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

            <div>
              <label className="mb-2 block text-sm font-medium text-[#475569]">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                disabled={loading}
                className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] transition-all duration-300"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.name} ({c.code})
                  </option>
                ))}
              </select>
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
                {loading ? "Creating..." : "Create Trip"}
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
