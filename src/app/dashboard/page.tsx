"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { tripsApi } from "@/lib/api";
import { Trip } from "@/types";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

export default function DashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  // Auth protection
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load trips
  useEffect(() => {
    const loadTrips = async () => {
      setLoading(true);
      const response = await tripsApi.getTrips();
      
      if (response.error) {
        showToast(response.error, 'error');
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
    if (!confirm('Are you sure you want to delete this trip?')) return;

    const response = await tripsApi.deleteTrip(tripId);
    
    if (response.error) {
      showToast(response.error, 'error');
    } else {
      showToast('Trip deleted successfully', 'success');
      setTrips(trips.filter(t => t.id !== tripId));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-2xl font-bold text-[#163427]">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen py-20 bg-brand-bg">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#d8e7df] bg-brand-surface p-6 backdrop-blur-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#163427]">
              <span className="text-brand-accent">Trip</span>Tally
            </h2>
          </div>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="block rounded-xl bg-white px-4 py-3 font-medium text-[#163427] transition hover:bg-[#f5fbf7]"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/dashboard/trips"
              className="block rounded-xl px-4 py-3 font-medium text-[#5f7a6c] transition hover:bg-white hover:text-[#163427]"
            >
              ✈️ My Trips
            </Link>
            <Link
              href="/dashboard/expenses"
              className="block rounded-xl px-4 py-3 font-medium text-[#5f7a6c] transition hover:bg-white hover:text-[#163427]"
            >
              💰 Expenses
            </Link>
            <Link
              href="/dashboard/templates"
              className="block rounded-xl px-4 py-3 font-medium text-[#5f7a6c] transition hover:bg-white hover:text-[#163427]"
            >
              📋 Templates
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
              <h1 className="text-4xl font-black text-[#163427]">
                Welcome back, {user.name}!
              </h1>
              <p className="mt-2 text-[#5f7a6c]">
                You have {trips.length} active {trips.length === 1 ? 'trip' : 'trips'}
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
              <GlassCard className="p-6">
                <p className="mb-2 text-sm text-[#5f7a6c]">Total Trips</p>
                <p className="text-3xl font-bold text-[#163427]">{trips.length}</p>
              </GlassCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6">
                <p className="mb-2 text-sm text-[#5f7a6c]">Upcoming</p>
                <p className="text-3xl font-bold text-[#163427]">
                  {trips.filter(t => new Date(t.start_date) > new Date()).length}
                </p>
              </GlassCard>
            </motion.div>
            <motion.div variants={staggerItem}>
              <GlassCard className="p-6">
                <p className="mb-2 text-sm text-[#5f7a6c]">Completed</p>
                <p className="text-3xl font-bold text-[#163427]">
                  {trips.filter(t => new Date(t.end_date) < new Date()).length}
                </p>
              </GlassCard>
            </motion.div>
          </motion.div>

          {/* Trips Grid */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <h2 className="mb-6 text-2xl font-bold text-[#163427]">Your Trips</h2>
            {trips.length === 0 ? (
              <div className="py-20 text-center">
                <h3 className="mb-4 text-xl font-bold text-[#163427]">
                  No trips yet
                </h3>
                <p className="mb-8 text-[#5f7a6c]">
                  Create your first trip to get started
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  Create Trip
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence>
                  {trips.map((trip, index) => (
                    <motion.div key={trip.id} variants={staggerItem}>
                      <GlassCard className="group overflow-hidden p-0">
                        <Link href={`/trips/${trip.id}`}>
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={trip.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80'}
                              alt={trip.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-brand-bg to-transparent" />
                          </div>
                        </Link>
                        <div className="p-6">
                          <Link href={`/trips/${trip.id}`}>
                            <h3 className="mb-2 text-xl font-bold text-[#163427] group-hover:text-brand-accent transition">
                              {trip.title}
                            </h3>
                          </Link>
                          <p className="mb-3 line-clamp-2 text-sm text-[#5f7a6c]">
                            {trip.description || 'No description'}
                          </p>
                          <p className="mb-1 text-sm text-[#5f7a6c]">
                            📅 {new Date(trip.start_date).toLocaleDateString()} → {new Date(trip.end_date).toLocaleDateString()}
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
                              className="text-xs px-3"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Create Trip Modal */}
      {showCreateModal && (
        <CreateTripModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newTrip) => {
            setTrips([...trips, newTrip]);
            setShowCreateModal(false);
            showToast('Trip created successfully!', 'success');
          }}
          showToast={showToast}
        />
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}

// Create Trip Modal Component
function CreateTripModal({ 
  onClose, 
  onSuccess,
  showToast 
}: { 
  onClose: () => void; 
  onSuccess: (trip: Trip) => void;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await tripsApi.createTrip({
      title,
      description,
      start_date: startDate,
      end_date: endDate,
    });

    setLoading(false);

    if (response.error) {
      showToast(response.error, 'error');
    } else if (response.data?.trip) {
      onSuccess(response.data.trip);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          <h2 className="mb-6 text-2xl font-bold text-[#163427]">Create New Trip</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">
                Trip Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] placeholder-[#7a9186] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                placeholder="e.g., Summer Europe Trip"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                rows={3}
                className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] placeholder-[#7a9186] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                placeholder="Optional description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                />
              </div>
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
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
