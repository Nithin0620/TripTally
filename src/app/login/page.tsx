"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import GlassCard from "@/components/ui/GlassCard";
import { fadeIn, fadeInUp } from "@/lib/animations";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toasts, showToast, removeToast } = useToast();

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
              <h1 className="mb-2 text-4xl font-black text-white">
                Welcome Back
              </h1>
              <p className="text-white/70">Sign in to continue your journey</p>
            </motion.div>

            <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-white/20 bg-brand-surface/85 px-4 py-3 text-white placeholder-white/50 backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-white/20 bg-brand-surface/85 px-4 py-3 text-white placeholder-white/50 backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50 disabled:opacity-50"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-white/70">
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
                  <div className="w-full border-t border-white/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-brand-bg px-2 text-white/60">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => showToast('Google OAuth coming soon!', 'info')}
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
                Continue with Google
              </Button>
            </motion.form>

            <motion.p variants={fadeInUp} className="mt-6 text-center text-sm text-white/70">
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

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <GlassCard className="p-8">
          <motion.div variants={fadeInUp} className="mb-8 text-center">
            <h1 className="mb-2 text-4xl font-black text-white">
              Welcome Back
            </h1>
            <p className="text-white/70">Sign in to continue your journey</p>
          </motion.div>

          <motion.form variants={fadeInUp} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-brand-surface/85 px-4 py-3 text-white placeholder-white/50 backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-brand-surface/85 px-4 py-3 text-white placeholder-white/50 backdrop-blur-md transition focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-white/70">
                <input type="checkbox" className="rounded border-white/20" />
                Remember me
              </label>
              <a href="#" className="text-brand-accent hover:underline">
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Sign In
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-brand-bg px-2 text-white/60">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => console.log("Google login")}
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
              Continue with Google
            </Button>
          </motion.form>

          <motion.p variants={fadeInUp} className="mt-6 text-center text-sm text-white/70">
            Don't have an account?{" "}
            <Link href="/register" className="text-brand-accent hover:underline">
              Sign up
            </Link>
          </motion.p>
        </GlassCard>
      </motion.div>
    </div>
  );
}
