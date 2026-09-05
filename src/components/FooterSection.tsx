"use client";

import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="border-t border-brand-sand/30 bg-brand-bg py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-serif text-xl font-black text-brand-text">
              Trip<span className="text-brand-accent">Tally</span>
            </h3>
            <p className="text-sm text-brand-text/60">
              AI-powered travel planning made simple and affordable.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-brand-text">Product</h4>
            <div className="space-y-2">
              <Link href="/dashboard" className="block text-sm text-brand-text/60 transition hover:text-brand-text">
                Dashboard
              </Link>
              <Link href="/explore" className="block text-sm text-brand-text/60 transition hover:text-brand-text">
                Explore
              </Link>
              <Link href="/templates" className="block text-sm text-brand-text/60 transition hover:text-brand-text">
                Templates
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-brand-text">Company</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-brand-text/60 transition hover:text-brand-text">
                About
              </a>
              <a href="#" className="block text-sm text-brand-text/60 transition hover:text-brand-text">
                Blog
              </a>
              <a href="#" className="block text-sm text-brand-text/60 transition hover:text-brand-text">
                Contact
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-brand-text">Legal</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-brand-text/60 transition hover:text-brand-text">
                Privacy Policy
              </a>
              <a href="#" className="block text-sm text-brand-text/60 transition hover:text-brand-text">
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-brand-sand/30 pt-8 text-center text-sm text-brand-text/50">
          <p>&copy; 2026 TripTally. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
