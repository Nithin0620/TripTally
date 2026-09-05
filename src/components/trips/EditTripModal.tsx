"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tripsApi, UpdateTripData } from "@/lib/api/trips";
import { Trip } from "@/types";
import { CURRENCIES } from "@/utils/currency";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import { modalBackdrop, modalContent } from "@/lib/animations";
import { Upload, X, Image } from "lucide-react";

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
  const [currency, setCurrency] = useState(trip.currency || "INR");
  const [budgetLimit, setBudgetLimit] = useState(
    trip.budget_limit?.toString() || ""
  );
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be less than 5MB", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/trips/${trip.id}/cover`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Upload failed");
      }

      setCoverImage(data.cover_image);
      showToast("Cover image uploaded!", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data: UpdateTripData = {
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      cover_image: coverImage || undefined,
      currency,
      budget_limit: budgetLimit ? parseFloat(budgetLimit) : undefined,
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

              {/* Cover Image Upload */}
              <div>
                <label className="mb-2 block text-sm font-medium text-[#475569]">
                  Cover Image
                </label>
                {coverImage ? (
                  <div className="relative">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="h-32 w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImage("")}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                      dragOver
                        ? "border-[#3B82F6] bg-blue-50"
                        : "border-slate-200 hover:border-[#3B82F6] hover:bg-slate-50"
                    }`}
                  >
                    {uploading ? (
                      <div className="text-sm text-[#64748B]">Uploading...</div>
                    ) : (
                      <>
                        <Upload size={24} className="mb-2 text-slate-400" />
                        <p className="text-sm text-[#64748B]">
                          Click or drag to upload
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                          JPEG, PNG, WebP • Max 5MB
                        </p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <p className="mt-1 text-xs text-[#94A3B8]">
                  Or paste an image URL:
                </p>
                <NeuInput
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  disabled={loading || uploading}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <NeuInput
                  label="Budget Limit"
                  type="number"
                  step="0.01"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  disabled={loading}
                  placeholder="Optional"
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
