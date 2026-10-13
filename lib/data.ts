export const APP_NAME = "KidZone";
export const APP_TAGLINE = "Play, Learn, and Have Fun Every Day!";

export interface NavLink {
  label: string;
  href: string;
  key: string;
  emoji?: string;
}

export const navLinks: NavLink[] = [
  { label: "Home", href: "/", key: "home", emoji: "🏠" },
  { label: "Mini-Games", href: "/mini-games", key: "miniGames", emoji: "🎮" },
  { label: "Puzzles", href: "/puzzles", key: "puzzles", emoji: "🧩" },
  { label: "Coloring", href: "/coloring", key: "coloring", emoji: "🎨" },
  { label: "Memory Challenge", href: "/memory-challenge", key: "memoryChallenge", emoji: "🧠" },
];

export interface Activity {
  id: string;
  title: string;
  emoji: string;
  description: string;
  href: string;
  color: string;
  bgColor: string;
}

export const BRAND_COLORS = {
  primary: "#FF6B6B",
  accent: "#4D96FF",
  success: "#6BCB77",
  highlight: "#CC5DE8",
  orange: "#FF922B",
  yellow: "#FFD93D",
} as const;