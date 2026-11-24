"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { activitiesApi } from "@/lib/api/activities";
import { Activity } from "@/types";
import { modalBackdrop, modalContent } from "@/lib/animations";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";

interface EditActivityModalProps {
  activity: Activity;
  onClose: () => void;
  onSuccess: (updated: Activity) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function EditActivityModal({
  activity,
  onClose,
  onSuccess,
  showToast,
}: EditActivityModalProps) {
  const [title, setTitle] = useState(activity.title);
  const [date, setDate] = useState(activity.activity_date.split("T")[0]);
  const [location, setLocation] = useState(activity.location || "");
  const [latitude, setLatitude] = useState(
    activity.latitude?.toString() || ""
  );
  const [longitude, setLongitude] = useState(
    activity.longitude?.toString() || ""
  );
  const [notes, setNotes] = useState(activity.notes || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await activitiesApi.updateActivity({
      id: activity.id,
      trip_id: activity.trip_id,
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
      showToast("Activity updated!", "success");
      onSuccess(response.data.activity);
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
        className="glass-card rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 glass-card rounded-t-3xl z-10 p-6 border-b border-white/30">
          <h2 className="text-2xl font-bold text-[#0F172A]">Edit Activity</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <NeuInput
            label="Title *"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            placeholder="e.g., Visit Eiffel Tower"
          />

          <NeuInput
            label="Date *"
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

          <div className="grid grid-cols-2 gap-4">
            <NeuInput
              label="Latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              disabled={loading}
              placeholder="e.g., 28.6139"
            />
            <NeuInput
              label="Longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              disabled={loading}
              placeholder="e.g., 77.2090"
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
              className="neu-input w-full rounded-xl px-4 py-3 text-[#0F172A] placeholder-[#94A3B8] transition-all duration-300 disabled:opacity-50 resize-none"
              placeholder="Optional notes"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/30">
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
