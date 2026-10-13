"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Volume2, VolumeX } from 'lucide-react';
import { useTranslations } from "next-intl";
import { navLinks, APP_NAME } from "@/lib/data";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const t = useTranslations();
  const navT = t.raw("nav") as Record<string, string>;

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "var(--card)",
        borderBottom: "3px solid var(--border)",
        boxShadow: "0 4px 16px rgba(255,107,107,0.12), 0 2px 8px rgba(77,150,255,0.10)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="text-3xl select-none"
            >
              🌈
            </motion.div>
            <span
              className="text-2xl md:text-3xl tracking-tight"
              style={{ fontFamily: "'Fredoka One', sans-serif", color: "var(--primary)" }}
            >
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

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

              const resolvedHref =
                link.href.startsWith("#") && pathname !== "/"
                  ? "/" + link.href
                  : link.href;

              return (
                <motion.div
                  key={link.key}
                  whileHover={{ scale: 1.08, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={resolvedHref}
                    onClick={handleClick}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-base font-semibold transition-all duration-200"
                    style={{
                      fontFamily: "'Nunito', sans-serif",
                      color: isActive ? "var(--card)" : "var(--foreground)",
                      background: isActive ? "var(--primary)" : "transparent",
                      border: isActive
                        ? "2px solid var(--primary)"
                        : "2px solid transparent",
                    }}
                  >
                    <span>{link.emoji}</span>
                    <span>{navT[link.key] ?? link.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Sound Toggle + Mobile Menu */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSoundOn((s) => !s)}
              aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
              className="flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold transition-all duration-200"
              style={{
                background: soundOn ? "var(--accent)" : "var(--muted-foreground)",
                borderColor: soundOn ? "var(--accent)" : "var(--muted-foreground)",
                color: "white",
              }}
            >
              {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-full border-2"
              style={{
                background: "var(--primary)",
                borderColor: "var(--primary)",
                color: "white",
              }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden overflow-hidden"
            style={{
              background: "var(--card)",
              borderTop: "2px solid var(--border)",
            }}
          >
            <nav className="flex flex-col gap-1 px-4 py-4">
              {navLinks.map((link, i) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(link.href);

                const handleClick =
                  link.href.startsWith("#")
                    ? (e: React.MouseEvent) => {
                        if (pathname === "/") {
                          e.preventDefault();
                          document
                            .querySelector(link.href)
                            ?.scrollIntoView({ behavior: "smooth" });
                        }
                        setMenuOpen(false);
                      }
                    : () => setMenuOpen(false);

                const resolvedHref =
                  link.href.startsWith("#") && pathname !== "/"
                    ? "/" + link.href
                    : link.href;

                return (
                  <motion.div
                    key={link.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Link
                      href={resolvedHref}
                      onClick={handleClick}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-lg font-semibold transition-all duration-200"
                      style={{
                        fontFamily: "'Nunito', sans-serif",
                        color: isActive ? "var(--card)" : "var(--foreground)",
                        background: isActive ? "var(--primary)" : "transparent",
                      }}
                    >
                      <span className="text-xl">{link.emoji}</span>
                      <span>{navT[link.key] ?? link.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}