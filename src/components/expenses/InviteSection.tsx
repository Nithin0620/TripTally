"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/useToast";
import { getAuthToken } from "@/lib/jwt";
import NeuCard from "@/components/ui/NeuCard";
import Button from "@/components/ui/Button";

interface InviteSectionProps {
  tripId: string;
  onInviteSent?: () => void;
}

export default function InviteSection({ tripId, onInviteSent }: InviteSectionProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentEmails, setSentEmails] = useState<string[]>([]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast("Please enter an email address", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Invalid email format", "error");
      return;
    }

    try {
      setLoading(true);

      const token = await getAuthToken();
      if (!token) {
        showToast("Not authenticated", "error");
        return;
      }

      const response = await fetch("/api/trips/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tripId,
          email: email.toLowerCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        showToast(data.error || "Failed to send invitation", "error");
        return;
      }

      showToast(`Invitation sent to ${email}`, "success");
      setSentEmails([...sentEmails, email.toLowerCase()]);
      setEmail("");
      onInviteSent?.();
    } catch (error) {
      console.error("Error sending invitation:", error);
      showToast("Failed to send invitation", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <NeuCard>
        <h3 className="text-xl font-bold text-[#0F172A] mb-4">
          Invite Members
        </h3>

        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-sm text-[#475569] mb-2">
              Invite by Email
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="friend@example.com"
                disabled={loading}
                className="neu-input flex-1 rounded-xl px-4 py-2 text-[#0F172A] placeholder-[#94A3B8] transition-all duration-300 disabled:opacity-50"
              />
              <Button
                type="submit"
                variant="primary"
                className="whitespace-nowrap"
                disabled={loading || !email.trim()}
              >
                {loading ? "Sending..." : "Invite"}
              </Button>
            </div>
          </div>
        </form>

        {/* Recently Invited */}
        {sentEmails.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/30">
            <p className="text-sm text-[#64748B] mb-3">Recently invited:</p>
            <div className="space-y-2">
              {sentEmails.map((sentEmail, index) => (
                <motion.div
                  key={sentEmail}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 text-sm text-[#64748B]"
                >
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  {sentEmail}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-[#94A3B8] mt-4 text-center">
          Invitations expire in 7 days
        </p>
      </NeuCard>
    </motion.div>
  );
}
