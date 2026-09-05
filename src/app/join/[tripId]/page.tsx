"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Toast from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { Compass, Calendar, Users, CheckCircle2, XCircle, Clock, ArrowRight, Loader2 } from "lucide-react";

interface InviteDetails {
  invite: {
    id: string;
    email: string;
    status: string;
    expires_at: string;
    created_at: string;
  };
  trip: {
    id: string;
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    cover_image?: string;
  };
  memberCount: number;
  isExpired: boolean;
  isAlreadyUsed: boolean;
}

export default function JoinTripPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tripId = params?.tripId as string;
  const inviteId = searchParams.get("invite");

  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [actionDone, setActionDone] = useState<"accepted" | "rejected" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteId) {
      setError("No invite code found in the invitation link.");
      setLoading(false);
      return;
    }

    const fetchInviteDetails = async () => {
      try {
        const res = await fetch(`/api/trips/invite/details?inviteId=${inviteId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load invitation details");
          return;
        }

        setInviteDetails(data);
      } catch {
        setError("Failed to load invitation details");
      } finally {
        setLoading(false);
      }
    };

    fetchInviteDetails();
  }, [inviteId]);

  const handleAccept = async () => {
    if (!user) {
      router.push(`/login?redirect=/join/${tripId}?invite=${inviteId}`);
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch("/api/trips/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inviteId }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to accept invite", "error");
        return;
      }

      setActionDone("accepted");
      showToast("Welcome to the trip!", "success");
      setTimeout(() => router.push(`/trips/${tripId}`), 1200);
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!user) {
      router.push(`/login?redirect=/join/${tripId}?invite=${inviteId}`);
      return;
    }

    setRejecting(true);
    try {
      const res = await fetch("/api/trips/reject-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inviteId }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Failed to decline invite", "error");
        return;
      }

      setActionDone("rejected");
      showToast("Invitation declined", "info");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-lg">
        {loading || authLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 space-y-4 text-center">
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-xl backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <XCircle className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Invitation</h2>
            <p className="text-xs text-slate-500 mb-6">{error}</p>
            <Button variant="secondary" href="/dashboard" className="text-xs py-2 px-4">
              Return to Dashboard
            </Button>
          </div>
        ) : actionDone === "accepted" ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/90 p-8 text-center shadow-xl backdrop-blur-md">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">You're on the Expedition!</h2>
            <p className="text-xs text-slate-600 mb-6">Opening your collaborative itinerary...</p>
          </div>
        ) : actionDone === "rejected" ? (
          <div className="rounded-3xl border border-slate-200 bg-white/95 p-8 text-center shadow-xl backdrop-blur-md">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Invitation Declined</h2>
            <p className="text-xs text-slate-500 mb-6">You have declined this expedition invitation.</p>
            <Button variant="secondary" href="/dashboard" className="text-xs py-2 px-4">
              Return to Dashboard
            </Button>
          </div>
        ) : inviteDetails ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-200/90 bg-white/95 overflow-hidden shadow-2xl backdrop-blur-md"
          >
            {/* Trip Cover Image */}
            <div className="relative h-44 bg-slate-900 overflow-hidden">
              <img
                src={
                  inviteDetails.trip.cover_image ||
                  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                }
                alt={inviteDetails.trip.title}
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                  Trip Invitation
                </span>
                <h1 className="text-2xl font-black">{inviteDetails.trip.title}</h1>
              </div>
            </div>

            {/* Invite Details Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {inviteDetails.trip.description || "You have been invited to join this collaborative travel itinerary."}
              </p>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-2xl text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>
                    {new Date(inviteDetails.trip.start_date).toLocaleDateString()} →{" "}
                    {new Date(inviteDetails.trip.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{inviteDetails.memberCount} member{inviteDetails.memberCount === 1 ? "" : "s"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="secondary"
                  onClick={handleReject}
                  disabled={rejecting || accepting}
                  className="flex-1 text-xs py-2.5"
                >
                  {rejecting ? "Declining..." : "Decline"}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAccept}
                  disabled={accepting || rejecting}
                  className="flex-1 text-xs py-2.5 gap-2"
                >
                  {accepting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Joining...</span>
                    </>
                  ) : (
                    <>
                      <span>Accept & Join</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
