"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeTripOptions {
  tripId: string;
  userId?: string;
  userName?: string;
  onActivityChange?: () => void;
  onExpenseChange?: () => void;
  onSettlementChange?: () => void;
}

interface PresenceState {
  user_id: string;
  name: string;
  online_at: string;
}

export function useRealtimeTrip({
  tripId,
  userId,
  userName,
  onActivityChange,
  onExpenseChange,
  onSettlementChange,
}: UseRealtimeTripOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [onlineMembers, setOnlineMembers] = useState<PresenceState[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const handleActivityPostgresChange = useCallback(
    (payload: any) => {
      if (onActivityChange) {
        onActivityChange();
      }
    },
    [onActivityChange]
  );

  const handleExpensePostgresChange = useCallback(
    (payload: any) => {
      if (onExpenseChange) {
        onExpenseChange();
      }
    },
    [onExpenseChange]
  );

  const handleSettlementPostgresChange = useCallback(
    (payload: any) => {
      if (onSettlementChange) {
        onSettlementChange();
      }
    },
    [onSettlementChange]
  );

  useEffect(() => {
    if (!tripId) return;

    const channelName = `trip:${tripId}`;
    const channel = supabase.channel(channelName);

    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "activities",
          filter: `trip_id=eq.${tripId}`,
        },
        handleActivityPostgresChange
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `trip_id=eq.${tripId}`,
        },
        handleExpensePostgresChange
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expense_shares",
        },
        handleSettlementPostgresChange
      );

    if (userId && userName) {
      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState<PresenceState>();
          const members: PresenceState[] = [];
          for (const key of Object.keys(state)) {
            const presences = state[key];
            if (presences && presences.length > 0) {
              members.push(presences[0]);
            }
          }
          setOnlineMembers(members);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            setIsConnected(true);
            await channel.track({
              user_id: userId,
              name: userName,
              online_at: new Date().toISOString(),
            } satisfies PresenceState);
          }
        });
    } else {
      channel.subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });
    }

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [tripId, userId, userName, handleActivityPostgresChange, handleExpensePostgresChange, handleSettlementPostgresChange]);

  return { onlineMembers, isConnected };
}
