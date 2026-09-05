"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import GoogleIdentityScript from "@/components/GoogleIdentityScript";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import Toast from "@/components/ui/Toast";
import { Compass, Sparkles, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();
  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  useGoogleSignIn({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
    onSuccess: async (token) => {
      const result = await loginWithGoogle(token);

      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Welcome back!', 'success');
        setTimeout(() => router.push('/dashboard'), 800);
      }
    },
    onError: (error) => {
      console.error('Google Sign-In initialization error:', error);
      showToast('Google authentication unavailable', 'error');
    },
    buttonRef: googleButtonRef,
    context: 'signin',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Login successful!', 'success');
        setTimeout(() => router.push('/dashboard'), 800);
      }
    } catch {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GoogleIdentityScript />
      <div className="min-h-screen flex items-center justify-center px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white/95 p-8 shadow-2xl backdrop-blur-xl"
        >
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25">
              <Compass className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in to manage your itineraries and group expenses.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <NeuInput
              label="Email Address"
              icon={<Mail className="h-4 w-4" />}
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoFocus
            />

            <NeuInput
              label="Password"
              icon={<Lock className="h-4 w-4" />}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-700">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-3 text-xs font-bold gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to TripTally</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Or continue with
              </span>
            </div>

            <div ref={googleButtonRef} className="flex justify-center min-h-[40px]" />
          </form>

          <p className="mt-8 text-center text-xs text-slate-500 font-medium">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
