import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";

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
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <FooterSection />
        </AuthProvider>
      </body>
    </html>
  );
}
