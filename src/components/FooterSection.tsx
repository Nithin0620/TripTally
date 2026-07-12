"use client";

import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-brand-bg py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-xl font-bold">
              Trip<span className="text-brand-accent">Tally</span>
            </h3>
            <p className="text-sm text-[#64748B]">
              AI-powered travel planning made simple and affordable.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-[#0F172A]">Product</h4>
            <div className="space-y-2">
              <Link href="/dashboard" className="block text-sm text-[#64748B] transition hover:text-[#0F172A]">
                Dashboard
              </Link>
              <Link href="/explore" className="block text-sm text-[#64748B] transition hover:text-[#0F172A]">
                Explore
              </Link>
              <Link href="/templates" className="block text-sm text-[#64748B] transition hover:text-[#0F172A]">
                Templates
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-[#0F172A]">Company</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-[#64748B] transition hover:text-[#0F172A]">
                About
              </a>
              <a href="#" className="block text-sm text-[#64748B] transition hover:text-[#0F172A]">
                Blog
              </a>
              <a href="#" className="block text-sm text-[#64748B] transition hover:text-[#0F172A]">
                Contact
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-semibold text-[#0F172A]">Legal</h4>
            <div className="space-y-2">
              <a href="#" className="block text-sm text-[#64748B] transition hover:text-[#0F172A]">
                Privacy Policy
              </a>
              <a href="#" className="block text-sm text-[#64748B] transition hover:text-[#0F172A]">
                Terms of Service
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#E2E8F0] pt-8 text-center text-sm text-[#64748B]">
          <p>&copy; 2026 TripTally. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
