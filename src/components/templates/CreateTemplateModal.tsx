"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { templatesApi, CreateTemplateData } from "@/lib/api/misc";
import { useToast } from "@/hooks/useToast";
import { modalBackdrop, modalContent } from "@/lib/animations";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import NeuToggle from "@/components/ui/NeuToggle";

interface CreateTemplateModalProps {
  onClose: () => void;
  onTemplateCreated: () => void;
}

export default function CreateTemplateModal({
  onClose,
  onTemplateCreated,
}: CreateTemplateModalProps) {
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [days, setDays] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const data: CreateTemplateData = {
        title: title.trim(),
        is_public: isPublic,
      };

      if (location.trim()) data.location = location.trim();
      if (days.trim()) data.days = parseInt(days.trim(), 10);
      if (budgetRange.trim()) data.budget_range = budgetRange.trim();

      const response = await templatesApi.createTemplate(data);

      if (response.error) {
        showToast(response.error, "error");
      } else {
        showToast("Template created successfully!", "success");
        onTemplateCreated();
      }
    } catch (error) {
      console.error("Error creating template:", error);
      showToast("Failed to create template", "error");
    } finally {
      setSubmitting(false);
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
        {/* Header */}
        <div className="sticky top-0 glass-card rounded-t-3xl z-10 p-6 border-b border-white/30">
          <h2 className="text-2xl font-bold text-[#0F172A]">
            Create Template
          </h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#64748B] hover:text-[#0F172A] transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <NeuInput
            label="Title *"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Weekend Beach Getaway"
          />
          {errors.title && (
            <p className="text-red-400 text-xs -mt-3">{errors.title}</p>
          )}

          {/* Location */}
          <NeuInput
            label="Location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Goa, Rajasthan"
          />

          {/* Days */}
          <NeuInput
            label="Number of Days"
            type="number"
            min="1"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="e.g., 5"
          />

          {/* Budget Range */}
          <NeuInput
            label="Budget Range"
            type="text"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            placeholder="e.g., ₹15,000 - ₹25,000"
          />

          {/* Public/Private Toggle */}
          <div className="flex items-center justify-between py-3 px-4 neu-inset rounded-xl">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">Public Template</p>
              <p className="text-xs text-[#64748B]">
                {isPublic ? "Visible to everyone" : "Only visible to you"}
              </p>
            </div>
            <NeuToggle checked={isPublic} onChange={setIsPublic} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Template"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
