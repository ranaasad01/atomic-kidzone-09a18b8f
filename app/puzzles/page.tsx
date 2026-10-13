"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Star, RefreshCw, Trophy, ChevronRight, Puzzle } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { bounceIn, staggerContainer, scaleIn } from "@/lib/motion";

// ─── Types ───────────────────────────────────────────────────────────────────

type Difficulty = "easy" | "medium" | "hard";

interface PuzzleDef {
  id: string;
  title: string;
  emoji: string;
  image: string;
  alt: string;
  theme: string;
  bgFrom: string;
  bgTo: string;
  border: string;
}

interface DifficultyConfig {
  difficulty: Difficulty;
  label: string;
  emoji: string;
  grid: number;
  stars: number;
}

interface PuzzlePiece {
  id: number;
  correctIndex: number;
  currentIndex: number;
  placed: boolean;
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const PUZZLES: PuzzleDef[] = [
  {
    id: "rocket",
    title: "Space Rocket",
    emoji: "🚀",
    image: "https://titoaistorageaccount.blob.core.windows.net/titoai-storage/site-images/528113472490423f9a70a834e8de7e6a.jpg",
    alt: "Rocket",
    theme: "Blast off into space!",
    bgFrom: "#e0e7ff",
    bgTo: "#c7d2fe",
    border: "border-indigo-300",
  },
  {
    id: "dolphin",
    title: "Friendly Dolphin",
    emoji: "🐬",
    image: "https://titoaistorageaccount.blob.core.windows.net/titoai-storage/site-images/c04753b522e247428dea1fdb4b48215d.jpg",
    alt: "Dolphin",
    theme: "Dive into the ocean!",
    bgFrom: "#cffafe",
    bgTo: "#a5f3fc",
    border: "border-cyan-300",
  },
  {
    id: "birthday-cake",
    title: "Birthday Cake",
    emoji: "🎂",
    image: "https://titoaistorageaccount.blob.core.windows.net/titoai-storage/site-images/ffa977f6ef174ffba8109d8fdec3877f.jpg",
    alt: "Birthday cake",
    theme: "Celebrate with cake!",
    bgFrom: "#fce7f3",
    bgTo: "#fbcfe8",
    border: "border-pink-300",
  },
  {
    id: "red-panda",
    title: "Red Panda",
    emoji: "🐼",
    image: "https://titoaistorageaccount.blob.core.windows.net/titoai-storage/site-images/51fc959ce3504b58a6f10bf6eda021e5.jpg",
    alt: "Red panda",
    theme: "Meet the fluffy panda!",
    bgFrom: "#fef3c7",
    bgTo: "#fde68a",
    border: "border-amber-300",
  },
];

const DIFFICULTY_CONFIGS: DifficultyConfig[] = [
  { difficulty: "easy", label: "Easy", emoji: "🐢", grid: 3, stars: 1 },
  { difficulty: "medium", label: "Medium", emoji: "🐇", grid: 4, stars: 2 },
  { difficulty: "hard", label: "Hard", emoji: "🦁", grid: 5, stars: 3 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildPieces(total: number): PuzzlePiece[] {
  const indices = shuffle(Array.from({ length: total }, (_, i) => i));
  return indices.map((correctIndex, currentIndex) => ({
    id: correctIndex,
    correctIndex,
    currentIndex,
    placed: false,
  }));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.04, y: -4, transition: { duration: 0.22, ease: "easeOut" } },
};

function PuzzleCard({
  puzzle,
  onSelect,
}: {
  puzzle: PuzzleDef;
  onSelect: (p: PuzzleDef) => void;
}) {
  return (
    <motion.button
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(puzzle)}
      className={`relative w-full rounded-3xl border-4 ${puzzle.border} overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.10)] focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)] transition-shadow`}
      style={{ background: `linear-gradient(135deg, ${puzzle.bgFrom}, ${puzzle.bgTo})` }}
      aria-label={`Select ${puzzle.title} puzzle`}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={puzzle.image}
          alt={puzzle.alt}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='48'%3E" +
              encodeURIComponent(puzzle.emoji) +
              "%3C/text%3E%3C/svg%3E";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>
      <div className="p-4 text-left">
        <p className="text-2xl">{puzzle.emoji}</p>
        <h3 className="mt-1 text-lg font-extrabold text-gray-800 leading-tight">
          {puzzle.title}
        </h3>
        <p className="mt-0.5 text-sm text-gray-600">{puzzle.theme}</p>
        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-gray-500">
          <ChevronRight className="h-4 w-4" />
          Tap to play
        </div>
      </div>
    </motion.button>
  );
}

function DifficultyPill({
  config,
  active,
  onSelect,
}: {
  config: DifficultyConfig;
  active: boolean;
  onSelect: (d: Difficulty) => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onSelect(config.difficulty)}
      className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold border-2 transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)] ${
        active
          ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-[0_4px_14px_rgba(0,0,0,0.18)]"
          : "bg-white/80 text-gray-700 border-gray-200 hover:border-[var(--primary)]"
      }`}
    >
      <span className="text-base">{config.emoji}</span>
      {config.label}
      {active && (
        <span className="ml-1 flex gap-0.5">
          {Array.from({ length: config.stars }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-yellow-300 text-yellow-300" />
          ))}
        </span>
      )}
    </motion.button>
  );
}

function ProgressBar({ placed, total }: { placed: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((placed / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-sm font-bold text-gray-700">
        <span>
          {placed} / {total} pieces placed
        </span>
        <span>{pct}%</span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200 border border-gray-300">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, var(--primary), var(--accent))" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function CompletionModal({
  puzzle,
  difficulty,
  onReplay,
  onBack,
}: {
  puzzle: PuzzleDef;
  difficulty: DifficultyConfig;
  onReplay: () => void;
  onBack: () => void;
}) {
  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };
  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.7, y: 40 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 280, damping: 20 },
    },
  };
  const starVariants: Variants = {
    hidden: { opacity: 0, scale: 0, rotate: -30 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { delay: 0.3 + i * 0.15, type: "spring", stiffness: 300, damping: 14 },
    }),
  };

  return (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Puzzle complete!"
    >
      <motion.div
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] border-4 border-yellow-300"
      >
        {/* Confetti dots */}
        {["top-4 left-6", "top-6 right-8", "bottom-8 left-10", "bottom-6 right-6"].map(
          (pos, i) => (
            <motion.div
              key={i}
              className={`absolute ${pos} h-3 w-3 rounded-full`}
              style={{
                background: ["#f59e0b", "#ec4899", "#6366f1", "#10b981"][i],
              }}
              animate={{ y: [0, -8, 0], rotate: [0, 180, 360] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          )
        )}

        <motion.div
          animate={{ rotate: [0, -10, 10, -6, 6, 0] }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl"
        >
          🏆
        </motion.div>

        <h2 className="mt-3 text-3xl font-extrabold text-gray-800">You did it!</h2>
        <p className="mt-1 text-gray-500 font-medium">
          {puzzle.title} puzzle complete!
        </p>

        <div className="mt-5 flex justify-center gap-3">
          {Array.from({ length: difficulty.stars }).map((_, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={starVariants}
              initial="hidden"
              animate="visible"
            >
              <Star className="h-10 w-10 fill-yellow-400 text-yellow-400 drop-shadow-md" />
            </motion.div>
          ))}
        </div>

        <p className="mt-3 text-sm font-semibold text-gray-500">
          {difficulty.emoji} {difficulty.label} mode
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onReplay}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-6 py-3 text-base font-extrabold text-white shadow-md hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]"
          >
            <RefreshCw className="h-4 w-4" />
            Play Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onBack}
            className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-6 py-3 text-base font-bold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-400"
          >
            Choose Another Puzzle
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Puzzle Canvas ────────────────────────────────────────────────────────────

function PuzzleCanvas({
  puzzle,
  difficulty,
  onComplete,
}: {
  puzzle: PuzzleDef;
  difficulty: DifficultyConfig;
  onComplete: () => void;
}) {
  const grid = difficulty.grid;
  const total = grid * grid;

  const [pieces, setPieces] = useState<PuzzlePiece[]>(() => buildPieces(total));
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // Touch drag state
  const touchPieceRef = useRef<number | null>(null);
  const touchGhostRef = useRef<HTMLDivElement | null>(null);

  const placedCount = pieces.filter((p) => p.placed).length;

  useEffect(() => {
    if (placedCount === total) {
      const t = setTimeout(onComplete, 600);
      return () => clearTimeout(t);
    }
  }, [placedCount, total, onComplete]);

  // Reset when difficulty/puzzle changes
  useEffect(() => {
    setPieces(buildPieces(total));
    setDraggedId(null);
    setHoveredSlot(null);
  }, [total, puzzle.id]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, pieceId: number) => {
      const piece = pieces.find((p) => p.id === pieceId);
      if (!piece || piece.placed) return;
      setDraggedId(pieceId);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(pieceId));
    },
    [pieces]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, slotIndex: number) => {
      e.preventDefault();
      const pieceId = parseInt(e.dataTransfer.getData("text/plain"), 10);
      setPieces((prev) =>
        prev.map((p) => {
          if (p.id === pieceId && p.correctIndex === slotIndex) {
            return { ...p, placed: true };
          }
          return p;
        })
      );
      setDraggedId(null);
      setHoveredSlot(null);
    },
    []
  );

  const handleDragOver = useCallback((e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setHoveredSlot(slotIndex);
  }, []);

  const handleDragLeave = useCallback(() => {
    setHoveredSlot(null);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent, pieceId: number) => {
      const piece = pieces.find((p) => p.id === pieceId);
      if (!piece || piece.placed) return;
      touchPieceRef.current = pieceId;

      const ghost = document.createElement("div");
      ghost.style.cssText = `
        position:fixed;width:60px;height:60px;border-radius:8px;
        background:rgba(99,102,241,0.7);pointer-events:none;z-index:9999;
        display:flex;align-items:center;justify-content:center;
        font-size:24px;color:white;font-weight:bold;
      `;
      ghost.textContent = String(pieceId + 1);
      document.body.appendChild(ghost);
      touchGhostRef.current = ghost;

      const touch = e.touches[0];
      ghost.style.left = `${touch.clientX - 30}px`;
      ghost.style.top = `${touch.clientY - 30}px`;
    },
    [pieces]
  );

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (touchPieceRef.current === null) return;
    const touch = e.touches[0];
    if (touchGhostRef.current) {
      touchGhostRef.current.style.left = `${touch.clientX - 30}px`;
      touchGhostRef.current.style.top = `${touch.clientY - 30}px`;
    }
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = el?.closest("[data-slot]");
    if (slot) {
      setHoveredSlot(parseInt(slot.getAttribute("data-slot") ?? "-1", 10));
    } else {
      setHoveredSlot(null);
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchGhostRef.current) {
        document.body.removeChild(touchGhostRef.current);
        touchGhostRef.current = null;
      }
      const pieceId = touchPieceRef.current;
      touchPieceRef.current = null;
      if (pieceId === null) return;

      const touch = e.changedTouches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const slot = el?.closest("[data-slot]");
      if (!slot) { setHoveredSlot(null); return; }
      const slotIndex = parseInt(slot.getAttribute("data-slot") ?? "-1", 10);
      if (slotIndex < 0) { setHoveredSlot(null); return; }

      setPieces((prev) =>
        prev.map((p) => {
          if (p.id === pieceId && p.correctIndex === slotIndex) {
            return { ...p, placed: true };
          }
          return p;
        })
      );
      setHoveredSlot(null);
    },
    []
  );

  const unplacedPieces = pieces.filter((p) => !p.placed);
  const pieceSize = Math.min(Math.floor(280 / grid), 80);

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <ProgressBar placed={placedCount} total={total} />

      {/* Puzzle board */}
      <div className="relative rounded-2xl overflow-hidden border-4 border-[var(--primary)] shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${grid}, ${pieceSize}px)`,
            gridTemplateRows: `repeat(${grid}, ${pieceSize}px)`,
            width: pieceSize * grid,
            height: pieceSize * grid,
          }}
        >
          {Array.from({ length: total }).map((_, slotIndex) => {
            const row = Math.floor(slotIndex / grid);
            const col = slotIndex % grid;
            const placedPiece = pieces.find(
              (p) => p.placed && p.correctIndex === slotIndex
            );
            const isHovered = hoveredSlot === slotIndex;

            return (
              <div
                key={slotIndex}
                data-slot={slotIndex}
                onDrop={(e) => handleDrop(e, slotIndex)}
                onDragOver={(e) => handleDragOver(e, slotIndex)}
                onDragLeave={handleDragLeave}
                className={`relative border border-white/30 transition-all duration-150 ${
                  isHovered && !placedPiece
                    ? "ring-4 ring-yellow-400 ring-inset brightness-110"
                    : ""
                }`}
                style={{ width: pieceSize, height: pieceSize }}
              >
                {placedPiece ? (
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="absolute inset-0 overflow-hidden"
                  >
                    <img
                      src={puzzle.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute"
                      style={{
                        width: pieceSize * grid,
                        height: pieceSize * grid,
                        left: -(col * pieceSize),
                        top: -(row * pieceSize),
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-green-400/20 flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring" }}
                      >
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow" />
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-400"
                    style={{
                      background: `linear-gradient(135deg, ${puzzle.bgFrom}88, ${puzzle.bgTo}88)`,
                    }}
                  >
                    {slotIndex + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Piece tray */}
      {unplacedPieces.length > 0 && (
        <div className="w-full">
          <p className="mb-2 text-center text-sm font-bold text-gray-600">
            Drag pieces to the matching numbered slot!
          </p>
          <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white/60 border-2 border-gray-200 p-3 min-h-[80px]">
            {unplacedPieces.map((piece) => {
              const row = Math.floor(piece.correctIndex / grid);
              const col = piece.correctIndex % grid;
              const isDragging = draggedId === piece.id;

              return (
                <motion.div
                  key={piece.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, piece.id)}
                  onDragEnd={() => setDraggedId(null)}
                  onTouchStart={(e) => handleTouchStart(e, piece.id)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  whileHover={{ scale: 1.1, y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ opacity: isDragging ? 0.4 : 1 }}
                  className="relative cursor-grab active:cursor-grabbing overflow-hidden rounded-xl border-2 border-[var(--primary)] shadow-md select-none"
                  style={{ width: pieceSize, height: pieceSize, flexShrink: 0 }}
                  title={`Piece ${piece.correctIndex + 1}`}
                >
                  <img
                    src={puzzle.image}
                    alt={`Puzzle piece ${piece.correctIndex + 1}`}
                    className="absolute pointer-events-none"
                    style={{
                      width: pieceSize * grid,
                      height: pieceSize * grid,
                      left: -(col * pieceSize),
                      top: -(row * pieceSize),
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute bottom-0 right-0 bg-black/50 text-white text-[10px] font-bold px-1 rounded-tl-md">
                    {piece.correctIndex + 1}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {unplacedPieces.length === 0 && placedCount < total && (
        <p className="text-center text-sm font-bold text-green-600 animate-pulse">
          Almost there! Keep going!
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PuzzlesPage() {
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleDef | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [gameKey, setGameKey] = useState(0);
  const [completed, setCompleted] = useState(false);

  const activeDifficulty = DIFFICULTY_CONFIGS.find((d) => d.difficulty === difficulty)!;

  const handleSelectPuzzle = (puzzle: PuzzleDef) => {
    setSelectedPuzzle(puzzle);
    setCompleted(false);
    setGameKey((k) => k + 1);
  };

  const handleComplete = () => setCompleted(true);

  const handleReplay = () => {
    setCompleted(false);
    setGameKey((k) => k + 1);
  };

  const handleBack = () => {
    setSelectedPuzzle(null);
    setCompleted(false);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] pb-16">
      {/* Hero */}
      <Reveal>
        <section className="relative overflow-hidden px-4 pt-10 pb-8 text-center">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.13) 0%, transparent 70%)",
            }}
          />
          <motion.div
            animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 4 }}
            className="inline-block text-6xl"
          >
            🧩
          </motion.div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Puzzle Time!
          </h1>
          <p className="mx-auto mt-2 max-w-md text-base text-[var(--muted-foreground)] font-medium">
            Pick a picture, choose your challenge level, and drag the pieces into place. Can you solve them all?
          </p>
        </section>
      </Reveal>

      <div className="mx-auto max-w-3xl px-4">
        {!selectedPuzzle ? (
          <>
            {/* Difficulty selector */}
            <Reveal delay={0.05}>
              <section className="mb-8">
                <h2 className="mb-3 text-center text-lg font-extrabold text-[var(--foreground)]">
                  Choose Your Challenge Level
                </h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {DIFFICULTY_CONFIGS.map((cfg) => (
                    <DifficultyPill
                      key={cfg.difficulty}
                      config={cfg}
                      active={difficulty === cfg.difficulty}
                      onSelect={setDifficulty}
                    />
                  ))}
                </div>
                <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
                  {activeDifficulty.emoji} {activeDifficulty.label}: {activeDifficulty.grid}×{activeDifficulty.grid} grid ({activeDifficulty.grid * activeDifficulty.grid} pieces)
                </p>
              </section>
            </Reveal>

            {/* Puzzle selector grid */}
            <Reveal delay={0.1}>
              <section>
                <h2 className="mb-4 text-center text-lg font-extrabold text-[var(--foreground)]">
                  Pick a Puzzle
                </h2>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 gap-4 sm:grid-cols-4"
                >
                  {PUZZLES.map((puzzle) => (
                    <motion.div key={puzzle.id} variants={bounceIn}>
                      <PuzzleCard puzzle={puzzle} onSelect={handleSelectPuzzle} />
                    </motion.div>
                  ))}
                </motion.div>
              </section>
            </Reveal>

            {/* Tips */}
            <Reveal delay={0.15}>
              <section className="mt-10 rounded-3xl border-2 border-dashed border-[var(--primary)]/40 bg-[var(--primary)]/5 p-6">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💡</span>
                  <div>
                    <h3 className="font-extrabold text-[var(--foreground)]">How to Play</h3>
                    <ul className="mt-2 space-y-1 text-sm text-[var(--muted-foreground)]">
                      <li>🖱️ On desktop: drag pieces from the tray to the matching numbered slot.</li>
                      <li>👆 On mobile: touch and drag pieces to the board.</li>
                      <li>⭐ Each piece has a number showing where it belongs.</li>
                      <li>🏆 Complete the puzzle to earn stars!</li>
                    </ul>
                  </div>
                </div>
              </section>
            </Reveal>
          </>
        ) : (
          <>
            {/* Back button + puzzle header */}
            <Reveal>
              <section className="mb-6 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <motion.button
                  whileHover={{ scale: 1.04, x: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleBack}
                  className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]"
                >
                  ← Back to Puzzles
                </motion.button>

                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedPuzzle.emoji}</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-[var(--foreground)]">
                      {selectedPuzzle.title}
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {activeDifficulty.emoji} {activeDifficulty.label} mode
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {DIFFICULTY_CONFIGS.map((cfg) => (
                    <motion.button
                      key={cfg.difficulty}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => {
                        setDifficulty(cfg.difficulty);
                        setCompleted(false);
                        setGameKey((k) => k + 1);
                      }}
                      className={`rounded-full px-3 py-1 text-xs font-bold border-2 transition-all ${
                        difficulty === cfg.difficulty
                          ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[var(--primary)]"
                      }`}
                    >
                      {cfg.emoji} {cfg.label}
                    </motion.button>
                  ))}
                </div>
              </section>
            </Reveal>

            {/* Canvas */}
            <Reveal delay={0.05}>
              <section className="rounded-3xl border-2 border-gray-100 bg-white/80 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
                <PuzzleCanvas
                  key={`${selectedPuzzle.id}-${difficulty}-${gameKey}`}
                  puzzle={selectedPuzzle}
                  difficulty={activeDifficulty}
                  onComplete={handleComplete}
                />
              </section>
            </Reveal>

            {/* Shuffle button */}
            <Reveal delay={0.1}>
              <div className="mt-4 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReplay}
                  className="flex items-center gap-2 rounded-2xl bg-[var(--primary)] px-6 py-3 text-sm font-extrabold text-white shadow-md hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--primary)]"
                >
                  <RefreshCw className="h-4 w-4" />
                  Shuffle &amp; Restart
                </motion.button>
              </div>
            </Reveal>
          </>
        )}
      </div>

      {/* Completion modal */}
      <AnimatePresence>
        {completed && selectedPuzzle && (
          <CompletionModal
            puzzle={selectedPuzzle}
            difficulty={activeDifficulty}
            onReplay={handleReplay}
            onBack={handleBack}
          />
        )}
      </AnimatePresence>
    </main>
  );
}