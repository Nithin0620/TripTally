"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Compass, Loader2, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import { authApi } from "@/lib/api/auth";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const response = await authApi.requestPasswordReset(email.trim());
    setLoading(false);

    if (response.error) {
      showToast(response.error, "error");
      return;
    }

    setSent(true);
    showToast("Reset link sent. Check your inbox.", "success");
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
            <h1 className="text-2xl font-black tracking-tight text-slate-900">Reset your password</h1>
            <p className="mt-1 text-sm text-slate-500">
              Enter your email and we&apos;ll send you a secure reset link.
            </p>
          </div>

          {sent ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              If an account exists for <strong>{email}</strong>, a reset link is on its way. The link expires in 1 hour.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <NeuInput
                label="Email Address"
                icon={<Mail className="h-4 w-4" />}
                type="email"
                placeholder="name@domain.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={loading}
                autoFocus
              />
              <Button type="submit" variant="primary" disabled={loading || !email.trim()} className="w-full py-3">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                <span>Send reset link</span>
              </Button>
            </form>
          )}

          <Link
            href="/login"
            className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </motion.div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
