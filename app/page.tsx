"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Star, Sparkles, Trophy, Heart, Zap, ArrowRight } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { bounceIn, staggerContainer, fadeInUp, scaleIn } from "@/lib/motion";
import { APP_NAME, APP_TAGLINE } from "@/lib/data";
type activityCards = any;
const activityCards: any = new Proxy([], { get: (t: any, k) => (k in t ? t[k] : "") });
type STAR_REWARDS = any;
const STAR_REWARDS: any = new Proxy([], { get: (t: any, k) => (k in t ? t[k] : "") });
type difficultyConfigs = any;
const difficultyConfigs: any[] = new Proxy([], { get: (t: any, k) => (k in t ? t[k] : "") });

// ─── Inline data ────────────────────────────────────────────────────────────

const ACTIVITIES = [
  {
    key: "mini-games",
    emoji: "🎮",
    title: "Mini-Games",
    description: "Jump, dodge, and score in fast and furious arcade adventures!",
    href: "/mini-games",
    bg: "bg-[var(--primary)]/15",
    border: "border-[var(--primary)]",
    accent: "var(--primary)",
    stars: STAR_REWARDS.miniGame,
  },
  {
    key: "puzzles",
    emoji: "🧩",
    title: "Puzzles",
    description: "Piece together wild scenes and train your super-smart brain!",
    href: "/puzzles",
    bg: "bg-[var(--highlight)]/15",
    border: "border-[var(--highlight)]",
    accent: "var(--highlight)",
    stars: STAR_REWARDS.puzzle,
  },
  {
    key: "coloring",
    emoji: "🎨",
    title: "Coloring",
    description: "Paint cartoon friends with every color of the rainbow!",
    href: "/coloring",
    bg: "bg-[var(--success)]/15",
    border: "border-[var(--success)]",
    accent: "var(--success)",
    stars: STAR_REWARDS.coloring,
  },
  {
    key: "memory-challenge",
    emoji: "🃏",
    title: "Memory Challenge",
    description: "Flip cards, find matches, and become a memory master!",
    href: "/memory-challenge",
    bg: "bg-[var(--accent)]/15",
    border: "border-[var(--accent)]",
    accent: "var(--accent)",
    stars: STAR_REWARDS.memoryChallenge,
  },
];

const CHARACTERS = [
  { name: "Zippy the Rocket", emoji: "🚀", color: "bg-[var(--primary)]/20", quote: "Blast off to fun!" },
  { name: "Bubbles the Fish", emoji: "🐠", color: "bg-[var(--accent)]/20", quote: "Dive into learning!" },
  { name: "Sunny the Star", emoji: "⭐", color: "bg-[var(--highlight)]/20", quote: "Shine every day!" },
  { name: "Pepper the Panda", emoji: "🐼", color: "bg-[var(--success)]/20", quote: "Play and grow!" },
];

const FEATURES = [
  {
    icon: <Star className="w-7 h-7" />,
    title: "Earn Stars",
    body: "Complete activities to collect shiny stars and unlock surprise rewards!",
    color: "text-[var(--highlight)]",
    bg: "bg-[var(--highlight)]/10",
  },
  {
    icon: <Trophy className="w-7 h-7" />,
    title: "Level Up",
    body: "Choose Easy, Medium, or Hard and watch yourself get better every day.",
    color: "text-[var(--primary)]",
    bg: "bg-[var(--primary)]/10",
  },
  {
    icon: <Heart className="w-7 h-7" />,
    title: "Safe & Fun",
    body: "A cozy, ad-free space designed just for curious kids like you.",
    color: "text-[var(--accent)]",
    bg: "bg-[var(--accent)]/10",
  },
  {
    icon: <Zap className="w-7 h-7" />,
    title: "New Every Day",
    body: "Fresh puzzles, new coloring pages, and surprise mini-games added all the time.",
    color: "text-[var(--success)]",
    bg: "bg-[var(--success)]/10",
  },
];

const TESTIMONIALS = [
  {
    name: "Mia, age 7",
    avatar: "🦄",
    text: "I love the coloring pages! I painted a rainbow dragon and it was SO cool!",
    stars: 5,
  },
  {
    name: "Leo, age 9",
    avatar: "🦊",
    text: "The memory challenge is my favorite. I beat the hard level three times!",
    stars: 5,
  },
  {
    name: "Zoe, age 6",
    avatar: "🐸",
    text: "Zippy the Rocket is my best friend. I play mini-games every single day!",
    stars: 5,
  },
];

// ─── Floating bubble decoration ─────────────────────────────────────────────

const BUBBLES = [
  { emoji: "⭐", size: "text-3xl", x: "8%",  y: "18%", delay: 0 },
  { emoji: "🌈", size: "text-2xl", x: "88%", y: "12%", delay: 0.4 },
  { emoji: "🎈", size: "text-4xl", x: "5%",  y: "72%", delay: 0.8 },
  { emoji: "🍭", size: "text-3xl", x: "92%", y: "65%", delay: 0.2 },
  { emoji: "🌟", size: "text-2xl", x: "50%", y: "6%",  delay: 0.6 },
  { emoji: "🎉", size: "text-3xl", x: "78%", y: "82%", delay: 1.0 },
];

function FloatingBubble({ emoji, size, x, y, delay }: { emoji: string; size: string; x: string; y: string; delay: number }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.span
      className={`absolute select-none pointer-events-none ${size}`}
      style={{ left: x, top: y }}
      animate={{ y: [0, -14, 0], rotate: [0, 8, -8, 0] }}
      transition={{ duration: 3.5 + delay, repeat: Infinity, ease: "easeInOut", delay }}
      aria-hidden
    >
      {emoji}
    </motion.span>
  );
}

// ─── Star rating display ─────────────────────────────────────────────────────

function StarRow({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="w-4 h-4 fill-[var(--highlight)] text-[var(--highlight)]" />
      ))}
    </span>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <main className="overflow-x-hidden">

      {/* ── HERO ── */}
      <Reveal>
        <section
          id="hero"
          className="relative min-h-[88vh] flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden"
        >
          {/* Decorative bubbles */}
          {BUBBLES.map((b) => (
            <FloatingBubble key={b.emoji} {...b} />
          ))}

          {/* Radial glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 55% at 50% 40%, var(--primary)/18%, transparent 70%)",
            }}
            aria-hidden
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="relative z-10 flex flex-col items-center gap-6 max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div variants={bounceIn}>
              <span className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30">
                <Sparkles className="w-4 h-4" />
                The #1 Fun Zone for Kids!
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-balance leading-[1.1] text-[var(--foreground)]"
            >
              Welcome to{" "}
              <span
                className="relative inline-block"
                style={{
                  background: "linear-gradient(135deg, var(--primary), var(--accent))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {APP_NAME}
              </span>
              !
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={fadeInUp}
              className="text-xl sm:text-2xl font-semibold text-[var(--muted-foreground)] text-pretty max-w-xl"
            >
              {APP_TAGLINE}
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/mini-games"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold bg-[var(--primary)] text-white shadow-lg hover:scale-105 transition-transform"
              >
                Start Playing <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/coloring"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold border-2 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
              >
                Try Coloring 🎨
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </Reveal>

      {/* ── ACTIVITIES ── */}
      <Reveal>
        <section id="activities" className="px-4 py-20 max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-[var(--foreground)]">
            What do you want to do today? 🎯
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ACTIVITIES.map((act) => (
              <motion.div
                key={act.key}
                variants={scaleIn}
                whileHover={{ scale: 1.04, y: -4 }}
                onHoverStart={() => setHovered(act.key)}
                onHoverEnd={() => setHovered(null)}
              >
                <Link
                  href={act.href}
                  className={`flex flex-col items-center gap-3 rounded-2xl p-6 border-2 ${act.bg} ${act.border} text-center transition-shadow hover:shadow-xl`}
                >
                  <span className="text-5xl">{act.emoji}</span>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">{act.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{act.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── FEATURES ── */}
      <Reveal>
        <section id="features" className="px-4 py-20 bg-[var(--card)] border-y border-[var(--border)]">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-extrabold text-center mb-12 text-[var(--foreground)]">
              Why kids love us ❤️
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className={`rounded-2xl p-6 ${f.bg} flex flex-col gap-3`}>
                  <span className={f.color}>{f.icon}</span>
                  <h3 className="font-bold text-lg text-[var(--foreground)]">{f.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── CHARACTERS ── */}
      <Reveal>
        <section id="characters" className="px-4 py-20 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-4 text-[var(--foreground)]">
            Meet your friends! 👋
          </h2>
          <p className="text-[var(--muted-foreground)] mb-12 text-lg">
            These fun characters will guide you on every adventure.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {CHARACTERS.map((c) => (
              <div key={c.name} className={`rounded-2xl p-6 ${c.color} flex flex-col items-center gap-2`}>
                <span className="text-5xl">{c.emoji}</span>
                <h3 className="font-bold text-[var(--foreground)]">{c.name}</h3>
                <p className="text-xs text-[var(--muted-foreground)] italic">"{c.quote}"</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── DIFFICULTY ── */}
      <Reveal>
        <section id="difficulty" className="px-4 py-20 bg-[var(--card)] border-y border-[var(--border)]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-extrabold mb-4 text-[var(--foreground)]">
              Pick your level! 🏆
            </h2>
            <p className="text-[var(--muted-foreground)] mb-12 text-lg">
              Start easy and work your way up to champion!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(difficultyConfigs as any[]).map((cfg: any, i: number) => (
                <div key={i} className="rounded-2xl p-6 bg-[var(--background)] border border-[var(--border)] flex flex-col items-center gap-2 flex-1">
                  <span className="text-4xl">{cfg.emoji}</span>
                  <h3 className="font-bold text-xl text-[var(--foreground)]">{cfg.label}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{cfg.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── TESTIMONIALS ── */}
      <Reveal>
        <section id="testimonials" className="px-4 py-20 max-w-5xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center mb-12 text-[var(--foreground)]">
            Kids are saying... 💬
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl p-6 bg-[var(--card)] border border-[var(--border)] flex flex-col gap-3">
                <span className="text-4xl">{t.avatar}</span>
                <StarRow count={t.stars} />
                <p className="text-[var(--foreground)] italic">"{t.text}"</p>
                <p className="text-sm font-bold text-[var(--muted-foreground)]">{t.name}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── CTA ── */}
      <Reveal>
        <section id="cta" className="px-4 py-24 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 text-[var(--foreground)]">
            Ready for the fun? 🚀
          </h2>
          <p className="text-xl text-[var(--muted-foreground)] mb-10 max-w-xl mx-auto">
            Jump in and start your adventure — no sign-up needed!
          </p>
          <Link
            href="/mini-games"
            className="inline-flex items-center gap-2 rounded-full px-10 py-5 text-xl font-bold bg-[var(--primary)] text-white shadow-xl hover:scale-105 transition-transform"
          >
            Let's Go! <ArrowRight className="w-6 h-6" />
          </Link>
        </section>
      </Reveal>

    </main>
  );
}
