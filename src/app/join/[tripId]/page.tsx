"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import NeuCard from "@/components/ui/NeuCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Toast from "@/components/ui/Toast";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { fadeInUp } from "@/lib/animations";

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
      setError("No invite link provided");
      setLoading(false);
      return;
    }

    const fetchInviteDetails = async () => {
      try {
        const res = await fetch(`/api/trips/invite/details?inviteId=${inviteId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load invite");
          return;
        }

        setInviteDetails(data);
      } catch {
        setError("Failed to load invite details");
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
      setTimeout(() => router.push(`/trips/${tripId}`), 1500);
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
        showToast(data.error || "Failed to reject invite", "error");
        return;
      }

      setActionDone("rejected");
      showToast("Invite declined", "info");
    } catch {
      showToast("Something went wrong", "error");
    } finally {
      setRejecting(false);
    }
  };

  if (loading || authLoading) {
    return <LoadingSpinner text="Loading invitation..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <motion.div className="w-full max-w-md" variants={fadeInUp} initial="hidden" animate="visible">
          <NeuCard className="!p-8 text-center">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Invalid Invitation</h1>
            <p className="text-[#64748B] mb-6">{error}</p>
            <Link href="/dashboard">
              <Button variant="primary" className="w-full">Go to Dashboard</Button>
            </Link>
          </NeuCard>
        </motion.div>
      </div>
    );
  }

  if (!inviteDetails) return null;

  const { trip, memberCount, isExpired, isAlreadyUsed, invite } = inviteDetails;
  const isEmailMismatch = user && user.email.toLowerCase() !== invite.email.toLowerCase();

  if (actionDone === "rejected") {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <motion.div className="w-full max-w-md" variants={fadeInUp} initial="hidden" animate="visible">
          <NeuCard className="!p-8 text-center">
            <div className="text-5xl mb-4">👋</div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Invitation Declined</h1>
            <p className="text-[#64748B] mb-6">You&apos;ve declined the invitation to join &ldquo;{trip.title}&rdquo;.</p>
            <Link href="/dashboard">
              <Button variant="primary" className="w-full">Go to Dashboard</Button>
            </Link>
          </NeuCard>
        </motion.div>
      </div>
    );
  }

  if (actionDone === "accepted") {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
        <motion.div className="w-full max-w-md" variants={fadeInUp} initial="hidden" animate="visible">
          <NeuCard className="!p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Welcome Aboard!</h1>
            <p className="text-[#64748B] mb-6">Redirecting you to &ldquo;{trip.title}&rdquo;...</p>
          </NeuCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4 py-20">
      <motion.div className="w-full max-w-lg" variants={fadeInUp} initial="hidden" animate="visible">
        <NeuCard className="!p-8">
          {/* Trip Cover */}
          <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
            <img
              src={
                trip.cover_image ||
                "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
              }
              alt={trip.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <h1 className="text-2xl font-black text-white drop-shadow-lg">{trip.title}</h1>
            </div>
          </div>

          {/* Trip Info */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <span>📅</span>
              <span>
                {new Date(trip.start_date).toLocaleDateString()} →{" "}
                {new Date(trip.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#64748B]">
              <span>👥</span>
              <span>
                {memberCount} {memberCount === 1 ? "member" : "members"} so far
              </span>
            </div>
            {trip.description && (
              <p className="text-[#475569] text-sm leading-relaxed">{trip.description}</p>
            )}
          </div>

          {/* Invite Status Messages */}
          {isExpired && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-600 text-sm font-medium">
                This invitation has expired. Ask the trip owner to send a new one.
              </p>
            </div>
          )}

          {isAlreadyUsed && !isExpired && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-blue-600 text-sm font-medium">
                This invitation has already been {invite.status}.
              </p>
            </div>
          )}

          {isEmailMismatch && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-amber-600 text-sm font-medium">
                This invite is for <strong>{invite.email}</strong>, but you&apos;re logged in as{" "}
                <strong>{user?.email}</strong>. Please log in with the correct account.
              </p>
            </div>
          )}

          {/* Actions */}
          {!isExpired && !isAlreadyUsed && (
            <div className="space-y-3">
              {!user ? (
                <>
                  <p className="text-center text-sm text-[#64748B] mb-4">
                    Sign in or create an account to join this trip
                  </p>
                  <Link href={`/login?redirect=/join/${tripId}?invite=${inviteId}`}>
                    <Button variant="primary" className="w-full">
                      Sign In to Join
                    </Button>
                  </Link>
                  <Link href={`/register?redirect=/join/${tripId}?invite=${inviteId}`}>
                    <Button variant="secondary" className="w-full">
                      Create Account
                    </Button>
                  </Link>
                </>
              ) : isEmailMismatch ? (
                <Link href="/login">
                  <Button variant="primary" className="w-full">
                    Sign In with {invite.email}
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleAccept}
                    disabled={accepting || rejecting}
                  >
                    {accepting ? "Joining..." : "Join Trip"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={handleReject}
                    disabled={accepting || rejecting}
                  >
                    {rejecting ? "Declining..." : "Decline"}
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-white/30 text-center">
            <Link href="/dashboard" className="text-xs text-[#94A3B8] hover:text-[#64748B] transition-colors">
              ← Back to TripTally
            </Link>
          </div>
        </NeuCard>
      </motion.div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
