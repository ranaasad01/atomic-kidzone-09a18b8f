"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Star, Heart, Trophy, RotateCcw, Play, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { bounceIn, staggerContainer, scaleIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type GameId = "balloon-pop" | "number-catch" | "color-match" | "whack-a-mole";

interface GameMeta {
  id: GameId;
  emoji: string;
  color: string;
  border: string;
  bg: string;
}

const GAMES: GameMeta[] = [
  { id: "balloon-pop", emoji: "🎈", color: "text-pink-500", border: "border-pink-400", bg: "bg-pink-50" },
  { id: "number-catch", emoji: "🔢", color: "text-blue-500", border: "border-blue-400", bg: "bg-blue-50" },
  { id: "color-match", emoji: "🎨", color: "text-purple-500", border: "border-purple-400", bg: "bg-purple-50" },
  { id: "whack-a-mole", emoji: "🐹", color: "text-amber-500", border: "border-amber-400", bg: "bg-amber-50" },
];

// ─── Balloon Pop ──────────────────────────────────────────────────────────────

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  popped: boolean;
}

const BALLOON_COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF922B", "#CC5DE8"];

function BalloonPop({ onScore, onLoseLife }: { onScore: () => void; onLoseLife: () => void }) {
  const t = useTranslations();
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [running, setRunning] = useState(false);
  const nextId = useRef(0);
  const frameRef = useRef<number>(0);
  const lastSpawn = useRef(0);

  const spawnBalloon = useCallback(() => {
    const id = nextId.current++;
    setBalloons((prev) => [
      ...prev,
      {
        id,
        x: 10 + Math.random() * 80,
        y: 110,
        color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
        size: 48 + Math.random() * 24,
        speed: 0.4 + Math.random() * 0.5,
        popped: false,
      },
    ]);
  }, []);

  const tick = useCallback(
    (ts: number) => {
      if (ts - lastSpawn.current > 1200) {
        spawnBalloon();
        lastSpawn.current = ts;
      }
      setBalloons((prev) => {
        const next = prev
          .map((b) => (b.popped ? b : { ...b, y: b.y - b.speed }))
          .filter((b) => {
            if (!b.popped && b.y < -10) {
              onLoseLife();
              return false;
            }
            if (b.popped && b.y < -20) return false;
            return true;
          });
        return next;
      });
      frameRef.current = requestAnimationFrame(tick);
    },
    [spawnBalloon, onLoseLife]
  );

  useEffect(() => {
    if (running) {
      frameRef.current = requestAnimationFrame(tick);
    }
    return () => cancelAnimationFrame(frameRef.current);
  }, [running, tick]);

  const pop = (id: number) => {
    setBalloons((prev) =>
      prev.map((b) => (b.id === id && !b.popped ? { ...b, popped: true } : b))
    );
    onScore();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!running ? (
        <button
          onClick={() => { setBalloons([]); setRunning(true); lastSpawn.current = 0; }}
          className="rounded-full bg-[var(--primary)] px-8 py-4 text-xl font-bold text-white shadow-lg hover:scale-105 transition-transform"
        >
          {t("miniGames.balloonPop.start")} 🎈
        </button>
      ) : (
        <div
          className="relative w-full overflow-hidden rounded-3xl border-4 border-pink-300 bg-gradient-to-b from-sky-200 to-sky-100"
          style={{ height: 340 }}
        >
          {balloons.map((b) => (
            <button
              key={b.id}
              aria-label={t("miniGames.balloonPop.popLabel")}
              onClick={() => pop(b.id)}
              className="absolute transition-transform hover:scale-110 focus:outline-none"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size * 1.3,
                transform: "translate(-50%, -50%)",
              }}
            >
              {b.popped ? (
                <span className="text-3xl">💥</span>
              ) : (
                <svg viewBox="0 0 60 80" fill={b.color} xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="30" cy="32" rx="26" ry="30" />
                  <polygon points="30,62 26,72 34,72" fill={b.color} />
                  <ellipse cx="20" cy="22" rx="7" ry="9" fill="rgba(255,255,255,0.3)" />
                </svg>
              )}
            </button>
          ))}
          <div className="absolute bottom-2 right-3 text-xs font-bold text-sky-600 opacity-70">
            {t("miniGames.balloonPop.tapHint")}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Number Catch ─────────────────────────────────────────────────────────────

interface FallingNum {
  id: number;
  x: number;
  y: number;
  value: number;
  speed: number;
  caught: boolean;
}

function NumberCatch({ onScore, onLoseLife, level }: { onScore: () => void; onLoseLife: () => void; level: number }) {
  const t = useTranslations();
  const [target, setTarget] = useState(Math.floor(Math.random() * 9) + 1);
  const [nums, setNums] = useState<FallingNum[]>([]);
  const [running, setRunning] = useState(false);
  const nextId = useRef(0);
  const frameRef = useRef<number>(0);
  const lastSpawn = useRef(0);

  const spawnNum = useCallback(() => {
    const id = nextId.current++;
    const isTarget = Math.random() < 0.4;
    const value = isTarget ? target : (() => {
      let v = Math.floor(Math.random() * 9) + 1;
      while (v === target) v = Math.floor(Math.random() * 9) + 1;
      return v;
    })();
    setNums((prev) => [
      ...prev,
      { id, x: 5 + Math.random() * 85, y: -8, value, speed: 0.3 + level * 0.1 + Math.random() * 0.3, caught: false },
    ]);
  }, [target, level]);

  const tick = useCallback(
    (ts: number) => {
      if (ts - lastSpawn.current > 1000) {
        spawnNum();
        lastSpawn.current = ts;
      }
      setNums((prev) =>
        prev
          .map((n) => (n.caught ? n : { ...n, y: n.y + n.speed }))
          .filter((n) => {
            if (!n.caught && n.y > 105) { onLoseLife(); return false; }
            if (n.caught && n.y > 110) return false;
            return true;
          })
      );
      frameRef.current = requestAnimationFrame(tick);
    },
    [spawnNum, onLoseLife]
  );

  useEffect(() => {
    if (running) frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [running, tick]);

  const catchNum = (id: number, value: number) => {
    if (value === target) {
      setNums((prev) => prev.map((n) => (n.id === id ? { ...n, caught: true } : n)));
      onScore();
      setTarget(Math.floor(Math.random() * 9) + 1);
    } else {
      onLoseLife();
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!running ? (
        <button
          onClick={() => { setNums([]); setRunning(true); lastSpawn.current = 0; }}
          className="rounded-full bg-[var(--primary)] px-8 py-4 text-xl font-bold text-white shadow-lg hover:scale-105 transition-transform"
        >
          {t("miniGames.numberCatch.start")} 🔢
        </button>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="rounded-2xl bg-blue-100 border-2 border-blue-300 px-6 py-2 text-2xl font-extrabold text-blue-700">
            {t("miniGames.numberCatch.catchLabel")} <span className="text-4xl">{target}</span>
          </div>
          <div
            className="relative w-full overflow-hidden rounded-3xl border-4 border-blue-300 bg-gradient-to-b from-blue-100 to-indigo-100"
            style={{ height: 280 }}
          >
            {nums.map((n) => (
              <button
                key={n.id}
                aria-label={`${t("miniGames.numberCatch.numLabel")} ${n.value}`}
                onClick={() => catchNum(n.id, n.value)}
                className={cn(
                  "absolute flex items-center justify-center rounded-full text-2xl font-extrabold shadow-md transition-transform hover:scale-110 focus:outline-none",
                  n.caught ? "opacity-0" : "opacity-100",
                  n.value === target ? "bg-yellow-300 text-yellow-900 border-2 border-yellow-500" : "bg-white text-blue-700 border-2 border-blue-300"
                )}
                style={{ left: `${n.x}%`, top: `${n.y}%`, width: 52, height: 52, transform: "translate(-50%,-50%)" }}
              >
                {n.value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Color Match ──────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { name: "Red", hex: "#FF6B6B", label: "🔴" },
  { name: "Blue", hex: "#4D96FF", label: "🔵" },
  { name: "Green", hex: "#6BCB77", label: "🟢" },
  { name: "Yellow", hex: "#FFD93D", label: "🟡" },
  { name: "Purple", hex: "#CC5DE8", label: "🟣" },
  { name: "Orange", hex: "#FF922B", label: "🟠" },
];

function ColorMatch({ onScore, onLoseLife }: { onScore: () => void; onLoseLife: () => void }) {
  const t = useTranslations();
  const [target, setTarget] = useState(() => COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)]);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [options, setOptions] = useState(() => [...COLOR_OPTIONS].sort(() => Math.random() - 0.5).slice(0, 4));

  const newRound = useCallback(() => {
    const tgt = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    setTarget(tgt);
    const others = COLOR_OPTIONS.filter((c) => c.name !== tgt.name).sort(() => Math.random() - 0.5).slice(0, 3);
    setOptions([...others, tgt].sort(() => Math.random() - 0.5));
    setFeedback(null);
  }, []);

  const pick = (name: string) => {
    if (feedback) return;
    if (name === target.name) {
      setFeedback("correct");
      onScore();
      setTimeout(newRound, 900);
    } else {
      setFeedback("wrong");
      onLoseLife();
      setTimeout(newRound, 900);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-lg font-bold text-purple-700">{t("miniGames.colorMatch.instruction")}</div>
      <div
        className="w-32 h-32 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-5xl"
        style={{ backgroundColor: target.hex }}
        aria-label={t("miniGames.colorMatch.targetLabel")}
      />
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("text-4xl font-extrabold", feedback === "correct" ? "text-green-500" : "text-red-500")}
          >
            {feedback === "correct" ? "⭐ " + t("miniGames.colorMatch.correct") : "💔 " + t("miniGames.colorMatch.wrong")}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
        {options.map((opt) => (
          <button
            key={opt.name}
            onClick={() => pick(opt.name)}
            aria-label={opt.name}
            className="rounded-2xl border-4 border-white py-4 text-xl font-bold text-white shadow-lg hover:scale-105 transition-transform focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-400"
            style={{ backgroundColor: opt.hex }}
          >
            {opt.label} {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Whack-a-Mole ─────────────────────────────────────────────────────────────

const HOLES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

function WhackAMole({ onScore, onLoseLife, level }: { onScore: () => void; onLoseLife: () => void; level: number }) {
  const t = useTranslations();
  const [active, setActive] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [whacked, setWhacked] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showMole = useCallback(() => {
    const hole = Math.floor(Math.random() * 9);
    setActive(hole);
    setWhacked(null);
    const duration = Math.max(600, 1400 - level * 120);
    timerRef.current = setTimeout(() => {
      setActive((cur) => {
        if (cur === hole) { onLoseLife(); return null; }
        return cur;
      });
      if (running) showMole();
    }, duration);
  }, [level, onLoseLife, running]);

  useEffect(() => {
    if (running) showMole();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [running, showMole]);

  const whack = (hole: number) => {
    if (hole !== active) return;
    setWhacked(hole);
    setActive(null);
    onScore();
    if (timerRef.current) clearTimeout(timerRef.current);
    setTimeout(showMole, 400);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!running ? (
        <button
          onClick={() => setRunning(true)}
          className="rounded-full bg-[var(--primary)] px-8 py-4 text-xl font-bold text-white shadow-lg hover:scale-105 transition-transform"
        >
          {t("miniGames.whackAMole.start")} 🐹
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          {HOLES.map((hole) => (
            <button
              key={hole}
              onClick={() => whack(hole)}
              aria-label={t("miniGames.whackAMole.holeLabel")}
              className={cn(
                "relative flex items-end justify-center rounded-2xl border-4 overflow-hidden transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400",
                "bg-amber-100 border-amber-300",
                active === hole ? "cursor-pointer hover:scale-105" : "cursor-default"
              )}
              style={{ height: 90 }}
            >
              <div className="absolute bottom-0 w-full h-8 rounded-b-xl bg-amber-700/30" />
              <AnimatePresence>
                {active === hole && (
                  <motion.div
                    key="mole"
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 40, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="relative z-10 text-4xl select-none pb-1"
                  >
                    🐹
                  </motion.div>
                )}
                {whacked === hole && (
                  <motion.div
                    key="whacked"
                    initial={{ scale: 0.5, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 flex items-center justify-center text-3xl z-20"
                  >
                    💥
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Score Display ────────────────────────────────────────────────────────────

function ScoreDisplay({ score, lives, level }: { score: number; lives: number; level: number }) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <div className="flex items-center gap-2 rounded-2xl bg-yellow-100 border-2 border-yellow-300 px-4 py-2">
        <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" aria-hidden="true" />
        <span className="text-xl font-extrabold text-yellow-700">{score}</span>
        <span className="text-sm font-semibold text-yellow-600">{t("miniGames.score.points")}</span>
      </div>
      <div className="flex items-center gap-1 rounded-2xl bg-red-100 border-2 border-red-300 px-4 py-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Heart
            key={i}
            className={cn("h-5 w-5", i < lives ? "text-red-500 fill-red-400" : "text-gray-300 fill-gray-200")}
            aria-hidden="true"
          />
        ))}
        <span className="ml-1 text-sm font-semibold text-red-600">{t("miniGames.score.lives")}</span>
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-purple-100 border-2 border-purple-300 px-4 py-2">
        <Trophy className="h-5 w-5 text-purple-500" aria-hidden="true" />
        <span className="text-xl font-extrabold text-purple-700">{t("miniGames.score.level")} {level}</span>
      </div>
    </div>
  );
}

// ─── Completion Celebration ───────────────────────────────────────────────────

const confettiVariant: Variants = {
  hidden: { opacity: 0, scale: 0.5, y: 60 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 18 },
  },
};

function CompletionCelebration({ score, onRestart, onClose }: { score: number; onRestart: () => void; onClose: () => void }) {
  const t = useTranslations();
  const emojis = ["🎉", "⭐", "🎈", "🏆", "✨", "🌟", "🎊", "💫"];
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        variants={confettiVariant}
        initial="hidden"
        animate="visible"
        className="relative mx-4 max-w-sm w-full rounded-3xl bg-white border-4 border-yellow-300 shadow-2xl p-8 flex flex-col items-center gap-5 text-center"
      >
        <button
          onClick={onClose}
          aria-label={t("miniGames.celebration.close")}
          className="absolute top-3 right-3 rounded-full bg-gray-100 p-1 hover:bg-gray-200 transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        <div className="flex flex-wrap justify-center gap-2 text-3xl">
          {emojis.map((e, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -10, 0], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 + i * 0.2, delay: i * 0.1 }}
            >
              {e}
            </motion.span>
          ))}
        </div>
        <h2 className="text-3xl font-extrabold text-yellow-600">{t("miniGames.celebration.title")}</h2>
        <p className="text-lg text-gray-600">{t("miniGames.celebration.subtitle")}</p>
        <div className="rounded-2xl bg-yellow-50 border-2 border-yellow-200 px-6 py-3">
          <span className="text-4xl font-extrabold text-yellow-700">{score}</span>
          <span className="ml-2 text-lg font-semibold text-yellow-600">{t("miniGames.celebration.points")}</span>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] py-3 text-lg font-bold text-white shadow-md hover:scale-105 transition-transform"
          >
            <RotateCcw className="h-5 w-5" aria-hidden="true" />
            {t("miniGames.celebration.playAgain")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MiniGamesPage() {
  const t = useTranslations();
  const [selectedGame, setSelectedGame] = useState<GameId>("balloon-pop");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const WIN_SCORE = 10;

  const handleScore = useCallback(() => {
    setScore((s) => {
      const next = s + 1;
      if (next >= WIN_SCORE) setWon(true);
      if (next > 0 && next % 5 === 0) setLevel((l) => l + 1);
      return next;
    });
  }, []);

  const handleLoseLife = useCallback(() => {
    setLives((l) => {
      const next = l - 1;
      if (next <= 0) setGameOver(true);
      return Math.max(0, next);
    });
  }, []);

  const restart = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameOver(false);
    setWon(false);
  };

  const selectGame = (id: GameId) => {
    setSelectedGame(id);
    restart();
  };

  const prevGame = () => {
    const idx = (carouselIndex - 1 + GAMES.length) % GAMES.length;
    setCarouselIndex(idx);
    selectGame(GAMES[idx].id);
  };

  const nextGame = () => {
    const idx = (carouselIndex + 1) % GAMES.length;
    setCarouselIndex(idx);
    selectGame(GAMES[idx].id);
  };

  const currentMeta = GAMES.find((g) => g.id === selectedGame) ?? GAMES[0];

  const gameNames = (Array.isArray(t.raw("miniGames.gameNames")) ? t.raw("miniGames.gameNames") : []) as { id: string; name: string; desc: string }[];
  const currentGameInfo = gameNames.find((g) => g.id === selectedGame);

  const tips = (Array.isArray(t.raw("miniGames.tips")) ? t.raw("miniGames.tips") : []) as { text: string }[];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[var(--background)] to-purple-50 pb-16">
      {/* Hero / Header */}
      <Reveal>
        <section className="relative overflow-hidden pt-10 pb-6 text-center px-4">
          <motion.div
            className="absolute -top-8 -left-8 text-8xl opacity-20 select-none"
            animate={{ rotate: [0, 15, -15, 0], y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            aria-hidden="true"
          >
            🎮
          </motion.div>
          <motion.div
            className="absolute -top-4 -right-6 text-7xl opacity-20 select-none"
            animate={{ rotate: [0, -12, 12, 0], y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
            aria-hidden="true"
          >
            ⭐
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--foreground)] tracking-tight text-balance">
            {t("miniGames.hero.title")}
          </h1>
          <p className="mt-3 text-lg md:text-xl text-[var(--muted-foreground)] max-w-xl mx-auto text-pretty">
            {t("miniGames.hero.subtitle")}
          </p>
        </section>
      </Reveal>

      {/* Game Selector Carousel */}
      <Reveal delay={0.08}>
        <section className="px-4 max-w-2xl mx-auto mb-8" aria-label={t("miniGames.carousel.label")}>
          <div className="flex items-center gap-3">
            <button
              onClick={prevGame}
              aria-label={t("miniGames.carousel.prev")}
              className="rounded-full bg-white border-2 border-gray-200 p-2 shadow hover:scale-110 transition-transform"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex-1 overflow-hidden">
              <div className="flex gap-3 justify-center">
                {GAMES.map((g, i) => {
                  const info = gameNames.find((n) => n.id === g.id);
                  return (
                    <motion.button
                      key={g.id}
                      onClick={() => { setCarouselIndex(i); selectGame(g.id); }}
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={info?.name ?? g.id}
                      aria-pressed={selectedGame === g.id}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border-4 px-4 py-3 text-center transition-all shadow-md min-w-[80px]",
                        selectedGame === g.id
                          ? `${g.bg} ${g.border} scale-105 shadow-lg`
                          : "bg-white border-gray-200 opacity-70 hover:opacity-100"
                      )}
                    >
                      <span className="text-3xl">{g.emoji}</span>
                      <span className={cn("text-xs font-bold", selectedGame === g.id ? g.color : "text-gray-500")}>
                        {info?.name ?? g.id}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={nextGame}
              aria-label={t("miniGames.carousel.next")}
              className="rounded-full bg-white border-2 border-gray-200 p-2 shadow hover:scale-110 transition-transform"
            >
              <ChevronRight className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          {currentGameInfo && (
            <motion.p
              key={selectedGame}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-center text-sm text-[var(--muted-foreground)]"
            >
              {currentGameInfo.desc}
            </motion.p>
          )}
        </section>
      </Reveal>

      {/* Score Display */}
      <Reveal delay={0.12}>
        <section className="px-4 max-w-2xl mx-auto mb-6">
          <ScoreDisplay score={score} lives={lives} level={level} />
        </section>
      </Reveal>

      {/* Game Canvas */}
      <Reveal delay={0.16}>
        <section className="px-4 max-w-2xl mx-auto mb-8">
          <div className={cn("rounded-3xl border-4 p-6 shadow-xl", currentMeta.bg, currentMeta.border)}>
            {/* Game Over State */}
            {gameOver && !won ? (
              <div className="flex flex-col items-center gap-5 py-8 text-center">
                <div className="text-6xl">😢</div>
                <h2 className="text-3xl font-extrabold text-gray-700">{t("miniGames.gameOver.title")}</h2>
                <p className="text-lg text-gray-500">{t("miniGames.gameOver.subtitle")} <strong>{score}</strong> {t("miniGames.score.points")}!</p>
                <button
                  onClick={restart}
                  className="flex items-center gap-2 rounded-full bg-[var(--primary)] px-8 py-4 text-xl font-bold text-white shadow-lg hover:scale-105 transition-transform"
                >
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                  {t("miniGames.gameOver.tryAgain")}
                </button>
              </div>
            ) : (
              <>
                {selectedGame === "balloon-pop" && (
                  <BalloonPop onScore={handleScore} onLoseLife={handleLoseLife} />
                )}
                {selectedGame === "number-catch" && (
                  <NumberCatch onScore={handleScore} onLoseLife={handleLoseLife} level={level} />
                )}
                {selectedGame === "color-match" && (
                  <ColorMatch onScore={handleScore} onLoseLife={handleLoseLife} />
                )}
                {selectedGame === "whack-a-mole" && (
                  <WhackAMole onScore={handleScore} onLoseLife={handleLoseLife} level={level} />
                )}
              </>
            )}
          </div>
          {/* Progress bar */}
          {!gameOver && (
            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold text-[var(--muted-foreground)] mb-1">
                <span>{t("miniGames.progress.label")}</span>
                <span>{score}/{WIN_SCORE}</span>
              </div>
              <div className="h-4 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                  animate={{ width: `${Math.min((score / WIN_SCORE) * 100, 100)}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </section>
      </Reveal>

      {/* Tips Section */}
      <Reveal delay={0.2}>
        <section className="px-4 max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-extrabold text-center text-[var(--foreground)] mb-4">
            {t("miniGames.tips.heading")}
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                className="flex items-start gap-3 rounded-2xl bg-white border-2 border-yellow-200 p-4 shadow-sm"
              >
                <span className="text-2xl shrink-0">💡</span>
                <p className="text-sm font-medium text-gray-700">{tip.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </Reveal>

      {/* How to Play */}
      <Reveal delay={0.24}>
        <section className="px-4 max-w-2xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 border-2 border-[var(--primary)]/20 p-6 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <h2 className="text-2xl font-extrabold text-[var(--foreground)] mb-2">{t("miniGames.howToWin.title")}</h2>
            <p className="text-[var(--muted-foreground)] text-base leading-relaxed">
              {t("miniGames.howToWin.body", { count: WIN_SCORE })}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <div className="rounded-full bg-yellow-100 border border-yellow-300 px-4 py-1.5 text-sm font-bold text-yellow-700">
                ⭐ {t("miniGames.howToWin.badge1")}
              </div>
              <div className="rounded-full bg-green-100 border border-green-300 px-4 py-1.5 text-sm font-bold text-green-700">
                🎯 {t("miniGames.howToWin.badge2")}
              </div>
              <div className="rounded-full bg-purple-100 border border-purple-300 px-4 py-1.5 text-sm font-bold text-purple-700">
                🚀 {t("miniGames.howToWin.badge3")}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Completion Celebration Modal */}
      <AnimatePresence>
        {won && (
          <CompletionCelebration
            score={score}
            onRestart={restart}
            onClose={() => setWon(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}