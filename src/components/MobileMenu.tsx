"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "@/types";

type NavItem = {
  label: string;
  href: string;
};

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
  pathname: string;
  user: User | null;
  onLogout: () => Promise<void>;
  onClose: () => void;
}

export default function MobileMenu({
  isOpen,
  navItems,
  pathname,
  user,
  onLogout,
  onClose,
}: MobileMenuProps) {
  const handleLogout = async () => {
    await onLogout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-[#17394B]/65 p-4 shadow-lg backdrop-blur-lg md:hidden"
        >
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative block rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute bottom-2 left-4 h-0.5 bg-[#EFEC07] transition-all duration-300 ${
                      isActive ? "w-10" : "w-0 group-hover:w-10"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
            {!user && (
              <Link
                href="/login"
                onClick={onClose}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-white/85 transition-all duration-300 hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>
            )}

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-white/85 transition-all duration-300 hover:bg-white/5 hover:text-white"
              >
                Logout
              </button>
            )}

            <Link
              href={user ? "/dashboard" : "/register"}
              onClick={onClose}
              className="block rounded-full bg-[#EFEC07] px-4 py-3 text-center text-sm font-semibold text-[#02131B] transition-all duration-300 hover:shadow-[0_10px_25px_rgba(250,204,21,0.4)]"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
