import type { Metadata } from "next";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
