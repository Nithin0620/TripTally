"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/types";

interface UseTripChatOptions {
  tripId: string;
  onMessage: (message: ChatMessage) => void;
}

export function useTripChat({ tripId, onMessage }: UseTripChatOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onMessageRef = useRef(onMessage);
  const [isConnected, setIsConnected] = useState(false);

  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!tripId) return;

    const channel = supabase.channel(`trip-chat:${tripId}`);

    channel.on("broadcast", { event: "message" }, ({ payload }) => {
      const incoming = payload?.message as ChatMessage | undefined;
      if (incoming?.id) onMessageRef.current(incoming);
    });

    channel.subscribe((status) => {
      setIsConnected(status === "SUBSCRIBED");
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setIsConnected(false);
    };
  }, [tripId]);

  const broadcastMessage = useCallback(async (message: ChatMessage) => {
    const channel = channelRef.current;
    if (!channel) return;

    try {
      await channel.send({
        type: "broadcast",
        event: "message",
        payload: { message },
      });
    } catch {
      setIsConnected(false);
    }
  }, []);

  return { isConnected, broadcastMessage };
}
