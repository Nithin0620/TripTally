"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { ChatMessage } from "@/types";

interface TypingUser {
  user_id: string;
  name: string;
}

interface UseTripChatOptions {
  tripId: string;
  currentUserId?: string;
  currentUserName?: string;
  onMessage: (message: ChatMessage) => void;
  onMessagesChanged?: () => void;
}

export function useTripChat({
  tripId,
  currentUserId,
  currentUserName,
  onMessage,
  onMessagesChanged,
}: UseTripChatOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const onMessageRef = useRef(onMessage);
  const onMessagesChangedRef = useRef(onMessagesChanged);
  const currentUserIdRef = useRef(currentUserId);
  const currentUserNameRef = useRef(currentUserName);
  const typingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const lastTypingSentRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  onMessageRef.current = onMessage;
  onMessagesChangedRef.current = onMessagesChanged;
  currentUserIdRef.current = currentUserId;
  currentUserNameRef.current = currentUserName;

  useEffect(() => {
    if (!tripId) return;

    const channel = supabase.channel(`trip-chat:${tripId}`);

    channel
      .on("broadcast", { event: "message" }, ({ payload }) => {
        const incoming = payload?.message as ChatMessage | undefined;
        if (incoming?.id) {
          onMessageRef.current(incoming);
          onMessagesChangedRef.current?.();
        }
      })
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const user = payload?.user as TypingUser | undefined;
        if (!user?.user_id || user.user_id === currentUserIdRef.current) return;

        setTypingUsers((prev) =>
          prev.some((existing) => existing.user_id === user.user_id) ? prev : [...prev, user]
        );

        const existingTimer = typingTimersRef.current[user.user_id];
        if (existingTimer) clearTimeout(existingTimer);

        typingTimersRef.current[user.user_id] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((entry) => entry.user_id !== user.user_id));
          delete typingTimersRef.current[user.user_id];
        }, 3000);
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trip_messages",
          filter: `trip_id=eq.${tripId}`,
        },
        () => {
          onMessagesChangedRef.current?.();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    channelRef.current = channel;

    return () => {
      Object.values(typingTimersRef.current).forEach((timer) => clearTimeout(timer));
      typingTimersRef.current = {};
      setTypingUsers([]);

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

  const broadcastTyping = useCallback(() => {
    const userId = currentUserIdRef.current;
    if (!userId) return;

    const now = Date.now();
    if (now - lastTypingSentRef.current < 1500) return;
    lastTypingSentRef.current = now;

    const channel = channelRef.current;
    if (!channel) return;

    void channel
      .send({
        type: "broadcast",
        event: "typing",
        payload: {
          user: {
            user_id: userId,
            name: currentUserNameRef.current || "Team member",
          },
        },
      })
      .catch(() => {
        setIsConnected(false);
      });
  }, []);

  return { isConnected, typingUsers, broadcastMessage, broadcastTyping };
}
