"use client";

import { motion } from "framer-motion";
import { Template } from "@/types";
import { MapPin, Calendar, DollarSign, Globe, Lock, ArrowRight, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all h-full">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
            {template.title}
          </h3>
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${
              template.is_public
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {template.is_public ? (
              <>
                <Globe className="h-2.5 w-2.5" /> Public
              </>
            ) : (
              <>
                <Lock className="h-2.5 w-2.5" /> Private
              </>
            )}
          </span>
        </div>

        {/* Metadata Details */}
        <div className="space-y-2 text-xs font-medium text-slate-600 mb-6">
          {template.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{template.location}</span>
            </div>
          )}
          {template.days && (
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{template.days} {template.days === 1 ? "Day" : "Days"} Itinerary</span>
            </div>
          )}
          {template.budget_range && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-semibold text-emerald-700">{template.budget_range}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer & Action */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium">
          {new Date(template.created_at).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <Button
          variant="secondary"
          href={`/ai-planner?destination=${encodeURIComponent(template.location || template.title)}`}
          className="text-xs py-1.5 px-3 gap-1"
        >
          <span>Use Blueprint</span>
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
