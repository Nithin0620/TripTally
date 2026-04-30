"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import GoogleIdentityScript from "@/components/GoogleIdentityScript";
import { fadeIn, fadeInUp } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { useGoogleSignIn } from "@/hooks/useGoogleSignIn";
import Toast from "@/components/ui/Toast";

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
        showToast('Login successful!', 'success');
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    },
    onError: (error) => {
      console.error('Error initializing Google Sign-In:', error);
      showToast('Google Sign-In could not be loaded', 'error');
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
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GoogleIdentityScript />
      <div className="flex min-h-screen items-center justify-center px-4 py-24">
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <GlassCard className="p-8">
            <motion.div variants={fadeInUp} className="mb-8 text-center">
              <h1 className="mb-2 text-4xl font-black text-[#163427]">
                Welcome Back
              </h1>
              <p className="text-[#5f7a6c]">Sign in to continue your journey</p>
            </motion.div>

            <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] placeholder-[#7a9186] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5f7a6c]">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-[#cfe0d7] bg-brand-surface px-4 py-3 text-[#163427] placeholder-[#7a9186] backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#5f7a6c]">
                  <input type="checkbox" className="rounded border-white/20" />
                  Remember me
                </label>
                <a href="#" className="text-brand-accent hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" variant="primary" className="w-full" onClick={undefined}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#d8e7df]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-brand-bg px-2 text-[#7a9186]">
                    Or continue with
                  </span>
                </div>
              </div>

              <div ref={googleButtonRef} className="flex justify-center" />
            </motion.form>

            <motion.p variants={fadeInUp} className="mt-6 text-center text-sm text-[#5f7a6c]">
              Don't have an account?{" "}
              <Link href="/register" className="text-brand-accent hover:underline">
                Sign up
              </Link>
            </motion.p>
          </GlassCard>
        </motion.div>
      </div>
      
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
