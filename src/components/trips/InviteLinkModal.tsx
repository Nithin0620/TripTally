"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Link2, Loader2, Share2, X } from "lucide-react";
import { apiClient } from "@/lib/api";
import { modalBackdrop, modalContent } from "@/lib/animations";
import Button from "@/components/ui/Button";

interface InviteLinkModalProps {
  tripId: string;
  tripTitle: string;
  onClose: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

interface InviteLinkResponse {
  inviteLink: string;
  inviteId: string;
  expiresAt: string;
}

export default function InviteLinkModal({
  tripId,
  tripTitle,
  onClose,
  showToast,
}: InviteLinkModalProps) {
  const [inviteLink, setInviteLink] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    apiClient
      .post<InviteLinkResponse>(`/api/trips/${tripId}/invite-link`)
      .then((response) => {
        if (!active) return;
        if (response.error || !response.data?.inviteLink) {
          showToast(response.error || "Failed to create invite link", "error");
          return;
        }
        setInviteLink(response.data.inviteLink);
        setExpiresAt(response.data.expiresAt);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tripId, showToast]);

  const handleCopy = async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = inviteLink;
      document.body.appendChild(helper);
      helper.select();
      document.execCommand("copy");
      document.body.removeChild(helper);
    }

    setCopied(true);
    showToast("Invite link copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const share = (navigator as any).share;
    if (!share || !inviteLink) {
      await handleCopy();
      return;
    }

    try {
      await share({ title: tripTitle, text: `Join me on "${tripTitle}" in TripTally`, url: inviteLink });
    } catch {
      await handleCopy();
    }
  };

  return (
    <motion.div
      variants={modalBackdrop}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        variants={modalContent}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Invite to this trip</h2>
              <p className="text-xs text-slate-500">Anyone with the link can join</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close invite modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="mb-1.5 block text-xs font-semibold text-slate-700">Shareable invite link</label>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
          <input
            readOnly
            value={loading ? "Creating your invite link..." : inviteLink}
            onFocus={(event) => event.target.select()}
            className="min-w-0 flex-1 bg-transparent px-2 text-xs font-medium text-slate-700 outline-none"
          />
          <Button
            type="button"
            variant="primary"
            onClick={() => void handleCopy()}
            disabled={loading || !inviteLink}
            className="shrink-0 px-3 py-2 text-xs gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : copied ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span>{copied ? "Copied" : "Copy"}</span>
          </Button>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            {expiresAt
              ? `Link expires ${new Date(expiresAt).toLocaleDateString()}`
              : "Link stays active for 7 days"}
          </p>
          <button
            type="button"
            onClick={() => void handleShare()}
            disabled={loading || !inviteLink}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-40"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>Share</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
