"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Compass, Loader2, Mail, RefreshCw, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";

type VerifyState = "verifying" | "verified" | "error" | "idle";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshSession } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const token = searchParams.get("token");
  const emailFromQuery = searchParams.get("email") || "";
  const [email, setEmail] = useState(emailFromQuery);
  const [state, setState] = useState<VerifyState>(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;
    (async () => {
      const response = await authApi.verifyEmail(token);
      if (!active) return;

      if (response.error) {
        setState("error");
        setMessage(response.error);
        return;
      }

      setState("verified");
      await refreshSession();
      showToast("Email verified. Welcome to TripTally!", "success");
      setTimeout(() => router.replace("/dashboard"), 1200);
    })();

    return () => {
      active = false;
    };
  }, [token, refreshSession, router, showToast]);

  const handleResend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setResending(true);
    const response = await authApi.resendVerification(email.trim());
    setResending(false);

    if (response.error) {
      showToast(response.error, "error");
      return;
    }

    setMessage(response.data?.message || "Verification email sent.");
    setState("idle");
    showToast("Verification email sent. Check your inbox.", "success");
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white/95 p-8 text-center shadow-2xl backdrop-blur-xl"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
            <Compass className="h-6 w-6" />
          </div>

          {state === "verifying" && (
            <>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Verifying your email</h1>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                This will only take a moment.
              </p>
            </>
          )}

          {state === "verified" && (
            <>
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Email verified</h1>
              <p className="mt-2 text-sm text-slate-500">Taking you to your dashboard…</p>
            </>
          )}

          {state === "error" && (
            <>
              <XCircle className="mx-auto mb-3 h-12 w-12 text-rose-500" />
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Link unavailable</h1>
              <p className="mt-2 text-sm text-slate-500">{message}</p>
            </>
          )}

          {state === "idle" && (
            <>
              <Mail className="mx-auto mb-3 h-12 w-12 text-blue-600" />
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Check your inbox</h1>
              <p className="mt-2 text-sm text-slate-500">
                We sent a verification link to your email address. The link expires in 24 hours.
              </p>
              {message && <p className="mt-3 text-xs font-semibold text-emerald-600">{message}</p>}
            </>
          )}

          {state !== "verified" && (
            <form onSubmit={handleResend} className="mt-8 space-y-4 text-left">
              <NeuInput
                label="Need a new link?"
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={resending}
              />
              <Button type="submit" variant="secondary" disabled={resending || !email.trim()} className="w-full">
                {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span>Resend verification email</span>
              </Button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-slate-500 font-medium">
            Already verified?{" "}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading verification…
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
