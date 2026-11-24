"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import NeuCard from "@/components/ui/NeuCard";
import { Activity } from "@/types";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  CheckCircle2,
  Circle,
  Edit3,
  Trash2,
  AlertTriangle
} from "lucide-react";
import Button from "@/components/ui/Button";
import {
  dateKeyFrom,
  getConflictingActivityIds,
  getDateKey,
  getDayNumber,
  parseActivityNotes,
  sortActivities,
} from "@/utils/activity";

interface DayByDayItineraryProps {
  activities: Activity[];
  startDate?: string;
  endDate?: string;
  onEdit?: (activity: Activity) => void;
  onDelete?: (activityId: string) => void;
  onAddActivity?: (date?: string) => void;
  onToggleComplete?: (activity: Activity) => void;
}

interface DayGroup {
  date: string;
  dayNum: number;
  label: string;
  activities: Activity[];
}

export default function DayByDayItinerary({
  activities,
  startDate,
  endDate,
  onEdit,
  onDelete,
  onAddActivity,
  onToggleComplete,
}: DayByDayItineraryProps) {
  const dayGroups = useMemo<DayGroup[]>(() => {
    const groups: Record<string, Activity[]> = {};

    activities.forEach((activity) => {
      const dateKey = activity.activity_date.split("T")[0];
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(activity);
    });

    Object.keys(groups).forEach((date) => {
      groups[date] = sortActivities(groups[date]);
    });

    const allDates = new Set<string>(Object.keys(groups));

    if (startDate && endDate) {
      const start = new Date(`${getDateKey(startDate)}T00:00:00`);
      const end = new Date(`${getDateKey(endDate)}T00:00:00`);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && end >= start) {
        const cur = new Date(start);
        while (cur <= end) {
          allDates.add(dateKeyFrom(cur));
          cur.setDate(cur.getDate() + 1);
        }
      }
    }

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date, idx) => {
      const d = new Date(`${date}T00:00:00`);
      const dayNum = startDate ? getDayNumber(date, startDate) : idx + 1;

      return {
        date,
        dayNum: Math.max(1, dayNum),
        label: `Day ${Math.max(1, dayNum)} — ${d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}`,
        activities: groups[date] || [],
      };
    });
  }, [activities, startDate, endDate]);

  const conflictingActivityIds = useMemo(
    () => getConflictingActivityIds(activities),
    [activities]
  );

  if (dayGroups.length === 0) {
    return (
      <div className="text-center py-16 rounded-3xl border border-dashed border-slate-200 bg-white/50 p-8">
        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
          <Calendar className="h-6 w-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No scheduled activities</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
          Start assembling your trip timeline by adding activities or generating an itinerary with AI.
        </p>
        {onAddActivity && (
          <Button variant="primary" onClick={() => onAddActivity()} className="text-xs py-2 px-4 gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Add First Activity</span>
          </Button>
        )}
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
      {/* Visual Timeline Spine */}
      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gradient-to-b from-blue-500 via-blue-400/40 to-slate-200" />

      <div className="space-y-10">
        {dayGroups.map((day) => {
          return (
            <motion.div key={day.date} variants={staggerItem} className="relative">
              {/* Day Header Marker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex flex-col items-center justify-center shadow-md shadow-blue-500/20 text-white shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none">Day</span>
                    <span className="text-base font-black leading-none mt-0.5">{day.dayNum}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {day.label}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {day.activities.length} {day.activities.length === 1 ? "activity" : "activities"} planned
                    </p>
                  </div>
                </div>

                {/* Day-specific Quick Action */}
                {onAddActivity && (
                  <button
                    type="button"
                    onClick={() => onAddActivity(day.date)}
                    className="self-start sm:self-auto inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100/80 px-3 py-1.5 rounded-xl transition-colors border border-blue-200/60"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add to Day {day.dayNum}</span>
                  </button>
                )}
              </div>

              {/* Activities Stream for this Day */}
              <div className="ml-16 space-y-3">
                {day.activities.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white/40 p-4 text-center">
                    <p className="text-xs text-slate-500 font-medium">No activities scheduled for this day yet.</p>
                    {onAddActivity && (
                      <button
                        onClick={() => onAddActivity(day.date)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold mt-1 inline-flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Schedule something</span>
                      </button>
                    )}
                  </div>
                ) : (
                  day.activities.map((activity, idx) => {
                    const parsed = parseActivityNotes(activity.notes);
                    const isCompleted = parsed.completed;
                    const timeString = parsed.timeSlot;

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                      >
                        <NeuCard
                          className={`!p-4 group transition-all ${
                            isCompleted ? "opacity-60 bg-slate-50/80" : "hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            {/* Checkbox & Content */}
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              {/* Completion Toggle Checkbox */}
                              <button
                                type="button"
                                onClick={() => onToggleComplete?.(activity)}
                                title={isCompleted ? "Mark as pending" : "Mark as completed"}
                                aria-pressed={isCompleted}
                                className={`mt-0.5 rounded-lg p-1 transition-colors shrink-0 ${
                                  isCompleted
                                    ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                    : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                }`}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  <Circle className="h-4 w-4" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                {/* Metadata Row (Slot index, Time, Location) */}
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-50/90 rounded-md px-1.5 py-0.5 border border-blue-200/50">
                                    Slot {idx + 1}
                                  </span>

                                  {parsed.category && (
                                    <span className="inline-flex items-center text-[10px] font-bold text-violet-700 bg-violet-50 rounded-md px-1.5 py-0.5 border border-violet-200/60">
                                      {parsed.category}
                                    </span>
                                  )}

                                  {timeString && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 rounded-md px-1.5 py-0.5 border border-amber-200/60">
                                      <Clock className="h-3 w-3" />
                                      <span>{timeString}</span>
                                    </span>
                                  )}

                                  {conflictingActivityIds.has(activity.id) && (
                                    <span
                                      title="This activity overlaps with another activity on the same day"
                                      className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 rounded-md px-1.5 py-0.5 border border-red-200/70"
                                    >
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>Time overlap</span>
                                    </span>
                                  )}

                                  {activity.location && (
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 truncate max-w-xs">
                                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                      <span className="truncate">{activity.location}</span>
                                    </span>
                                  )}
                                </div>

                                {/* Title */}
                                <h4
                                  className={`font-bold text-sm leading-snug ${
                                    isCompleted ? "line-through text-slate-500" : "text-slate-900"
                                  }`}
                                >
                                  {activity.title}
                                </h4>

                                {/* Notes */}
                                {parsed.description && (
                                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed whitespace-pre-line">
                                    {parsed.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Actions (Edit / Delete) */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              {onEdit && (
                                <button
                                  type="button"
                                  onClick={() => onEdit(activity)}
                                  title="Edit activity"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  type="button"
                                  onClick={() => onDelete(activity.id)}
                                  title="Delete activity"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </NeuCard>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
