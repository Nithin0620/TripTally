"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Button from "./ui/Button";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-brand-bg/95 backdrop-blur-lg shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white">
            <span className="text-brand-accent">Trip</span>Tally
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/" className="text-sm font-medium text-white/80 transition hover:text-white">
              Home
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-white/80 transition hover:text-white">
              Pricing
            </Link>
            {user && (
              <Link href="/dashboard" className="text-sm font-medium text-white/80 transition hover:text-white">
                Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="hidden text-sm text-white/60 sm:inline">
                  {user.name}
                </span>
                <Button onClick={handleLogout} variant="secondary">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button href="/login" variant="secondary" className="hidden sm:inline-flex">
                  Login
                </Button>
                <Button href="/register">Get Started</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
