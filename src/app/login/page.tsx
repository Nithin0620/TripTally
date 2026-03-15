"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { fadeIn, fadeInUp } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
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

  // Define callback with useCallback to prevent re-initialization
  const handleGoogleLogin = useCallback(async (response: any) => {
    if (!response.credential) {
      showToast('Google sign-in failed', 'error');
      console.error('No credential in Google response:', response);
      return;
    }

    setLoading(true);
    try {
      const result = await loginWithGoogle(response.credential);
      
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Login successful!', 'success');
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    } catch (error) {
      console.error('Google login error:', error);
      showToast('An error occurred during login', 'error');
    } finally {
      setLoading(false);
    }
  }, [loginWithGoogle, router, showToast]);

  // Initialize Google Sign-In only after script loads
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        try {
          const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
          if (!clientId) {
            console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set');
            return;
          }

          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleLogin,
            auto_select: false,
          });
          
          console.log('Google Sign-In initialized successfully');
        } catch (error) {
          console.error('Error initializing Google Sign-In:', error);
        }
      } else {
        console.warn('Google Sign-In script not loaded yet');
      }
    };

    // Wait for Google script to load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeGoogleSignIn);
      return () => {
        document.removeEventListener('DOMContentLoaded', initializeGoogleSignIn);
      };
    } else {
      initializeGoogleSignIn();
    }
  }, [handleGoogleLogin]);

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

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled={loading}
                onClick={() => {
                  if (window.google && window.google.accounts && window.google.accounts.id) {
                    try {
                      // Trigger the One Tap UI or the browser's native prompt
                      window.google.accounts.id.prompt((notification: any) => {
                        if (notification.isNotDisplayed()) {
                          console.warn('Google Sign-In prompt not displayed');
                          showToast('Please enable popups for Google Sign-In', 'error');
                        }
                        if (notification.isSkippedMoment()) {
                          console.info('Google Sign-In prompt skipped by user');
                        }
                      });
                    } catch (error) {
                      console.error('Error triggering Google Sign-In:', error);
                      showToast('Google Sign-In error. Please try again.', 'error');
                    }
                  } else {
                    console.error('Google Sign-In not initialized');
                    showToast('Google Sign-In is not available', 'error');
                  }
                }}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? 'Signing In...' : 'Continue with Google'}
              </Button>
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
