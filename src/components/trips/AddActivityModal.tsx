"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { activitiesApi } from "@/lib/api/activities";
import { Activity } from "@/types";
import { modalBackdrop, modalContent } from "@/lib/animations";
import { buildActivityNotes } from "@/utils/activity";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  FileText,
  X,
  Compass,
  Utensils,
  Camera,
  Palmtree,
  Car
} from "lucide-react";

interface AddActivityModalProps {
  tripId: string;
  defaultDate?: string;
  startDate?: string;
  endDate?: string;
  onClose: () => void;
  onSuccess: (newActivity: Activity) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

const CATEGORIES = [
  { id: "Sightseeing", icon: Camera, color: "text-blue-600 bg-blue-50" },
  { id: "Food & Dining", icon: Utensils, color: "text-amber-600 bg-amber-50" },
  { id: "Adventure", icon: Compass, color: "text-emerald-600 bg-emerald-50" },
  { id: "Relaxation", icon: Palmtree, color: "text-purple-600 bg-purple-50" },
  { id: "Transport", icon: Car, color: "text-slate-600 bg-slate-50" },
];

export default function AddActivityModal({
  tripId,
  defaultDate,
  startDate,
  endDate,
  onClose,
  onSuccess,
  showToast,
}: AddActivityModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(defaultDate || startDate || new Date().toISOString().split("T")[0]);
  const [timeSlot, setTimeSlot] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Sightseeing");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast("Activity title is required", "error");
      return;
    }
    if (!date) {
      showToast("Activity date is required", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await activitiesApi.createActivity({
        trip_id: tripId,
        title: title.trim(),
        activity_date: date,
        location: location.trim() || undefined,
        notes: buildActivityNotes({ timeSlot, category, notes }),
      });

      if (response.error) {
        showToast(response.error, "error");
      } else if (response.data?.activity) {
        showToast("Activity added to itinerary!", "success");
        onSuccess(response.data.activity);
        onClose();
      }
    } catch {
      showToast("Failed to create activity", "error");
    } finally {
      setLoading(false);
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
        className="relative w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Add Itinerary Activity</h2>
              <p className="text-xs text-slate-500">Plan a place, meal, or event for your trip</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Activity Title *
            </label>
            <NeuInput
              type="text"
              placeholder="e.g. Scuba Diving at Grand Island"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Date & Time Slot Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Date *</span>
              </label>
              <input
                type="date"
                value={date}
                min={startDate}
                max={endDate}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Time Slot (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM – 1:00 PM"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>Location / Address</span>
            </label>
            <NeuInput
              type="text"
              placeholder="e.g. Candolim, North Goa"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              <span>Category</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    <span>{cat.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Notes & Tips</span>
            </label>
            <textarea
              placeholder="Add details, tickets booking links, dress codes, or packing notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Adding Activity..." : "Add to Itinerary"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
