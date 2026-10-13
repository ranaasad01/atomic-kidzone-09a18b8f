import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LocaleProvider from "@/components/LocaleProvider";
import LanguageToggle from "@/components/LanguageToggle";

export const metadata: Metadata = {
  formatDetection: { telephone: false, date: false, email: false, address: false },
  title: "KidZone — Games, Puzzles, Coloring & More!",
  description:
    "KidZone is the fun place for kids to play mini-games, solve puzzles, color pictures, and take on memory challenges. Safe, colorful, and totally awesome!",
  openGraph: {
    title: "KidZone — Games, Puzzles, Coloring & More!",
    description:
      "KidZone is the fun place for kids to play mini-games, solve puzzles, color pictures, and take on memory challenges.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--background)" }}>
        <LocaleProvider>
          <LanguageToggle />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}