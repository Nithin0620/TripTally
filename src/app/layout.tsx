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
      <head>
        <script
          async
          src="https://accounts.google.com/gsi/client"
        ></script>
      </head>
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
