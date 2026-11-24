"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Compass, ArrowRight, KeyRound, Loader2, Lock } from "lucide-react";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import { authApi } from "@/lib/api/auth";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const { toasts, showToast, removeToast } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      showToast("This reset link is missing its token.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords don't match!", "error");
      return;
    }

    setLoading(true);
    const response = await authApi.resetPassword(token, password);
    setLoading(false);

    if (response.error) {
      showToast(response.error, "error");
      return;
    }

    showToast("Password updated. Sign in with your new password.", "success");
    setTimeout(() => router.replace("/login"), 1200);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white/95 p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <Compass className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Choose a new password</h1>
            <p className="mt-1 text-sm text-slate-500">Use at least 8 characters.</p>
          </div>

          {!token ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              This link is invalid.{" "}
              <Link href="/forgot-password" className="font-bold underline">
                Request a new one
              </Link>
              .
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <NeuInput
                label="New Password"
                icon={<Lock className="h-4 w-4" />}
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
                disabled={loading}
                autoFocus
              />
              <NeuInput
                label="Confirm Password"
                icon={<KeyRound className="h-4 w-4" />}
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
                disabled={loading}
              />
              <Button type="submit" variant="primary" disabled={loading || !password || !confirmPassword} className="w-full py-3">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                <span>Update password</span>
              </Button>
            </form>
          )}
        </motion.div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
          Loading reset link…
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
