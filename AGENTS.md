# AGENTS.md

Project conventions for AI agents and humans editing this codebase.

## Original request
Build a fun website for kids featuring mini-games, puzzles, coloring activities, memory challenges, and cartoon characters. Use a vibrant background, large buttons, playful animations, and an intuitive layout that's easy for children to explore.

## Goal
Build a vibrant, child-friendly KidZone website with an animated activity hub homepage, mini-games, drag-and-drop puzzles, a canvas coloring page, and a memory card challenge — all client-side with Framer Motion animations and a playful cartoon aesthetic.

## Project type
e-commerce

## Design system — match this exactly
- Color tokens: `--background: #FFF9EC`, `--foreground: #1A1A2E`, `--card: #FFFFFF`, `--border: #FFD93D`, `--muted-foreground: #5A5A7A`, `--primary: #FF6B6B`, `--accent: #4D96FF`

## Existing components — reuse these, don't create near-duplicates
- Footer (components/Footer.tsx)
- LanguageToggle (components/LanguageToggle.tsx)
- LocaleProvider (components/LocaleProvider.tsx)
- Navbar (components/Navbar.tsx)

## Existing i18n namespaces
Every translation key must be namespaced (`hero.title`, never a bare `title`) so two components never collide on the same catalog slot. Reuse one of these, or pick a new, distinct name:
`canvas-area`, `character-mascot`, `coloring`, `coloring-header`, `footer`, `hero`, `home`, `hub`, `memory-header`, `memoryChallenge`, `mini-games-header`, `miniGames`, `nav`, `puzzles`, `puzzles-header`, `sound-toggle`

When editing or adding pages: preserve the design system above, reuse existing components and the shared nav data file, and keep the established structure and tone.
