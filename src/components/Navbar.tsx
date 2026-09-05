"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import MobileMenu from "@/components/MobileMenu";
import NotificationCenter from "@/components/notifications/NotificationCenter";

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
    <nav className="fixed top-0 z-50 w-full">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto mt-4 max-w-7xl px-6"
      >
        <div
          className="glass-card flex h-[64px] items-center justify-between rounded-full px-6 border border-brand-sand/30 shadow-sm"
        >
          <Link href="/" className="font-serif text-xl font-black text-brand-text sm:text-2xl tracking-tight">
            Trip<span className="text-brand-accent">Tally</span>
          </Link>
 
          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => {
               const isActive = pathname === item.href;
 
               return (
                 <Link
                   key={item.href}
                   href={item.href}
                   className={`group relative text-sm font-medium transition-all duration-200 ${
                     isActive ? "text-brand-text" : "text-brand-text/60 hover:text-brand-text"
                   }`}
                 >
                   {item.label}
                   <span
                     className={`absolute -bottom-1 left-0 h-0.5 bg-brand-accent transition-all duration-300 ${
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
                 className="rounded-full px-3 py-2 text-sm font-semibold text-brand-text/60 transition-all duration-200 hover:text-brand-text"
               >
                 Login
               </Link>
             )}
 
             {user && (
               <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-sand/55 border border-brand-sand/80 text-xs font-bold text-brand-text">
                 {getInitials(user.name || user.email)}
               </div>
             )}
 
             {user && <NotificationCenter />}
 
             {user && (
               <button
                 type="button"
                 onClick={handleLogout}
                 className="rounded-full px-3 py-2 text-sm font-semibold text-brand-text/60 transition-all duration-200 hover:text-brand-text"
               >
                 Logout
               </button>
             )}
 
             <Link
               href={user ? "/dashboard" : "/register"}
               className="rounded-full bg-brand-accent px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-105 shadow-sm hover:shadow-md"
             >
               Get Started
             </Link>
           </div>
 
           <button
             type="button"
             onClick={() => setMobileOpen((prev) => !prev)}
             className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-sand/50 bg-white/80 text-brand-text transition-all duration-300 md:hidden"
             aria-label="Toggle menu"
             aria-expanded={mobileOpen}
           >
             <div className="relative h-4 w-5">
               <span
                 className={`absolute left-0 top-0 h-0.5 w-5 bg-brand-text transition-all duration-300 ${
                   mobileOpen ? "translate-y-[7px] rotate-45" : ""
                 }`}
               />
               <span
                 className={`absolute left-0 top-[7px] h-0.5 w-5 bg-brand-text transition-all duration-300 ${
                   mobileOpen ? "opacity-0" : "opacity-100"
                 }`}
               />
               <span
                 className={`absolute left-0 top-[14px] h-0.5 w-5 bg-brand-text transition-all duration-300 ${
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
