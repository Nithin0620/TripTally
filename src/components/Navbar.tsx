"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import MobileMenu from "@/components/MobileMenu";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Templates", href: "/templates" },
  { label: "Maps", href: "/map" },
  { label: "AI Planner", href: "/ai-planner" },
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
    <nav className="fixed top-0 z-50 w-full transition-transform duration-500 ease-in-out hover:-translate-y-1">
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: [0, 0, 0] }}
        // whileHover={{ y: -8 }}
        transition={{
          opacity: { duration: 0.00, ease: "easeInOut" },
          y: { duration: 2.5, ease: "easeInOut", repeat: Infinity },
        }}
        className="mx-auto mt-4 max-w-7xl px-6"
      >
        <div
          className="flex h-[64px] items-center justify-between rounded-full border border-[#cfe0d7] px-6 bg-white/90 shadow-lg transition-all ease-in-out duration-500"
        >
          <Link href="/" className="text-xl font-bold text-[#163427] sm:text-2xl">
            TripTally
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative text-sm font-medium transition-all duration-300 hover:scale-105 ${
                    isActive ? "text-[#163427]" : "text-[#4f6f5e] hover:text-[#163427]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-[#EFEC07] transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {!user && (
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-medium text-[#4f6f5e] transition-all duration-300 hover:scale-105 hover:text-[#163427]"
              >
                Login
              </Link>
            )}

            {user && (
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b9d3c5] bg-[#edf6f1] text-xs font-semibold text-[#163427]">
                {getInitials(user.name || user.email)}
              </div>
            )}

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full px-3 py-2 text-sm font-medium text-[#4f6f5e] transition-all duration-300 hover:scale-105 hover:text-[#163427]"
              >
                Logout
              </button>
            )}

            <Link
              href={user ? "/dashboard" : "/register"}
              className="rounded-full bg-[#EFEC07] px-6 py-2.5 text-sm font-semibold text-[#163427] transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_25px_rgba(250,204,21,0.4)]"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#cfe0d7] bg-white text-[#163427] transition-all duration-300 hover:bg-[#f3faf6] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <div className="relative h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-0.5 w-5 bg-[#163427] transition-all duration-300 ${
                  mobileOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute left-0 top-[7px] h-0.5 w-5 bg-[#163427] transition-all duration-300 ${
                  mobileOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 top-[14px] h-0.5 w-5 bg-[#163427] transition-all duration-300 ${
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
