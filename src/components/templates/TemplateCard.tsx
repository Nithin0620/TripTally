"use client";

import { motion } from "framer-motion";
import { Template } from "@/types";
import { MapPin, Calendar, DollarSign, Globe, Lock } from "lucide-react";
import NeuCard from "@/components/ui/NeuCard";

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <NeuCard className="!p-6 h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0F172A] leading-tight">
              {template.title}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                template.is_public
                  ? "bg-blue-50 text-[#3B82F6] border border-blue-200"
                  : "bg-slate-100 text-[#64748B] border border-slate-200"
              }`}
            >
              {template.is_public ? (
                <>
                  <Globe size={12} /> Public
                </>
              ) : (
                <>
                  <Lock size={12} /> Private
                </>
              )}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-3 flex-1">
            {template.location && (
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <MapPin size={16} className="text-[#3B82F6]" />
                <span>{template.location}</span>
              </div>
            )}
            {template.days && (
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <Calendar size={16} className="text-[#3B82F6]" />
                <span>{template.days} {template.days === 1 ? "day" : "days"}</span>
              </div>
            )}
            {template.budget_range && (
              <div className="flex items-center gap-2 text-sm text-[#64748B]">
                <DollarSign size={16} className="text-[#3B82F6]" />
                <span>{template.budget_range}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Created {new Date(template.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </NeuCard>
    </motion.div>
  );
}
