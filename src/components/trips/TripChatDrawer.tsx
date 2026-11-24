"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, MessageCircle, Send, Wifi, WifiOff, X } from "lucide-react";
import { chatApi } from "@/lib/api";
import { ChatMessage } from "@/types";
import { useTripChat } from "@/hooks/useTripChat";

interface TripChatDrawerProps {
  tripId: string;
  tripTitle: string;
  currentUserId?: string;
  currentUserName?: string;
  onClose: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export default function TripChatDrawer({
  tripId,
  tripTitle,
  currentUserId,
  currentUserName,
  onClose,
  showToast,
}: TripChatDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleRealtimeMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) =>
      prev.some((existing) => existing.id === message.id) ? prev : [...prev, message]
    );
  }, []);

  const loadMessages = useCallback(async () => {
    const response = await chatApi.getMessages(tripId);
    if (response.error) {
      showToast(response.error, "error");
      return;
    }

    setMessages((previous) => {
      const byId = new Map(previous.map((message) => [message.id, message]));
      (response.data?.messages || []).forEach((message) => byId.set(message.id, message));
      return Array.from(byId.values()).sort((a, b) =>
        a.created_at.localeCompare(b.created_at)
      );
    });
  }, [tripId, showToast]);

  const { isConnected, typingUsers, broadcastMessage, broadcastTyping } = useTripChat({
    tripId,
    currentUserId,
    currentUserName,
    onMessage: handleRealtimeMessage,
    onMessagesChanged: () => {
      void loadMessages();
    },
  });

  useEffect(() => {
    let active = true;

    chatApi
      .getMessages(tripId)
      .then((response) => {
        if (!active) return;
        if (response.error) {
          showToast(response.error, "error");
        } else {
          setMessages((previous) => {
            const byId = new Map(previous.map((message) => [message.id, message]));
            (response.data?.messages || []).forEach((message) => byId.set(message.id, message));
            return Array.from(byId.values()).sort((a, b) =>
              a.created_at.localeCompare(b.created_at)
            );
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tripId, showToast]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    const tempId = `pending-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      trip_id: tripId,
      user_id: currentUserId || "",
      content,
      created_at: new Date().toISOString(),
      user: currentUserId
        ? { id: currentUserId, name: currentUserName || "You" }
        : undefined,
    };

    setMessages((prev) => [...prev, optimistic]);
    setDraft("");

    const response = await chatApi.sendMessage(tripId, content);
    setSending(false);

    if (response.error || !response.data?.message) {
      setMessages((prev) => prev.filter((message) => message.id !== tempId));
      setDraft(content);
      showToast(response.error || "Failed to send message", "error");
      return;
    }

    const saved = response.data.message;
    setMessages((prev) => prev.map((message) => (message.id === tempId ? saved : message)));
    void broadcastMessage(saved);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex justify-end"
    >
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative flex h-full w-full flex-col bg-white shadow-2xl sm:max-w-md"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Group Chat</h2>
              <p className="max-w-[220px] truncate text-[11px] text-slate-500">{tripTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
              title={isConnected ? "Realtime connected" : "Reconnecting"}
            >
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? "Live" : "Offline"}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 px-4 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-xs font-semibold text-slate-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="mx-auto mt-16 max-w-[240px] text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <MessageCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Start the conversation</p>
              <p className="mt-1 text-xs text-slate-500">
                Share plans, updates, and photos with everyone on this trip.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.user_id === currentUserId;
              const name = isOwn
                ? currentUserName || message.user?.name || "You"
                : message.user?.name || "Team member";

              return (
                <div key={message.id} className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      isOwn ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className={`max-w-[76%] ${isOwn ? "text-right" : ""}`}>
                    <div className="mb-1 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-bold text-slate-600">{isOwn ? "You" : name}</span>
                      <span>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div
                      className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-left text-xs leading-relaxed shadow-sm ${
                        isOwn
                          ? "rounded-tr-sm bg-blue-600 text-white"
                          : "rounded-tl-sm border border-slate-200 bg-white text-slate-700"
                      } ${message.id.startsWith("pending-") ? "opacity-60" : ""}`}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-slate-200 p-4">
          {typingUsers.length > 0 && (
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <span className="inline-flex gap-0.5">
                <span className="h-1 w-1 animate-bounce rounded-full bg-blue-500" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-blue-500 [animation-delay:120ms]" />
                <span className="h-1 w-1 animate-bounce rounded-full bg-blue-500 [animation-delay:240ms]" />
              </span>
              {typingUsers.map((user) => user.name).join(", ")} typing...
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                if (event.target.value.trim()) broadcastTyping();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Message your group..."
              className="max-h-32 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={!draft.trim() || sending}
              className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
              aria-label="Send message"
            >
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-slate-400">
            Press Enter to send · Shift + Enter for a new line
          </p>
        </div>
      </motion.aside>
    </motion.div>
  );
}
