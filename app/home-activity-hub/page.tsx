"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { Star, Zap, Trophy, Heart, Sparkles, ArrowRight, Play } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { bounceIn, staggerContainer, fadeInUp } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const ACTIVITIES = [
  {
    id: "mini-games",
    emoji: "🎮",
    href: "/mini-games",
    bg: "bg-[var(--primary)]/15",
    border: "border-[var(--primary)]",
    glow: "shadow-[0_0_24px_var(--primary)]",
    btnBg: "bg-[var(--primary)]",
  },
  {
    id: "puzzles",
    emoji: "🧩",
    href: "/puzzles",
    bg: "bg-[var(--highlight)]/15",
    border: "border-[var(--highlight)]",
    glow: "shadow-[0_0_24px_var(--highlight)]",
    btnBg: "bg-[var(--highlight)]",
  },
  {
    id: "coloring",
    emoji: "🎨",
    href: "/coloring",
    bg: "bg-[var(--success)]/15",
    border: "border-[var(--success)]",
    glow: "shadow-[0_0_24px_var(--success)]",
    btnBg: "bg-[var(--success)]",
  },
  {
    id: "memory-challenge",
    emoji: "🃏",
    href: "/memory-challenge",
    bg: "bg-[var(--accent)]/15",
    border: "border-[var(--accent)]",
    glow: "shadow-[0_0_24px_var(--accent)]",
    btnBg: "bg-[var(--accent)]",
  },
];

const CHARACTERS = [
  { id: "dino", image: "https://titoaistorageaccount.blob.core.windows.net/titoai-storage/site-images/50edc36ed18c4bba8d3eafbdc9e48d39.jpg", color: "bg-[var(--success)]/20", border: "border-[var(--success)]" },
  { id: "robot", image: "https://titoaistorageaccount.blob.core.windows.net/titoai-storage/site-images/22abdb274cf64fdf8bdb085c9957a396.jpg", color: "bg-[var(--primary)]/20", border: "border-[var(--primary)]" },
  { id: "unicorn", image: "https://titoaistorageaccount.blob.core.windows.net/titoai-storage/site-images/7f218e382a8249fca86d289cbc79f1a8.jpg", color: "bg-[var(--accent)]/20", border: "border-[var(--accent)]" },
  { id: "rocket", image: "https://titoaistorageaccount.blob.core.windows.net/titoai-storage/site-images/528113472490423f9a70a834e8de7e6a.jpg", color: "bg-[var(--highlight)]/20", border: "border-[var(--highlight)]" },
];

const STAR_FACTS = [
  "🌟",
  "⭐",
  "💫",
  "✨",
  "🌠",
];

const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.06,
    y: -6,
    transition: { type: "spring", stiffness: 340, damping: 18 },
  },
};

const floatAnim: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-8, 8, -8],
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const spinSlow: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: { duration: 12, repeat: Infinity, ease: "linear" },
  },
};

export default function HomeActivityHubPage() {
  const t = useTranslations();
  const [starCount, setStarCount] = useState(0);
  const [popEmoji, setPopEmoji] = useState<string | null>(null);

  function handleStarClick() {
    const next = starCount + 1;
    setStarCount(next);
    setPopEmoji(STAR_FACTS[next % STAR_FACTS.length]);
    setTimeout(() => setPopEmoji(null), 900);
  }

  const activities = (Array.isArray(t.raw("hub.activities")) ? t.raw("hub.activities") : []) as {
    title: string;
    desc: string;
    badge: string;
  }[];

  const tips = (Array.isArray(t.raw("hub.tips")) ? t.raw("hub.tips") : []) as {
    emoji: string;
    text: string;
  }[];

  const characters = (Array.isArray(t.raw("hub.characters")) ? t.raw("hub.characters") : []) as {
    name: string;
    fact: string;
  }[];

  const rewards = (Array.isArray(t.raw("hub.rewards")) ? t.raw("hub.rewards") : []) as {
    emoji: string;
    label: string;
    stars: string;
  }[];

  return (
    <main className="min-h-screen overflow-x-hidden pb-20">
      {/* ── HERO ── */}
      <Reveal>
        <section className="relative flex flex-col items-center justify-center gap-6 px-4 pt-14 pb-10 text-center">
          {/* Spinning star decoration */}
          <motion.div
            className="pointer-events-none absolute left-6 top-8 text-5xl opacity-40 hidden sm:block"
            variants={spinSlow}
            initial="hidden"
            animate="visible"
          >
            ⭐
          </motion.div>
          <motion.div
            className="pointer-events-none absolute right-8 top-12 text-4xl opacity-30 hidden sm:block"
            variants={floatAnim}
            initial="hidden"
            animate="visible"
          >
            🌈
          </motion.div>

          <motion.div
            variants={bounceIn}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--primary)] bg-[var(--primary)]/10 px-5 py-2 text-sm font-bold text-[var(--primary)]"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {t("hub.hero.badge")}
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-4xl font-extrabold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl md:text-6xl"
            style={{ textWrap: "balance" } as React.CSSProperties}
          >
            {t("hub.hero.title")}
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.12 }}
            className="max-w-xl text-lg leading-relaxed text-[var(--muted-foreground)] sm:text-xl"
          >
            {t("hub.hero.subtitle")}
          </motion.p>

          {/* Star collector button */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="relative flex flex-col items-center gap-2"
          >
            <motion.button
              onClick={handleStarClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              className="flex items-center gap-3 rounded-full bg-[var(--primary)] px-8 py-4 text-xl font-extrabold text-white shadow-[0_4px_20px_var(--primary)] transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/50"
              aria-label={t("hub.hero.starBtnAriaLabel")}
            >
              <Star className="h-6 w-6 fill-white" aria-hidden="true" />
              {t("hub.hero.starBtn")} {starCount > 0 && `(${starCount})`}
            </motion.button>
            {popEmoji && (
              <motion.span
                key={starCount}
                initial={{ opacity: 1, y: 0, scale: 0.6 }}
                animate={{ opacity: 0, y: -40, scale: 1.4 }}
                transition={{ duration: 0.85 }}
                className="pointer-events-none absolute -top-10 text-4xl"
                aria-hidden="true"
              >
                {popEmoji}
              </motion.span>
            )}
          </motion.div>
        </section>
      </Reveal>

      {/* ── ACTIVITY CARDS ── */}
      <Reveal>
        <section className="mx-auto max-w-5xl px-4 py-10">
          <h2 className="mb-8 text-center text-3xl font-extrabold text-[var(--foreground)]">
            {t("hub.activities.heading")}
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {ACTIVITIES.map((act, i) => {
              const data = activities[i];
              return (
                <motion.div key={act.id} variants={bounceIn}>
                  <motion.div
                    variants={cardHover}
                    initial="rest"
                    whileHover="hover"
                    className={cn(
                      "group flex flex-col items-center gap-4 rounded-3xl border-2 p-6 text-center",
                      "shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-shadow duration-300",
                      act.bg,
                      act.border,
                    )}
                  >
                    <span className="text-6xl" role="img" aria-hidden="true">
                      {act.emoji}
                    </span>
                    <div>
                      <p className="text-xl font-extrabold text-[var(--foreground)]">
                        {data?.title ?? act.id}
                      </p>
                      <p className="mt-1 text-sm leading-snug text-[var(--muted-foreground)]">
                        {data?.desc ?? ""}
                      </p>
                    </div>
                    {data?.badge && (
                      <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-[var(--foreground)] ring-1 ring-black/10">
                        {data.badge}
                      </span>
                    )}
                    <Link
                      href={act.href}
                      className={cn(
                        "mt-auto flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold text-white",
                        "transition-all duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50",
                        act.btnBg,
                      )}
                    >
                      <Play className="h-4 w-4" aria-hidden="true" />
                      {t("hub.activities.playBtn")}
                    </Link>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </Reveal>

      {/* ── CARTOON CHARACTERS ── */}
      <Reveal>
        <section className="bg-[var(--primary)]/8 py-14">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="mb-2 text-center text-3xl font-extrabold text-[var(--foreground)]">
              {t("hub.characters.heading")}
            </h2>
            <p className="mb-10 text-center text-[var(--muted-foreground)]">
              {t("hub.characters.sub")}
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-2 gap-6 sm:grid-cols-4"
            >
              {CHARACTERS.map((char, i) => {
                const data = characters[i];
                return (
                  <motion.div
                    key={char.id}
                    variants={bounceIn}
                    whileHover={{ scale: 1.08, rotate: [-2, 2, -2, 0] }}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-3xl border-2 p-5 text-center",
                      "shadow-[0_2px_10px_rgba(0,0,0,0.06)] cursor-pointer",
                      char.color,
                      char.border,
                    )}
                  >
                    <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-md">
                      <img
                        src={char.image}
                        alt={data?.name ?? char.id}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "";
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <span className="flex h-full w-full items-center justify-center text-4xl" aria-hidden="true">
                        {char.id === "dino" ? "🦕" : char.id === "robot" ? "🤖" : char.id === "unicorn" ? "🦄" : "🚀"}
                      </span>
                    </div>
                    <p className="font-extrabold text-[var(--foreground)]">{data?.name ?? char.id}</p>
                    <p className="text-xs leading-snug text-[var(--muted-foreground)]">{data?.fact ?? ""}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </Reveal>

      {/* ── STAR REWARDS TABLE ── */}
      <Reveal>
        <section className="mx-auto max-w-3xl px-4 py-14">
          <h2 className="mb-2 text-center text-3xl font-extrabold text-[var(--foreground)]">
            {t("hub.rewards.heading")}
          </h2>
          <p className="mb-8 text-center text-[var(--muted-foreground)]">
            {t("hub.rewards.sub")}
          </p>
          <div className="overflow-hidden rounded-3xl border-2 border-[var(--border)] bg-[var(--card)] shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[var(--border)] bg-[var(--primary)]/10">
                  <th className="px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-[var(--foreground)]">
                    {t("hub.rewards.colActivity")}
                  </th>
                  <th className="px-6 py-4 text-sm font-extrabold uppercase tracking-wide text-[var(--foreground)]">
                    {t("hub.rewards.colStars")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rewards.map((r, i) => (
                  <tr
                    key={i}
                    className={cn(
                      "border-b border-[var(--border)] transition-colors duration-150 hover:bg-[var(--primary)]/5",
                      i === rewards.length - 1 && "border-b-0",
                    )}
                  >
                    <td className="px-6 py-4 font-semibold text-[var(--foreground)]">
                      <span className="mr-2 text-xl" aria-hidden="true">{r.emoji}</span>
                      {r.label}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--highlight)]/20 px-3 py-1 text-sm font-extrabold text-[var(--foreground)]">
                        <Star className="h-4 w-4 fill-[var(--highlight)] text-[var(--highlight)]" aria-hidden="true" />
                        {r.stars}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Reveal>

      {/* ── FUN TIPS ── */}
      <Reveal>
        <section className="bg-[var(--accent)]/10 py-14">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="mb-2 text-center text-3xl font-extrabold text-[var(--foreground)]">
              {t("hub.tips.heading")}
            </h2>
            <p className="mb-10 text-center text-[var(--muted-foreground)]">
              {t("hub.tips.sub")}
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.04 }}
                  className="flex items-start gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
                >
                  <span className="shrink-0 text-3xl" aria-hidden="true">{tip.emoji}</span>
                  <p className="text-sm leading-relaxed text-[var(--foreground)]">{tip.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </Reveal>

      {/* ── CTA BANNER ── */}
      <Reveal>
        <section className="mx-auto max-w-3xl px-4 py-14 text-center">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="rounded-3xl border-2 border-[var(--primary)] bg-[var(--primary)]/10 px-8 py-12 shadow-[0_4px_32px_var(--primary)/20]"
          >
            <div className="mb-4 flex justify-center gap-2 text-4xl" aria-hidden="true">
              <motion.span variants={floatAnim} initial="hidden" animate="visible">🎉</motion.span>
              <motion.span variants={floatAnim} initial="hidden" animate="visible" style={{ animationDelay: "0.5s" }}>🌟</motion.span>
              <motion.span variants={floatAnim} initial="hidden" animate="visible" style={{ animationDelay: "1s" }}>🎊</motion.span>
            </div>
            <h2 className="mb-3 text-3xl font-extrabold text-[var(--foreground)]">
              {t("hub.cta.heading")}
            </h2>
            <p className="mb-8 text-lg text-[var(--muted-foreground)]">
              {t("hub.cta.sub")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/mini-games"
                className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-8 py-4 text-lg font-extrabold text-white shadow-[0_4px_16px_var(--primary)] transition-all duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/50"
              >
                <Zap className="h-5 w-5" aria-hidden="true" />
                {t("hub.cta.primaryBtn")}
              </Link>
              <Link
                href="/memory-challenge"
                className="flex items-center gap-2 rounded-full border-2 border-[var(--primary)] bg-white px-8 py-4 text-lg font-extrabold text-[var(--primary)] transition-all duration-200 hover:bg-[var(--primary)]/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]/50"
              >
                <Trophy className="h-5 w-5" aria-hidden="true" />
                {t("hub.cta.secondaryBtn")}
              </Link>
            </div>
          </motion.div>
        </section>
      </Reveal>

      {/* ── LOVE NOTE ── */}
      <Reveal>
        <section className="pb-6 text-center">
          <motion.p
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 text-base font-semibold text-[var(--muted-foreground)]"
          >
            <Heart className="h-5 w-5 fill-[var(--accent)] text-[var(--accent)]" aria-hidden="true" />
            {t("hub.love.text")}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
            <Link href="/coloring" className="font-extrabold text-[var(--accent)] underline underline-offset-2 hover:opacity-80">
              {t("hub.love.link")}
            </Link>
          </motion.p>
        </section>
      </Reveal>
    </main>
  );
}