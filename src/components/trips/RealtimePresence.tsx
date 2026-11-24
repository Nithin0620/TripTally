"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";

interface PresenceUser {
  user_id: string;
  name: string;
  online_at: string;
}

interface RealtimePresenceProps {
  onlineMembers: PresenceUser[];
  isConnected: boolean;
  currentUserId?: string;
}

export default function RealtimePresence({
  onlineMembers,
  isConnected,
  currentUserId,
}: RealtimePresenceProps) {
  const uniqueMembers = onlineMembers.filter(
    (member, index, self) =>
      index === self.findIndex((m) => m.user_id === member.user_id)
  );

  const otherMembers = uniqueMembers.filter(
    (m) => m.user_id !== currentUserId
  );

  if (!isConnected && otherMembers.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      {/* Connection indicator */}
      <div className="flex items-center gap-1.5">
        {isConnected ? (
          <Wifi size={14} className="text-emerald-500" />
        ) : (
          <WifiOff size={14} className="text-slate-400" />
        )}
        <span className="text-xs text-[#64748B]">
          {isConnected ? "Live" : "Offline"}
        </span>
      </div>

      {/* Online members */}
      {otherMembers.length > 0 && (
        <div className="flex items-center">
          <div className="flex -space-x-2">
            <AnimatePresence>
              {otherMembers.slice(0, 4).map((member) => (
                <motion.div
                  key={member.user_id}
                  initial={{ scale: 0, x: -10 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, x: -10 }}
                  className="relative"
                >
                  <div className="h-7 w-7 rounded-full bg-[#3B82F6] border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                    {member.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {otherMembers.length > 4 && (
            <span className="ml-2 text-xs text-[#64748B]">
              +{otherMembers.length - 4} more
            </span>
          )}
          {otherMembers.length <= 4 && otherMembers.length > 0 && (
            <span className="ml-2 text-xs text-[#64748B]">
              {otherMembers.length === 1
                ? `${otherMembers[0].name} is here`
                : `${otherMembers.length} others here`}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
