"use client";

import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="border-t border-white/10 bg-brand-bg py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold">
              <span className="text-brand-accent">Trip</span>Tally
            </h3>
            <p className="text-sm text-white/60">
              AI-powered travel planning made simple and affordable.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Product</h4>
            <div className="space-y-2">
              <Link href="/dashboard" className="block text-sm text-white/60 transition hover:text-white">
                Dashboard
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Company</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-white/60 transition hover:text-white">
                About
              </a>
              <a href="#" className="block text-sm text-white/60 transition hover:text-white">
                Blog
              </a>
              <a href="#" className="block text-sm text-white/60 transition hover:text-white">
                Contact
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-white">Legal</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-white/60 transition hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="block text-sm text-white/60 transition hover:text-white">
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/60">
          <p>&copy; 2026 TripTally. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
