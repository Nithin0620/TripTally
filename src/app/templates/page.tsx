"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { templatesApi } from "@/lib/api/misc";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";
import TemplateCard from "@/components/templates/TemplateCard";
import CreateTemplateModal from "@/components/templates/CreateTemplateModal";
import { Template } from "@/types";
import { Layers, Plus, Compass, Sparkles, BookOpen } from "lucide-react";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { user } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const loadTemplates = async () => {
    setLoading(true);
    const response = await templatesApi.getTemplates();

    if (response.error) {
      showToast(response.error, "error");
    } else if (response.data?.templates) {
      setTemplates(response.data.templates);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleTemplateCreated = () => {
    setShowCreateModal(false);
    loadTemplates();
    showToast("Template published successfully", "success");
  };

  return (
    <>
      <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200/80 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1 text-xs font-bold text-blue-700 mb-2">
              <BookOpen className="h-3.5 w-3.5 text-blue-600" />
              <span>Community & Expert Blueprints</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Curated Trip Templates
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Kickstart your journey using tested itineraries, recommended activity durations, and budget plans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="text-xs font-bold py-2.5 px-4 gap-1.5"
              >
                <Plus className="h-4 w-4" />
                <span>Publish Template</span>
              </Button>
            )}
          </div>
        </div>

        {/* Content Stream */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <EmptyState
            title="No templates available yet"
            description="Be the first to share an expedition template or create your own custom trip."
            actionLabel={user ? "+ Create First Template" : undefined}
            onAction={user ? () => setShowCreateModal(true) : undefined}
            secondaryActionLabel="Plan with AI"
            secondaryActionHref="/ai-planner"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {templates.map((template) => (
                <motion.div
                  key={template.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <TemplateCard template={template} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </main>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateTemplateModal
            onClose={() => setShowCreateModal(false)}
            onTemplateCreated={handleTemplateCreated}
          />
        )}
      </AnimatePresence>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
