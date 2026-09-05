import Link from "next/link";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[85vh] flex items-center justify-center px-4 py-24">
      <div className="mx-auto max-w-md text-center bg-white/90 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 shadow-xl">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-6 shadow-sm border border-blue-100">
          <Compass className="h-8 w-8 animate-spin duration-3000" />
        </div>
        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full mb-3">
          404 Error
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-3">Off the Trail</h1>
        <p className="text-sm text-slate-600 mb-8 leading-relaxed">
          The destination or trail you're looking for doesn't exist or has moved to a new route.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Return Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
