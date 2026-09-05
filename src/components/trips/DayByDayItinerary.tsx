"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import NeuCard from "@/components/ui/NeuCard";
import { Activity } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface DayByDayItineraryProps {
  activities: Activity[];
  startDate?: string;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
}

interface DayGroup {
  date: string;
  label: string;
  activities: Activity[];
}

export default function DayByDayItinerary({
  activities,
  startDate,
  onEdit,
  onDelete,
}: DayByDayItineraryProps) {
  const dayGroups = useMemo(() => {
    const groups: Record<string, Activity[]> = {};

    activities.forEach((activity) => {
      const dateKey = activity.activity_date.split("T")[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(activity);
    });

    Object.values(groups).forEach((group) => {
      group.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    });

    const sortedDates = Object.keys(groups).sort();

    return sortedDates.map((date, idx) => {
      const d = new Date(date + "T00:00:00");
      const dayNum = startDate
        ? Math.floor(
            (d.getTime() - new Date(startDate + "T00:00:00").getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        : idx + 1;

      return {
        date,
        label: `Day ${dayNum} — ${d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}`,
        activities: groups[date],
      };
    });
  }, [activities, startDate]);

  if (dayGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-5xl mb-4">📋</p>
        <p className="text-[#64748B] font-medium">No activities to display</p>
        <p className="text-[#94A3B8] text-sm mt-1">
          Add activities with dates to see your itinerary
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#3B82F6] via-[#3B82F6]/50 to-transparent" />

      <div className="space-y-8">
        {dayGroups.map((day) => (
          <motion.div key={day.date} variants={staggerItem} className="relative">
            {/* Day marker */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative z-10 w-12 h-12 rounded-full bg-[#3B82F6] flex items-center justify-center shadow-lg shadow-[#3B82F6]/30">
                <span className="text-white font-bold text-sm">
                  {day.label.split(" ")[1]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A]">
                  {day.label}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  {day.activities.length}{" "}
                  {day.activities.length === 1 ? "activity" : "activities"}
                </p>
              </div>
            </div>

            {/* Activities for this day */}
            <div className="ml-16 space-y-3">
              {day.activities.map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <NeuCard className="!p-4 group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center text-xs font-medium text-[#3B82F6] bg-blue-50 rounded-full px-2 py-0.5">
                            #{(activity.order_index ?? idx) + 1}
                          </span>
                          {activity.location && (
                            <span className="text-xs text-[#94A3B8] truncate">
                              📍 {activity.location}
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-[#0F172A] text-sm">
                          {activity.title}
                        </h4>
                        {activity.notes && (
                          <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                            {activity.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(activity)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#3B82F6] hover:bg-blue-50 transition-colors text-xs"
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(activity.id)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-red-500 hover:bg-red-50 transition-colors text-xs"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  </NeuCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
