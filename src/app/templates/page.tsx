"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { templatesApi } from "@/lib/api/misc";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import TemplateCard from "@/components/templates/TemplateCard";
import CreateTemplateModal from "@/components/templates/CreateTemplateModal";
import { Template } from "@/types";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

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
  };

  if (loading) {
    return <LoadingSpinner text="Loading templates..." />;
  }

  return (
    <>
      <Toast toasts={toasts} onRemove={removeToast} />

      <main className="min-h-screen bg-brand-bg py-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-8 flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-black text-[#0F172A]">
                Trip Templates
              </h1>
              <p className="mt-2 text-[#64748B]">
                Reusable trip plans to kickstart your next adventure
              </p>
            </div>
            {user && (
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                + New Template
              </Button>
            )}
          </motion.div>

          {/* Templates Grid */}
          {templates.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No templates yet"
              description="Create your first trip template to save time planning future trips"
              actionLabel={user ? "Create Template" : undefined}
              onAction={user ? () => setShowCreateModal(true) : undefined}
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence>
                {templates.map((template) => (
                  <motion.div key={template.id} variants={staggerItem} layout>
                    <TemplateCard template={template} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
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
    </>
  );
}
