"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tripsApi } from "@/lib/api/trips";
import { activitiesApi } from "@/lib/api/activities";
import { Trip } from "@/types";
import { modalBackdrop, modalContent } from "@/lib/animations";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import { Calendar, MapPin, Plus, CheckCircle2, X, Compass, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeName: string;
  location?: string;
  description?: string;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function AddToTripModal({
  isOpen,
  onClose,
  placeName,
  location,
  description,
  showToast,
}: AddToTripModalProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState(description || "");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTrips();
    }
  }, [isOpen]);

  const loadTrips = async () => {
    setLoading(true);
    const res = await tripsApi.getTrips();
    if (res.data?.trips && res.data.trips.length > 0) {
      setTrips(res.data.trips);
      const firstTrip = res.data.trips[0];
      setSelectedTripId(firstTrip.id);
      setDate(firstTrip.start_date);
    }
    setLoading(false);
  };

  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    const found = trips.find((t) => t.id === tripId);
    if (found) {
      setDate(found.start_date);
    }
  };

  const selectedTrip = trips.find((t) => t.id === selectedTripId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTripId) {
      showToast("Please select a trip", "error");
      return;
    }

    if (!date) {
      showToast("Please select a date", "error");
      return;
    }

    try {
      setSubmitting(true);
      const res = await activitiesApi.createActivity({
        trip_id: selectedTripId,
        title: placeName,
        activity_date: date,
        location: location || undefined,
        notes: notes ? notes.trim() : undefined,
      });

      if (res.error) {
        showToast(res.error, "error");
      } else {
        showToast(`Added ${placeName} to ${selectedTrip?.title || "your trip"}!`, "success");
        onClose();
      }
    } catch {
      showToast("Failed to add place to trip", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md rounded-2xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Add to Itinerary</h3>
                <p className="text-xs text-slate-500 truncate max-w-[240px]">
                  Schedule {placeName} into a trip
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
              Loading your trips...
            </div>
          ) : trips.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">No active trips found</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Create a trip first from your dashboard before adding individual activities.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="primary" href="/dashboard" className="text-xs py-2 px-4 gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Go to Dashboard</span>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Trip Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Trip
                </label>
                <select
                  value={selectedTripId}
                  onChange={(e) => handleTripChange(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({new Date(t.start_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date within trip bounds */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span>Activity Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  min={selectedTrip?.start_date}
                  max={selectedTrip?.end_date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location */}
              {location && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>Location</span>
                  </label>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                    {location}
                  </p>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for this place..."
                  rows={2}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? "Adding..." : "Add to Itinerary"}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
