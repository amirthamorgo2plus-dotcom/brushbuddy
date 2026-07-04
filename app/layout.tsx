import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageViewTracker from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: "BrushBuddy — Your buddy for a better space",
  description: "Painting, deep cleaning, waterproofing & more — trusted local pros for homes and businesses.",
  icons: { icon: "/brushbuddy-logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <PageViewTracker />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
