"use client";

import { motion } from "framer-motion";
import MapBoxMap from "@/components/MapBoxMap";

export default function MapPage() {
  return (
    <main className="min-h-screen bg-[#F6FBF8] px-4 pb-5 pt-24 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto h-[calc(100vh-7.5rem)] w-full max-w-7xl"
      >
        <MapBoxMap />
      </motion.section>
    </main>
  );
}
