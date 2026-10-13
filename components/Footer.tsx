"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { navLinks, APP_NAME, APP_TAGLINE } from "@/lib/data";

export default function Footer() {
  const pathname = usePathname();
  const t = useTranslations();
  const navT = t.raw("nav") as Record<string, string>;
  const footerT = t.raw("footer") as Record<string, string>;

  return (
    <footer
      className="w-full mt-auto"
      style={{
        background: "var(--foreground)",
        borderTop: "4px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🌈</span>
              <span
                className="text-2xl"
                style={{
                  fontFamily: "'Fredoka One', sans-serif",
                  color: "var(--primary)",
                }}
              >
                {APP_NAME}
              </span>
            </div>
            <p
              className="text-base leading-relaxed"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {APP_TAGLINE}
            </p>
            <div className="flex gap-2 mt-2 text-2xl">
              {["🎮", "🧩", "🎨", "🧠", "⭐"].map((emoji, i) => (
                <motion.span
                  key={i}
                  whileHover={{ scale: 1.3, rotate: 10 }}
                  className="cursor-default select-none"
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex flex-col gap-2">
            <h3
              className="text-lg mb-2"
              style={{
                fontFamily: "'Fredoka One', sans-serif",
                color: "var(--border)",
              }}
            >
              {footerT["explore"] ?? "Explore"}
            </h3>
            {navLinks.map((link) => {
              const resolvedHref =
                link.href.startsWith("#") && pathname !== "/"
                  ? "/" + link.href
                  : link.href;

              const handleClick =
                link.href.startsWith("#")
                  ? (e: React.MouseEvent) => {
                      if (pathname === "/") {
                        e.preventDefault();
                        document
                          .querySelector(link.href)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }
                    }
                  : undefined;

              return (
                <motion.div key={link.key} whileHover={{ x: 4 }}>
                  <Link
                    href={resolvedHref}
                    onClick={handleClick}
                    className="flex items-center gap-2 text-base font-semibold transition-colors duration-200"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    <span>{link.emoji}</span>
                    <span>{navT[link.key] ?? link.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Fun message */}
          <div className="flex flex-col gap-3">
            <h3
              className="text-lg mb-2"
              style={{
                fontFamily: "'Fredoka One', sans-serif",
                color: "var(--border)",
              }}
            >
              {footerT["safeAndFun"] ?? "Safe & Fun!"}
            </h3>
            <p className="text-base" style={{ color: "rgba(255,255,255,0.7)" }}>
              {footerT["safeMessage"] ??
                "KidZone is a safe place made just for kids. No sign-ups, no ads, just pure fun!"}
            </p>
            <div
              className="mt-2 px-4 py-3 rounded-2xl text-sm font-semibold"
              style={{
                background: "rgba(255,217,61,0.15)",
                border: "2px solid var(--border)",
                color: "var(--border)",
              }}
            >
              {footerT["madeWithLove"] ?? "Made with ❤️ for kids everywhere!"}
            </div>
          </div>
        </div>

        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
        >
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            {footerT["copyright"] ?? `© ${new Date().getFullYear()} KidZone. All rights reserved.`}
          </p>
          <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            <span>🌟</span>
            <span>{footerT["tagline"] ?? "Play. Learn. Grow."}</span>
            <span>🌟</span>
          </div>
        </div>
      </div>
    </footer>
  );
}