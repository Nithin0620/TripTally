"use client";

import { useCallback, useEffect, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Bell, Loader2 } from "lucide-react";
import NeuCard from "@/components/ui/NeuCard";
import { supabase } from "@/lib/supabase";
import { Notification } from "@/types";

interface TripActivityFeedProps {
  tripId: string;
}

const NOTIFICATION_ICONS: Record<Notification["type"], string> = {
  trip_invite: "✈️",
  expense_added: "💰",
  activity_added: "🎯",
  settlement_updated: "🤝",
  member_joined: "👋",
  payment_reminder: "💸",
  system: "🔔",
};

export default function TripActivityFeed({ tripId }: TripActivityFeedProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/notifications?tripId=${encodeURIComponent(tripId)}&limit=25`,
        { credentials: "include" }
      );
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(() => void fetchNotifications(), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    let channel: RealtimeChannel | null = null;

    channel = supabase
      .channel(`trip-activity:${tripId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          void fetchNotifications();
        }
      );

    void channel.subscribe();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [tripId, fetchNotifications]);

  return (
    <NeuCard>
      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Trip Activity</h3>
          <p className="text-[11px] text-slate-500">Updates from everyone on this trip</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-xs font-semibold text-slate-400">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading activity...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-6 text-center">
          <p className="text-sm font-bold text-slate-700">No trip activity yet</p>
          <p className="mt-1 text-[11px] text-slate-500">
            Invites, expenses, and itinerary changes will show up here.
          </p>
        </div>
      ) : (
        <div className="max-h-[520px] space-y-2.5 overflow-y-auto pr-1">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex gap-3 rounded-2xl border p-3 ${
                notification.read
                  ? "border-slate-200 bg-white/60"
                  : "border-blue-200/70 bg-blue-50/50"
              }`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
                {NOTIFICATION_ICONS[notification.type] || "🔔"}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">{notification.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">
                  {notification.message}
                </p>
                <p className="mt-1 text-[10px] text-slate-400">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </NeuCard>
  );
}
