"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "@/types";
import NotificationCenter from "@/components/notifications/NotificationCenter";

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
          className="glass-card mt-3 overflow-hidden rounded-3xl p-4 md:hidden"
        >
          <div className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`group relative block rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-sand/30 text-brand-text"
                      : "text-brand-text/60 hover:bg-brand-sand/20 hover:text-brand-text"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute bottom-2 left-4 h-0.5 bg-brand-accent transition-all duration-300 ${
                      isActive ? "w-10" : "w-0 group-hover:w-10"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          <div className="mt-4 space-y-2 border-t border-brand-sand/30 pt-4">
            {user && (
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm font-semibold text-brand-text">
                  {user.name || user.email}
                </span>
                <NotificationCenter />
              </div>
            )}

            {user && (
              <Link
                href="/profile"
                onClick={onClose}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-brand-text/60 transition-all duration-200 hover:bg-brand-sand/20 hover:text-brand-text"
              >
                Profile &amp; settings
              </Link>
            )}

            {!user && (
              <Link
                href="/login"
                onClick={onClose}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-brand-text/60 transition-all duration-200 hover:bg-brand-sand/20 hover:text-brand-text"
              >
                Login
              </Link>
            )}

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="block w-full rounded-2xl px-4 py-3 text-left text-sm font-medium text-brand-text/60 transition-all duration-200 hover:bg-brand-sand/20 hover:text-brand-text"
              >
                Logout
              </button>
            )}

            <Link
              href={user ? "/dashboard" : "/register"}
              onClick={onClose}
              className="block rounded-full bg-brand-accent px-4 py-3 text-center text-sm font-semibold text-white transition-all duration-200 hover:brightness-105"
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
