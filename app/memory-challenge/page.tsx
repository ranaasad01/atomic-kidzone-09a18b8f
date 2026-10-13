"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star, RotateCcw, Trophy, Clock, Zap } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { bounceIn, staggerContainer } from "@/lib/motion";

// ─── Types ────────────────────────────────────────────────────────────────────

type GridSize = 4 | 6 | 8;

interface CardData {
  id: number;
  pairId: number;
  emoji: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// ─── Card Pairs ───────────────────────────────────────────────────────────────

const ALL_PAIRS: { emoji: string; label: string }[] = [
  { emoji: "🦁", label: "Lion" },
  { emoji: "🐘", label: "Elephant" },
  { emoji: "🦊", label: "Fox" },
  { emoji: "🐬", label: "Dolphin" },
  { emoji: "🦄", label: "Unicorn" },
  { emoji: "🐸", label: "Frog" },
  { emoji: "🦋", label: "Butterfly" },
  { emoji: "🐼", label: "Panda" },
  { emoji: "🦖", label: "Dinosaur" },
  { emoji: "🐙", label: "Octopus" },
  { emoji: "🦜", label: "Parrot" },
  { emoji: "🐳", label: "Whale" },
  { emoji: "🦊", label: "Fox" },
  { emoji: "🐯", label: "Tiger" },
  { emoji: "🦩", label: "Flamingo" },
  { emoji: "🐨", label: "Koala" },
  { emoji: "🦝", label: "Raccoon" },
  { emoji: "🐺", label: "Wolf" },
  { emoji: "🦦", label: "Otter" },
  { emoji: "🐮", label: "Cow" },
  { emoji: "🦒", label: "Giraffe" },
  { emoji: "🐧", label: "Penguin" },
  { emoji: "🦈", label: "Shark" },
  { emoji: "🐻", label: "Bear" },
  { emoji: "🦚", label: "Peacock" },
  { emoji: "🐰", label: "Bunny" },
  { emoji: "🦔", label: "Hedgehog" },
  { emoji: "🐢", label: "Turtle" },
  { emoji: "🦭", label: "Seal" },
  { emoji: "🐓", label: "Rooster" },
  { emoji: "🦘", label: "Kangaroo" },
  { emoji: "🐑", label: "Sheep" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(gridSize: GridSize): CardData[] {
  const pairCount = (gridSize * gridSize) / 2;
  const pairs = shuffle(ALL_PAIRS).slice(0, pairCount);
  const cards: CardData[] = [];
  pairs.forEach((pair, pairId) => {
    cards.push({ id: pairId * 2, pairId, ...pair, isFlipped: false, isMatched: false });
    cards.push({ id: pairId * 2 + 1, pairId, ...pair, isFlipped: false, isMatched: false });
  });
  return shuffle(cards);
}

function calcStars(moves: number, pairCount: number): number {
  const ratio = moves / pairCount;
  if (ratio <= 1.4) return 3;
  if (ratio <= 2.0) return 2;
  return 1;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const cardFlipVariants: Variants = {
  front: { rotateY: 0, transition: { duration: 0.35, ease: "easeOut" } },
  back: { rotateY: 180, transition: { duration: 0.35, ease: "easeOut" } },
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.7, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
  exit: { opacity: 0, scale: 0.7, y: 40, transition: { duration: 0.25 } },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface DifficultyOption {
  size: GridSize;
  label: string;
  emoji: string;
  pairs: number;
  color: string;
  activeColor: string;
}

const DIFFICULTY_OPTIONS: DifficultyOption[] = [
  { size: 4, label: "Easy", emoji: "🐢", pairs: 8, color: "border-[var(--success)] bg-[var(--success)]/10", activeColor: "bg-[var(--success)] text-white border-[var(--success)]" },
  { size: 6, label: "Medium", emoji: "🐇", pairs: 18, color: "border-[var(--highlight)] bg-[var(--highlight)]/10", activeColor: "bg-[var(--highlight)] text-white border-[var(--highlight)]" },
  { size: 8, label: "Hard", emoji: "🦁", pairs: 32, color: "border-[var(--primary)] bg-[var(--primary)]/10", activeColor: "bg-[var(--primary)] text-white border-[var(--primary)]" },
];

function DifficultySelector({
  selected,
  onSelect,
}: {
  selected: GridSize;
  onSelect: (s: GridSize) => void;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {DIFFICULTY_OPTIONS.map((opt) => (
        <motion.button
          key={opt.size}
          onClick={() => onSelect(opt.size)}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex items-center gap-2 rounded-2xl border-2 px-5 py-3 font-bold text-base transition-all duration-200 shadow-sm",
            selected === opt.size ? opt.activeColor : opt.color + " text-[var(--foreground)]"
          )}
          aria-pressed={selected === opt.size}
        >
          <span className="text-xl">{opt.emoji}</span>
          <span>{t("memoryChallenge.difficulty." + opt.label.toLowerCase())}</span>
          <span className="ml-1 rounded-full bg-white/30 px-2 py-0.5 text-xs font-semibold">
            {opt.pairs} {t("memoryChallenge.pairs")}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

function ScoreTimer({
  moves,
  elapsed,
  matched,
  total,
}: {
  moves: number;
  elapsed: number;
  matched: number;
  total: number;
}) {
  const t = useTranslations();
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {[
        { icon: <Zap className="h-5 w-5" />, value: moves, label: t("memoryChallenge.moves"), color: "text-[var(--primary)]" },
        { icon: <Clock className="h-5 w-5" />, value: formatTime(elapsed), label: t("memoryChallenge.time"), color: "text-[var(--highlight)]" },
        { icon: <Trophy className="h-5 w-5" />, value: `${matched}/${total}`, label: t("memoryChallenge.matched"), color: "text-[var(--success)]" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-2 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] px-5 py-3 shadow-sm"
        >
          <span className={stat.color}>{stat.icon}</span>
          <div className="text-center">
            <div className="text-xl font-extrabold text-[var(--foreground)]">{stat.value}</div>
            <div className="text-xs font-medium text-[var(--muted-foreground)]">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MemoryCard({
  card,
  onClick,
  disabled,
  gridSize,
}: {
  card: CardData;
  onClick: () => void;
  disabled: boolean;
  gridSize: GridSize;
}) {
  const isVisible = card.isFlipped || card.isMatched;
  const sizeClass =
    gridSize === 4
      ? "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 text-4xl sm:text-5xl"
      : gridSize === 6
      ? "h-14 w-14 sm:h-18 sm:w-18 md:h-20 md:w-20 text-2xl sm:text-3xl"
      : "h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 text-xl sm:text-2xl";

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || card.isMatched}
      whileHover={!isVisible && !disabled ? { scale: 1.08, y: -3 } : {}}
      whileTap={!isVisible && !disabled ? { scale: 0.93 } : {}}
      className={cn(
        "relative rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]",
        sizeClass
      )}
      aria-label={isVisible ? card.label : "Hidden card"}
      style={{ perspective: 600 }}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={isVisible ? "front" : "back"}
        variants={cardFlipVariants}
        initial="back"
      >
        {/* Back face */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-[var(--primary)]/40 bg-gradient-to-br from-[var(--primary)]/30 to-[var(--accent)]/30 shadow-md",
            "backface-hidden"
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-2xl select-none">⭐</span>
        </div>
        {/* Front face */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-2xl border-2 shadow-md transition-all duration-300",
            card.isMatched
              ? "border-[var(--success)] bg-[var(--success)]/15 shadow-[0_0_16px_4px_var(--success)] ring-2 ring-[var(--success)]/40"
              : "border-[var(--highlight)]/60 bg-[var(--card)]"
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <span className="select-none">{card.emoji}</span>
        </div>
      </motion.div>
    </motion.button>
  );
}

function CompletionModal({
  moves,
  elapsed,
  pairCount,
  onReplay,
  onChangeDifficulty,
}: {
  moves: number;
  elapsed: number;
  pairCount: number;
  onReplay: () => void;
  onChangeDifficulty: () => void;
}) {
  const t = useTranslations();
  const stars = calcStars(moves, pairCount);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          className="relative z-10 w-full max-w-sm rounded-3xl border-4 border-[var(--highlight)] bg-[var(--card)] p-8 text-center shadow-2xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="mb-4 text-6xl"
            animate={{ rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.15, 1] }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            🎉
          </motion.div>
          <h2 className="mb-1 text-3xl font-extrabold text-[var(--foreground)]">
            {t("memoryChallenge.modal.title")}
          </h2>
          <p className="mb-5 text-[var(--muted-foreground)]">
            {t("memoryChallenge.modal.subtitle")}
          </p>

          {/* Stars */}
          <motion.div
            className="mb-5 flex justify-center gap-2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {[1, 2, 3].map((s) => (
              <motion.div key={s} variants={bounceIn}>
                <Star
                  className={cn(
                    "h-10 w-10 transition-colors",
                    s <= stars
                      ? "fill-[var(--highlight)] text-[var(--highlight)]"
                      : "fill-transparent text-[var(--border)]"
                  )}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[var(--primary)]/10 p-3">
              <div className="text-2xl font-extrabold text-[var(--primary)]">{moves}</div>
              <div className="text-xs text-[var(--muted-foreground)]">{t("memoryChallenge.moves")}</div>
            </div>
            <div className="rounded-2xl bg-[var(--highlight)]/10 p-3">
              <div className="text-2xl font-extrabold text-[var(--highlight)]">{formatTime(elapsed)}</div>
              <div className="text-xs text-[var(--muted-foreground)]">{t("memoryChallenge.time")}</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              onClick={onReplay}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-6 py-3 font-extrabold text-white shadow-md transition-all"
            >
              <RotateCcw className="h-5 w-5" />
              {t("memoryChallenge.modal.playAgain")}
            </motion.button>
            <motion.button
              onClick={onChangeDifficulty}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-2xl border-2 border-[var(--border)] bg-transparent px-6 py-3 font-bold text-[var(--foreground)] transition-all hover:bg-[var(--border)]/20"
            >
              {t("memoryChallenge.modal.changeDifficulty")}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MemoryChallengePage() {
  const t = useTranslations();

  const [gridSize, setGridSize] = useState<GridSize>(4);
  const [cards, setCards] = useState<CardData[]>(() => buildDeck(4));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showDifficultyPanel, setShowDifficultyPanel] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pairCount = (gridSize * gridSize) / 2;

  // Timer
  useEffect(() => {
    if (isRunning && !isComplete) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isComplete]);

  const startNewGame = useCallback((size: GridSize) => {
    setCards(buildDeck(size));
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setElapsed(0);
    setIsRunning(false);
    setIsComplete(false);
    setIsChecking(false);
    setShowDifficultyPanel(false);
  }, []);

  const handleDifficultySelect = useCallback(
    (size: GridSize) => {
      setGridSize(size);
      startNewGame(size);
    },
    [startNewGame]
  );

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (isChecking || isComplete) return;
      const card = cards.find((c) => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return;
      if (flipped.length === 1 && flipped[0] === cardId) return;

      if (!isRunning) setIsRunning(true);

      const newFlipped = [...flipped, cardId];
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
      );

      if (newFlipped.length === 2) {
        setIsChecking(true);
        setMoves((m) => m + 1);

        const [firstId, secondId] = newFlipped;
        const first = cards.find((c) => c.id === firstId);
        const second = cards.find((c) => c.id === secondId);

        if (first && second && first.pairId === second.pairId) {
          // Match!
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true, isFlipped: true }
                  : c
              )
            );
            const newMatched = matched + 1;
            setMatched(newMatched);
            setFlipped([]);
            setIsChecking(false);
            if (newMatched === pairCount) {
              setIsRunning(false);
              setIsComplete(true);
            }
          }, 400);
        } else {
          // No match
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setFlipped([]);
            setIsChecking(false);
          }, 900);
        }
        setFlipped([]);
      } else {
        setFlipped(newFlipped);
      }
    },
    [cards, flipped, isChecking, isComplete, isRunning, matched, pairCount]
  );

  const gridCols =
    gridSize === 4
      ? "grid-cols-4"
      : gridSize === 6
      ? "grid-cols-6"
      : "grid-cols-8";

  const tips = (
    Array.isArray(t.raw("memoryChallenge.tips"))
      ? t.raw("memoryChallenge.tips")
      : []
  ) as { emoji: string; text: string }[];

  return (
    <main className="min-h-screen bg-[var(--background)] pb-16">
      {/* Hero */}
      <Reveal>
        <section className="relative overflow-hidden px-4 pt-10 pb-6 text-center">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-[var(--primary)]/10 via-transparent to-transparent" />
          <motion.div
            className="mb-2 text-6xl"
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            🃏
          </motion.div>
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
            {t("memoryChallenge.hero.title")}
          </h1>
          <p className="mx-auto max-w-md text-lg text-[var(--muted-foreground)]">
            {t("memoryChallenge.hero.subtitle")}
          </p>
        </section>
      </Reveal>

      {/* Difficulty Selector */}
      <Reveal delay={0.08}>
        <section className="px-4 pb-6">
          <div className="mx-auto max-w-2xl">
            <p className="mb-3 text-center text-sm font-bold uppercase tracking-widest text-[var(--muted-foreground)]">
              {t("memoryChallenge.chooseDifficulty")}
            </p>
            <DifficultySelector selected={gridSize} onSelect={handleDifficultySelect} />
          </div>
        </section>
      </Reveal>

      {/* Score / Timer */}
      <Reveal delay={0.12}>
        <section className="px-4 pb-6">
          <div className="mx-auto max-w-2xl">
            <ScoreTimer moves={moves} elapsed={elapsed} matched={matched} total={pairCount} />
          </div>
        </section>
      </Reveal>

      {/* Game Board */}
      <Reveal delay={0.16}>
        <section className="px-2 pb-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center">
            <div
              className={cn(
                "grid gap-2 sm:gap-3",
                gridCols
              )}
            >
              {cards.map((card) => (
                <MemoryCard
                  key={card.id}
                  card={card}
                  onClick={() => handleCardClick(card.id)}
                  disabled={isChecking || isComplete}
                  gridSize={gridSize}
                />
              ))}
            </div>

            {/* Reset button */}
            <motion.button
              onClick={() => startNewGame(gridSize)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="mt-8 flex items-center gap-2 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] px-6 py-3 font-bold text-[var(--foreground)] shadow-sm transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
            >
              <RotateCcw className="h-5 w-5" />
              {t("memoryChallenge.newGame")}
            </motion.button>
          </div>
        </section>
      </Reveal>

      {/* Tips */}
      <Reveal delay={0.2}>
        <section className="px-4 pb-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-4 text-center text-2xl font-extrabold text-[var(--foreground)]">
              {t("memoryChallenge.tipsTitle")}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {tips.map((tip, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.03, y: -2 }}
                  className="flex items-start gap-3 rounded-2xl border-2 border-[var(--border)] bg-[var(--card)] p-4 shadow-sm"
                >
                  <span className="text-2xl">{tip.emoji}</span>
                  <p className="text-sm font-medium text-[var(--foreground)]">{tip.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Completion Modal */}
      {isComplete && (
        <CompletionModal
          moves={moves}
          elapsed={elapsed}
          pairCount={pairCount}
          onReplay={() => startNewGame(gridSize)}
          onChangeDifficulty={() => {
            setIsComplete(false);
            setShowDifficultyPanel(true);
          }}
        />
      )}
    </main>
  );
}