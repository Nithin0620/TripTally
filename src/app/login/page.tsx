"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import NeuInput from "@/components/ui/NeuInput";
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
              <h1 className="mb-2 text-4xl font-black text-[#0F172A]">
                Welcome Back
              </h1>
              <p className="text-[#64748B]">Sign in to continue your journey</p>
            </motion.div>

            <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
              <NeuInput
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />

              <NeuInput
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#64748B]">
                  <input type="checkbox" className="rounded border-[#CBD5E1]" />
                  Remember me
                </label>
                <a href="#" className="text-brand-blue hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" variant="primary" className="w-full" onClick={undefined}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E2E8F0]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-brand-bg px-2 text-[#94A3B8]">
                    Or continue with
                  </span>
                </div>
              </div>

              <div ref={googleButtonRef} className="flex justify-center" />
            </motion.form>

            <motion.p variants={fadeInUp} className="mt-6 text-center text-sm text-[#64748B]">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-brand-blue hover:underline">
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
