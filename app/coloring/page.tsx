"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/Reveal";
import { motion, type Variants } from "framer-motion";
import { bounceIn, staggerContainer } from "@/lib/motion";
import { Download, Eraser, Paintbrush, RotateCcw, Palette } from 'lucide-react';
import { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#FF4B6E", "#FF8C42", "#FFD166", "#06D6A0",
  "#118AB2", "#7B2FBE", "#F72585", "#4CC9F0",
  "#FF6B6B", "#FFBE0B", "#8AC926", "#3A86FF",
  "#FB5607", "#FF006E", "#8338EC", "#FFFFFF",
  "#000000", "#6B7280",
];

const BRUSH_SIZES = [4, 8, 14, 22, 32];

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const [color, setColor] = useState("#FF4B6E");
  const [brushSize, setBrushSize] = useState(8);
  const [isEraser, setIsEraser] = useState(false);

  const getPos = (e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current = getPos(e, canvas);
  }, []);

  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      e.preventDefault();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pos = getPos(e, canvas);
      ctx.beginPath();
      ctx.moveTo(lastPos.current?.x ?? pos.x, lastPos.current?.y ?? pos.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = isEraser ? "#FFFBF0" : color;
      ctx.lineWidth = isEraser ? brushSize * 2.5 : brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      lastPos.current = pos;
    },
    [color, brushSize, isEraser]
  );

  const stopDraw = useCallback(() => {
    isDrawing.current = false;
    lastPos.current = null;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFBF0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const saveCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "my-kidzone-art.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#FFFBF0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);
    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDraw);
    return () => {
      canvas.removeEventListener("mousedown", startDraw);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDraw);
      canvas.removeEventListener("mouseleave", stopDraw);
      canvas.removeEventListener("touchstart", startDraw);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  return { canvasRef, color, setColor, brushSize, setBrushSize, isEraser, setIsEraser, clearCanvas, saveCanvas };
}

export default function ColoringPage() {
  const t = useTranslations();
  const {
    canvasRef,
    color,
    setColor,
    brushSize,
    setBrushSize,
    isEraser,
    setIsEraser,
    clearCanvas,
    saveCanvas,
  } = useCanvas();

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveCanvas();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] pb-16">
      {/* Hero */}
      <Reveal>
        <section className="relative overflow-hidden bg-gradient-to-br from-[var(--success)]/20 via-[var(--highlight)]/15 to-[var(--primary)]/20 py-10 text-center">
          <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
            {["🌈", "🎨", "✏️", "🖌️", "⭐", "🌟"].map((em, i) => (
              <motion.span
                key={i}
                className="absolute text-3xl"
                style={{
                  top: `${10 + (i * 15) % 70}%`,
                  left: `${5 + (i * 17) % 90}%`,
                }}
                animate={{ y: [0, -12, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
              >
                {em}
              </motion.span>
            ))}
          </div>
          <div className="relative z-10 mx-auto max-w-2xl px-4">
            <motion.div
              variants={bounceIn}
              initial="hidden"
              animate="visible"
              className="mb-3 inline-block rounded-full bg-[var(--success)]/20 px-5 py-2 text-sm font-bold text-[var(--success)] border border-[var(--success)]/30"
            >
              {t("coloring.badge")}
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight leading-tight mb-3">
              {t("coloring.hero.title")}
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {t("coloring.hero.subtitle")}
            </p>
          </div>
        </section>
      </Reveal>

      {/* Main Drawing Area */}
      <section className="mx-auto max-w-7xl px-4 mt-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">

          {/* Left Panel: Color Palette + Tools */}
          <motion.aside
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-64 flex flex-col gap-4"
          >
            {/* Color Palette */}
            <div className="rounded-3xl border-4 border-[var(--primary)]/30 bg-white/80 backdrop-blur-sm p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                <span className="font-extrabold text-[var(--foreground)] text-base">{t("coloring.palette.title")}</span>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-6 gap-2"
              >
                {PRESET_COLORS.map((c) => (
                  <motion.button
                    key={c}
                    variants={bounceIn}
                    onClick={() => { setColor(c); setIsEraser(false); }}
                    className={cn(
                      "h-9 w-9 rounded-full border-4 transition-transform duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]",
                      color === c && !isEraser
                        ? "border-[var(--foreground)] scale-110 shadow-lg"
                        : "border-white shadow-sm hover:scale-110"
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`${t("coloring.palette.colorLabel")} ${c}`}
                    whileHover={{ scale: 1.18 }}
                    whileTap={{ scale: 0.92 }}
                  />
                ))}
              </motion.div>
              {/* Custom color picker */}
              <div className="mt-4 flex items-center gap-3">
                <label htmlFor="custom-color" className="text-sm font-bold text-[var(--muted-foreground)]">
                  {t("coloring.palette.custom")}
                </label>
                <input
                  id="custom-color"
                  type="color"
                  value={color}
                  onChange={(e) => { setColor(e.target.value); setIsEraser(false); }}
                  className="h-10 w-10 rounded-full border-2 border-[var(--border)] cursor-pointer bg-transparent"
                />
              </div>
            </div>

            {/* Brush Size */}
            <div className="rounded-3xl border-4 border-[var(--highlight)]/30 bg-white/80 backdrop-blur-sm p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-2 mb-4">
                <Paintbrush className="h-5 w-5 text-[var(--highlight)]" aria-hidden="true" />
                <span className="font-extrabold text-[var(--foreground)] text-base">{t("coloring.tools.brushTitle")}</span>
              </div>
              <div className="flex items-center gap-2 mb-3">
                {BRUSH_SIZES.map((size) => (
                  <motion.button
                    key={size}
                    onClick={() => setBrushSize(size)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "flex items-center justify-center rounded-full border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--highlight)]",
                      brushSize === size
                        ? "border-[var(--highlight)] bg-[var(--highlight)]/20"
                        : "border-[var(--border)] bg-white"
                    )}
                    style={{ width: 36, height: 36 }}
                    aria-label={`${t("coloring.tools.brushSize")} ${size}`}
                  >
                    <span
                      className="rounded-full bg-[var(--foreground)]"
                      style={{ width: Math.min(size, 24), height: Math.min(size, 24) }}
                    />
                  </motion.button>
                ))}
              </div>
              <input
                type="range"
                min={2}
                max={40}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-[var(--highlight)]"
                aria-label={t("coloring.tools.brushSlider")}
              />
              <div className="mt-1 text-xs text-[var(--muted-foreground)] text-right">{brushSize}px</div>
            </div>

            {/* Eraser + Clear */}
            <div className="rounded-3xl border-4 border-[var(--accent)]/30 bg-white/80 backdrop-blur-sm p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
              <span className="font-extrabold text-[var(--foreground)] text-base block mb-3">{t("coloring.tools.actionsTitle")}</span>
              <div className="flex flex-col gap-3">
                <motion.button
                  onClick={() => setIsEraser((v) => !v)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "flex items-center gap-2 rounded-2xl border-2 px-4 py-3 font-bold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                    isEraser
                      ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-md"
                      : "bg-white border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
                  )}
                >
                  <Eraser className="h-4 w-4" aria-hidden="true" />
                  {isEraser ? t("coloring.tools.eraserOn") : t("coloring.tools.eraserOff")}
                </motion.button>
                <motion.button
                  onClick={clearCanvas}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 rounded-2xl border-2 border-[var(--border)] bg-white px-4 py-3 font-bold text-sm text-[var(--foreground)] hover:border-red-400 hover:text-red-500 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  {t("coloring.tools.clear")}
                </motion.button>
              </div>
            </div>
          </motion.aside>

          {/* Canvas */}
          <Reveal className="flex-1 w-full">
            <div className="relative rounded-3xl border-4 border-[var(--primary)]/40 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden">
              {/* Current color indicator */}
              <div className="flex items-center gap-3 px-5 py-3 border-b-2 border-[var(--border)] bg-[var(--card)]/60">
                <span className="text-sm font-bold text-[var(--muted-foreground)]">{t("coloring.canvas.currentColor")}</span>
                <span
                  className="h-7 w-7 rounded-full border-2 border-[var(--border)] shadow-sm"
                  style={{ backgroundColor: isEraser ? "#FFFBF0" : color }}
                />
                <span className="text-xs text-[var(--muted-foreground)] font-mono">{isEraser ? t("coloring.canvas.erasing") : color}</span>
                <span className="ml-auto text-xs text-[var(--muted-foreground)]">{t("coloring.canvas.hint")}</span>
              </div>
              <canvas
                ref={canvasRef}
                width={900}
                height={600}
                className="block w-full touch-none"
                style={{ cursor: isEraser ? "cell" : "crosshair", background: "#FFFBF0" }}
                aria-label={t("coloring.canvas.ariaLabel")}
              />
            </div>
          </Reveal>

          {/* Right Panel: Save + Tips */}
          <motion.aside
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="w-full lg:w-56 flex flex-col gap-4"
          >
            {/* Save / Download */}
            <div className="rounded-3xl border-4 border-[var(--success)]/30 bg-white/80 backdrop-blur-sm p-5 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
              <span className="font-extrabold text-[var(--foreground)] text-base block mb-3">{t("coloring.save.title")}</span>
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 font-extrabold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--success)] shadow-md",
                  saved
                    ? "bg-[var(--success)] text-white"
                    : "bg-gradient-to-r from-[var(--success)] to-[var(--highlight)] text-white hover:opacity-90"
                )}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {saved ? t("coloring.save.saved") : t("coloring.save.download")}
              </motion.button>
              <p className="mt-3 text-xs text-[var(--muted-foreground)] leading-relaxed">
                {t("coloring.save.hint")}
              </p>
            </div>

            {/* Fun Tips */}
            <div className="rounded-3xl border-4 border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <span className="font-extrabold text-[var(--foreground)] text-base block mb-3">
                {t("coloring.tips.title")}
              </span>
              <ul className="space-y-2">
                {(Array.isArray((t as unknown as { raw: (k: string) => unknown }).raw("coloring.tips.items"))
                  ? (t as unknown as { raw: (k: string) => unknown }).raw("coloring.tips.items") as { emoji: string; text: string }[]
                  : []
                ).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--foreground)] leading-relaxed">
                    <span className="text-base leading-none mt-0.5">{tip.emoji}</span>
                    <span>{tip.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Star reward */}
            <motion.div
              variants={bounceIn}
              initial="hidden"
              animate="visible"
              className="rounded-3xl border-4 border-[var(--highlight)]/40 bg-[var(--highlight)]/10 p-5 text-center shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
            >
              <div className="text-4xl mb-2">⭐</div>
              <p className="font-extrabold text-[var(--foreground)] text-sm">{t("coloring.reward.title")}</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">{t("coloring.reward.desc")}</p>
            </motion.div>
          </motion.aside>
        </div>
      </section>

      {/* Inspiration Gallery */}
      <Reveal>
        <section className="mx-auto max-w-5xl px-4 mt-14">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-[var(--foreground)] tracking-tight">{t("coloring.gallery.title")}</h2>
            <p className="text-[var(--muted-foreground)] mt-2">{t("coloring.gallery.subtitle")}</p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-5"
          >
            {(Array.isArray((t as unknown as { raw: (k: string) => unknown }).raw("coloring.gallery.items"))
              ? (t as unknown as { raw: (k: string) => unknown }).raw("coloring.gallery.items") as { emoji: string; label: string; color: string }[]
              : []
            ).map((item, i) => (
              <motion.div
                key={i}
                variants={bounceIn}
                whileHover={{ scale: 1.04, rotate: i % 2 === 0 ? 1.5 : -1.5 }}
                className="rounded-3xl border-4 border-white bg-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.10)] p-6 flex flex-col items-center gap-3 cursor-pointer"
                style={{ borderColor: item.color + "60" }}
              >
                <span className="text-6xl">{item.emoji}</span>
                <span className="font-extrabold text-[var(--foreground)] text-sm text-center">{item.label}</span>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ backgroundColor: item.color + "25", color: item.color }}
                >
                  {t("coloring.gallery.drawIt")}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </Reveal>

      {/* CTA Banner */}
      <Reveal>
        <section className="mx-auto max-w-3xl px-4 mt-14">
          <div className="rounded-3xl bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] p-8 text-center shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
            <div className="text-5xl mb-3">🎨</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{t("coloring.cta.title")}</h2>
            <p className="text-white/80 mb-5 text-base">{t("coloring.cta.subtitle")}</p>
            <motion.button
              onClick={clearCanvas}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3 font-extrabold text-[var(--primary)] shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white text-base"
            >
              <Paintbrush className="h-5 w-5" aria-hidden="true" />
              {t("coloring.cta.button")}
            </motion.button>
          </div>
        </section>
      </Reveal>
    </main>
  );
}