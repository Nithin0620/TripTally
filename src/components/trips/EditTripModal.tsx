"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tripsApi, UpdateTripData } from "@/lib/api/trips";
import { Trip } from "@/types";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import { modalBackdrop, modalContent } from "@/lib/animations";

interface EditTripModalProps {
  trip: Trip;
  onClose: () => void;
  onSuccess: (updatedTrip: Trip) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function EditTripModal({
  trip,
  onClose,
  onSuccess,
  showToast,
}: EditTripModalProps) {
  const [title, setTitle] = useState(trip.title);
  const [description, setDescription] = useState(trip.description || "");
  const [startDate, setStartDate] = useState(trip.start_date);
  const [endDate, setEndDate] = useState(trip.end_date);
  const [coverImage, setCoverImage] = useState(trip.cover_image || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data: UpdateTripData = {
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      cover_image: coverImage || undefined,
    };

    const response = await tripsApi.updateTrip(trip.id, data);
    setLoading(false);

    if (response.error) {
      showToast(response.error, "error");
    } else if (response.data?.trip) {
      onSuccess(response.data.trip);
      showToast("Trip updated!", "success");
    }
  };

  return (
    <AnimatePresence>
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
            <h2 className="mb-6 text-2xl font-bold text-[#0F172A]">Edit Trip</h2>

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

              <NeuInput
                label="Cover Image URL"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                disabled={loading}
                placeholder="Optional image URL"
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
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
