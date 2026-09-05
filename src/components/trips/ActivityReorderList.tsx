"use client";

import { motion, AnimatePresence } from "framer-motion";
import { activitiesApi } from "@/lib/api/activities";
import { Activity } from "@/types";
import NeuCard from "@/components/ui/NeuCard";

interface ActivityReorderListProps {
  activities: Activity[];
  onReorder: (activities: Activity[]) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activityId: string) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function ActivityReorderList({
  activities,
  onReorder,
  onEdit,
  onDelete,
  showToast,
}: ActivityReorderListProps) {
  const sorted = [...activities].sort(
    (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
  );

  const handleMove = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sorted.length) return;

    const newSorted = [...sorted];
    const [moved] = newSorted.splice(index, 1);
    newSorted.splice(newIndex, 0, moved);

    const reordered = newSorted.map((a, i) => ({
      id: a.id,
      order_index: i,
    }));

    onReorder(newSorted);

    const { error } = await activitiesApi.reorderActivities?.(reordered) ?? { error: null };
    if (error) {
      showToast("Failed to reorder", "error");
    }
  };

  const handleMoveTop = async (index: number) => {
    if (index === 0) return;
    const newSorted = [...sorted];
    const [moved] = newSorted.splice(index, 1);
    newSorted.unshift(moved);

    const reordered = newSorted.map((a, i) => ({
      id: a.id,
      order_index: i,
    }));

    onReorder(newSorted);

    const { error } = await activitiesApi.reorderActivities?.(reordered) ?? { error: null };
    if (error) {
      showToast("Failed to reorder", "error");
    }
  };

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {sorted.map((activity, index) => (
          <motion.div
            key={activity.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <NeuCard className="!p-3">
              <div className="flex items-center gap-3">
                {/* Drag handle / order number */}
                <div className="flex flex-col items-center gap-0.5">
                  <button
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="text-[#94A3B8] hover:text-[#3B82F6] disabled:opacity-30 transition-colors p-0.5"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <span className="text-xs font-bold text-[#3B82F6] bg-blue-50 w-6 h-6 rounded-full flex items-center justify-center">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => handleMove(index, "down")}
                    disabled={index === sorted.length - 1}
                    className="text-[#94A3B8] hover:text-[#3B82F6] disabled:opacity-30 transition-colors p-0.5"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>

                {/* Activity info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#0F172A] text-sm truncate">
                    {activity.title}
                  </p>
                  <div className="flex gap-3 text-xs text-[#94A3B8]">
                    <span>
                      📅{" "}
                      {new Date(activity.activity_date).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                    </span>
                    {activity.location && (
                      <span className="truncate">📍 {activity.location}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <button
                    onClick={() => handleMoveTop(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#3B82F6] hover:bg-blue-50 transition-colors disabled:opacity-30 text-xs"
                    title="Move to top"
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => onEdit(activity)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#3B82F6] hover:bg-blue-50 transition-colors text-xs"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(activity.id)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-red-500 hover:bg-red-50 transition-colors text-xs"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </NeuCard>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
