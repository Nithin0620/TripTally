import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import AmbientBackground from "@/components/ui/AmbientBackground";

export const metadata: Metadata = {
  title: "TripTally",
  description: "Trip planning and expense tracking application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className="bg-[#f6fbf8]">
        <AmbientBackground />
        <AuthProvider>
          <div className="relative z-10 min-h-screen overflow-x-hidden">
            <Navbar />
            <main>{children}</main>
            <FooterSection />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
