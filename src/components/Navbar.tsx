"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import MobileMenu from "@/components/MobileMenu";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { Compass, Sparkles } from "lucide-react";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "AI Planner", href: "/ai-planner" },
  { label: "Templates", href: "/templates" },
  { label: "Interactive Map", href: "/map" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  return (
    <nav className="fixed top-0 z-50 w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="glass-card flex h-[66px] items-center justify-between rounded-2xl px-6 border border-slate-200/80 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">
              Trip<span className="text-blue-600">Tally</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-blue-600 bg-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                  }`}
                >
                  {item.label}
                  {item.href === "/ai-planner" && (
                    <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!user && (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
              >
                Log In
              </Link>
            )}

            {user && (
              <Link
                href="/profile"
                aria-label="Account settings"
                title="Account settings"
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700 transition-all hover:border-blue-400 hover:shadow-sm"
              >
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.name || user.email}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user.name || user.email)
                )}
              </Link>
            )}

            {user && <NotificationCenter />}

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
              >
                Logout
              </button>
            )}

            <Link
              href={user ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              {user ? "Dashboard" : "Get Started"}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 transition-all md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <div className="relative h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-slate-900 transition-all duration-300 ${
                  mobileOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 bg-slate-900 transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 bg-slate-900 transition-all duration-300 ${
                  mobileOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </div>

        <MobileMenu
          isOpen={mobileOpen}
          navItems={navItems}
          pathname={pathname}
          user={user}
          onLogout={handleLogout}
          onClose={() => setMobileOpen(false)}
        />
      </motion.div>
    </nav>
  );
}
