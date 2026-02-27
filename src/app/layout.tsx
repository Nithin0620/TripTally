import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripTally - AI-Powered Travel Planning & Expense Management",
  description: "An intelligent platform for group trip planning, itinerary management, and expense splitting with AI recommendations and OCR bill scanning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
